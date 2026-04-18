import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useGame } from '../../context/GameContext';
import { RefreshCcw, Trophy, Brain, History, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ChessGame: React.FC = () => {
  const { addCoins } = useGame();
  
  // PRIMARY ENGINE STATE: Use a ref for the Chess engine to avoid closure staleness
  // Use a state for FEN to trigger board re-renders
  const engine = useRef(new Chess());
  const [fen, setFen] = useState(engine.current.fen());
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<any>({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('medium');

  const updateGameState = useCallback(() => {
    setFen(engine.current.fen());
    setTurn(engine.current.turn());
    
    if (engine.current.isGameOver()) {
      setIsGameOver(true);
      if (engine.current.isCheckmate()) {
        const winColor = engine.current.turn() === 'b' ? 'White' : 'Black';
        setWinner(winColor);
        if (winColor === 'White') addCoins(3000);
      } else {
        setWinner('Draw');
      }
    }
  }, [addCoins]);

  const makeMove = useCallback((move: any) => {
    try {
      const result = engine.current.move(move);
      if (result) {
        setHistory(prev => [...prev, result.san].slice(-20));
        updateGameState();
        setSelectedSquare(null);
        setOptionSquares({});
        return result;
      }
    } catch (e) {
      // Illegal move
    }
    return null;
  }, [updateGameState]);

  const onPieceDrop = (source: Square, target: Square) => {
    if (engine.current.turn() !== 'w' || isGameOver) return false;
    const result = makeMove({ from: source, to: target, promotion: 'q' });
    return !!result;
  };

  const getMoveOptions = (square: Square) => {
    const moves = engine.current.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares: any = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: engine.current.get(move.to as Square)
          ? 'radial-gradient(circle, rgba(255,0,0,0.2) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(255,255,255,0.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
    setOptionSquares(newSquares);
  };

  const onSquareClick = (square: Square) => {
    if (engine.current.turn() !== 'w' || isGameOver) return;

    if (selectedSquare) {
      const result = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (result) return;
      
      const piece = engine.current.get(square);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        getMoveOptions(square);
      } else {
        setSelectedSquare(null);
        setOptionSquares({});
      }
    } else {
      const piece = engine.current.get(square);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        getMoveOptions(square);
      }
    }
  };

  // Bot Logic
  useEffect(() => {
    if (turn === 'b' && !isGameOver) {
      const timer = setTimeout(() => {
        const moves = engine.current.moves();
        if (moves.length > 0) {
          let selectedMove = moves[Math.floor(Math.random() * moves.length)];
          if (difficulty === 'medium') {
            const captures = moves.filter(m => m.includes('x'));
            if (captures.length > 0) selectedMove = captures[Math.floor(Math.random() * captures.length)];
            const checks = moves.filter(m => m.includes('+'));
            if (checks.length > 0 && Math.random() > 0.5) selectedMove = checks[Math.floor(Math.random() * checks.length)];
          }
          makeMove(selectedMove);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [turn, isGameOver, difficulty, makeMove]);

  const resetGame = () => {
    engine.current = new Chess();
    updateGameState();
    setIsGameOver(false);
    setWinner(null);
    setHistory([]);
    setSelectedSquare(null);
    setOptionSquares({});
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-8 bg-[#0a0a1a] rounded-3xl lg:rounded-[3rem] border-2 border-cyan-500/10 backdrop-blur-3xl min-h-auto lg:min-h-[700px] w-full max-w-6xl mx-auto overflow-hidden relative font-sans">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full" />

      <div className="flex-1 flex flex-col items-center">
        <header className="w-full flex justify-between items-center mb-6 lg:mb-8 px-2">
          <div className="flex items-center gap-3 lg:gap-4">
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-500/10 rounded-xl lg:rounded-2xl border border-cyan-500/20 flex items-center justify-center shrink-0">
               <Brain className="text-cyan-400 w-5 h-5 lg:w-6 lg:h-6" />
             </div>
             <div>
               <h1 className="text-lg lg:text-2xl font-black text-white tracking-tighter uppercase leading-none">Grandmaster Hub</h1>
               <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[8px] lg:text-[10px] text-white/30 font-black uppercase tracking-widest">Neural Link Active</span>
               </div>
             </div>
          </div>
          <button 
            onClick={resetGame}
            className="group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-white/5 hover:bg-white/10 rounded-xl lg:rounded-2xl border border-white/10 transition-all active:scale-95 shrink-0"
          >
            <RefreshCcw size={14} className="text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">Reboot</span>
          </button>
        </header>

        <div className="w-full max-w-[500px] aspect-square relative group">
           <div className="w-full h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-4 border-[#12122b]">
             <Chessboard 
                {...{
                  position: fen, 
                  onPieceDrop: onPieceDrop,
                  onSquareClick: onSquareClick,
                  animationDuration: 300,
                  customDarkSquareStyle: { backgroundColor: '#1a1a35' },
                  customLightSquareStyle: { backgroundColor: '#2d2d52' },
                  customSquareStyles: optionSquares
                } as any}
             />
           </div>

           <AnimatePresence>
             {isGameOver && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="absolute inset-0 z-[60] bg-[#050515]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 sm:p-12 text-center"
               >
                 <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative mb-8">
                   <div className="absolute inset-0 bg-cyan-400/20 blur-[60px] rounded-full" />
                   <Trophy className="text-yellow-400 relative" size={80} />
                 </motion.div>
                 
                 <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 italic tracking-tighter">
                   {winner === 'White' ? 'STUNNING WIN!' : winner === 'Draw' ? 'CLASH OF MINDS' : 'DEFEATED'}
                 </h2>
                 <p className="text-cyan-400 font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase mb-10 sm:mb-12 text-[10px] sm:text-sm text-balance">
                   {winner === 'White' ? '+3,000 COINS DATA TRANSFERRED' : 'Tactical Stalemate Reached'}
                 </p>

                 <button 
                   onClick={resetGame}
                   className="w-full max-w-sm py-4 sm:py-6 bg-cyan-500 hover:bg-white text-black rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl transition-all shadow-[0_15px_40px_rgba(6,182,212,0.3)] active:scale-95"
                 >
                   REMATCH
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <aside className="w-full lg:w-96 flex flex-col gap-4 lg:gap-6">
        <section className="bg-white/5 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 border border-white/10 relative overflow-hidden">
           <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-2">
             <History size={14} /> Processor Status
           </p>

           <div className="flex items-center justify-between mb-8 lg:mb-10">
              <div className={`flex flex-col items-center gap-2 lg:gap-3 transition-all duration-500 ${turn === 'w' ? 'scale-110 opacity-100' : 'opacity-30'}`}>
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-2xl lg:rounded-3xl flex items-center justify-center text-[#12122b] font-black text-xl lg:text-2xl shadow-xl">W</div>
                <span className="text-[8px] lg:text-[10px] font-black text-white uppercase italic">Commander</span>
              </div>
              
              <div className="flex-1 px-4">
                <div className="h-0.5 w-full bg-white/10 rounded-full">
                   <motion.div 
                     animate={{ x: turn === 'w' ? '-10%' : '110%' }}
                     className="h-full w-12 lg:w-20 bg-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full"
                   />
                </div>
              </div>

              <div className={`flex flex-col items-center gap-2 lg:gap-3 transition-all duration-500 ${turn === 'b' ? 'scale-110 opacity-100' : 'opacity-30'}`}>
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-800 border border-white/20 rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl">B</div>
                <span className="text-[8px] lg:text-[10px] font-black text-white uppercase italic">AI Node 01</span>
              </div>
           </div>

           <div className={`w-full py-4 rounded-2xl text-center font-black uppercase tracking-[0.2em] text-sm border-2 transition-all
             ${engine.current.isCheck() ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
             {engine.current.isCheck() ? 'STRICT CHECK DETECTED' : (turn === 'w' ? 'Your Tactical Move' : 'AI Computing...')}
           </div>
        </section>

        <section className="bg-white/5 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 border border-white/10">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Heuristic Engine</p>
           <div className="flex gap-4">
              {['easy', 'medium'].map((d) => (
                <button 
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  className={`flex-1 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs transition-all border-2
                    ${difficulty === d ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {d}
                </button>
              ))}
           </div>
        </section>

        <section className="flex-1 bg-white/5 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 border border-white/10 overflow-hidden flex flex-col min-h-[160px]">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Tactical Data Stream</p>
           <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[140px] scrollbar-hide">
              {history.length === 0 && <span className="text-[10px] font-black text-white/10 uppercase italic">Awaiting first move...</span>}
              {history.map((move, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#12122b] px-4 py-2 rounded-xl border border-white/5">
                   <span className="text-[10px] font-black text-cyan-500/50 italic">#{Math.floor(i/2) + 1}</span>
                   <span className="text-xs font-black text-white">{move}</span>
                </div>
              ))}
           </div>
        </section>

        <div className="flex items-center gap-3 px-8 text-white/20">
           <AlertTriangle size={14} />
           <p className="text-[10px] font-bold uppercase tracking-widest">Auto-Promotion: Queen (Q)</p>
        </div>
      </aside>
    </div>
  );
};



