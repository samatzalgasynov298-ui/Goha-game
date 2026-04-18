import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Box, Layers, Palette, AlertCircle } from 'lucide-react';

type Color = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Wild';
type Value = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'Skip' | 'Reverse' | '+2' | 'Wild' | '+4';

interface Card {
  id: string;
  color: Color;
  value: Value;
}

const COLORS: Color[] = ['Red', 'Blue', 'Green', 'Yellow'];
const VALUES: Value[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

export const Uno: React.FC = () => {
  const { addCoins } = useGame();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [botHand, setBotHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [activeColor, setActiveColor] = useState<Color>('Red');
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [unoState, setUnoState] = useState<{ player: boolean; bot: boolean }>({ player: false, bot: false });
  const [pendingEffect, setPendingEffect] = useState<Value | null>(null);

  const createDeck = () => {
    let newDeck: Card[] = [];
    COLORS.forEach(color => {
      VALUES.forEach(value => {
        newDeck.push({ id: Math.random().toString(), color, value });
        if (value !== '0') newDeck.push({ id: Math.random().toString(), color, value });
      });
    });
    // Add Wild cards
    for (let i = 0; i < 4; i++) {
      newDeck.push({ id: Math.random().toString(), color: 'Wild', value: 'Wild' });
      newDeck.push({ id: Math.random().toString(), color: 'Wild', value: '+4' });
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const startNewGame = useCallback(() => {
    const newDeck = createDeck();
    const pHand = newDeck.splice(0, 7);
    const bHand = newDeck.splice(0, 7);
    let initialDiscard = newDeck.pop()!;
    // Ensure first card is not a wild or action for simplicity
    while (initialDiscard.color === 'Wild' || ['Skip', 'Reverse', '+2'].includes(initialDiscard.value)) {
      newDeck.unshift(initialDiscard);
      initialDiscard = newDeck.pop()!;
    }

    setPlayerHand(pHand);
    setBotHand(bHand);
    setDiscardPile([initialDiscard]);
    setActiveColor(initialDiscard.color);
    setDeck(newDeck);
    setTurn('player');
    setGameOver(null);
    setUnoState({ player: false, bot: false });
    setPendingEffect(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const drawCards = (handType: 'player' | 'bot', count: number) => {
    let currentDeck = [...deck];
    if (currentDeck.length < count) {
      currentDeck = [...currentDeck, ...createDeck()];
    }
    const drawn = currentDeck.splice(0, count);
    if (handType === 'player') setPlayerHand(prev => [...prev, ...drawn]);
    else setBotHand(prev => [...prev, ...drawn]);
    setDeck(currentDeck);
  };

  const checkUnoPenalty = (handType: 'player' | 'bot') => {
    const hand = handType === 'player' ? playerHand : botHand;
    const isUno = handType === 'player' ? unoState.player : unoState.bot;
    if (hand.length === 1 && !isUno) {
      drawCards(handType, 2);
      return true;
    }
    return false;
  };

  const handleAction = (card: Card, isPlayer: boolean) => {
    const nextTurn = isPlayer ? 'bot' : 'player';
    
    if (card.value === 'Skip') {
      setTurn(isPlayer ? 'player' : 'bot'); // Skip next player, so same player turns again
    } else if (card.value === 'Reverse') {
      setTurn(isPlayer ? 'player' : 'bot'); // In 2 player, Reverse is same as Skip
    } else if (card.value === '+2') {
      drawCards(nextTurn, 2);
      setTurn(isPlayer ? 'player' : 'bot'); // Draw 2 and skip
    } else if (card.value === '+4') {
      drawCards(nextTurn, 4);
      setTurn(isPlayer ? 'player' : 'bot'); // Draw 4 and skip
    } else {
      setTurn(nextTurn);
    }
  };

  const playCard = (card: Card, isPlayer: boolean) => {
    const topCard = discardPile[discardPile.length - 1];
    const canPlay = card.color === 'Wild' || card.color === activeColor || card.value === topCard.value;

    if (canPlay) {
      setDiscardPile(prev => [...prev, card]);
      
      if (isPlayer) {
        setPlayerHand(prev => {
          const newHand = prev.filter(c => c.id !== card.id);
          if (newHand.length === 0) setGameOver('You Win!');
          return newHand;
        });
      } else {
        setBotHand(prev => {
          const newHand = prev.filter(c => c.id !== card.id);
          if (newHand.length === 0) setGameOver('Bot Wins!');
          return newHand;
        });
      }

      if (card.color === 'Wild') {
        if (isPlayer) {
          setPendingEffect(card.value);
          setShowColorPicker(true);
        } else {
          // Bot picks color
          const colors = ['Red', 'Blue', 'Green', 'Yellow'] as Color[];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          setActiveColor(randomColor);
          handleAction(card, false);
        }
      } else {
        setActiveColor(card.color);
        handleAction(card, isPlayer);
      }
    }
  };

  const handleDraw = () => {
    if (turn !== 'player') return;
    drawCards('player', 1);
    setTurn('bot');
  };

  // Bot Logic
  useEffect(() => {
    if (turn === 'bot' && !gameOver && !showColorPicker) {
      const timer = setTimeout(() => {
        const topCard = discardPile[discardPile.length - 1];
        const playableCard = botHand.find(c => c.color === 'Wild' || c.color === activeColor || c.value === topCard.value);
        
        if (playableCard) {
          // Logic for UNO
          if (botHand.length === 2) setUnoState(prev => ({ ...prev, bot: true }));
          playCard(playableCard, false);
        } else {
          drawCards('bot', 1);
          setTurn('player');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, botHand, activeColor, discardPile, gameOver, showColorPicker]);

  return (
    <div className="w-full flex flex-col items-center bg-[#1a0a1a] p-4 md:p-8 rounded-3xl md:rounded-[3rem] border-2 border-pink-500/10 backdrop-blur-3xl min-h-auto lg:min-h-[700px] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
      
      <div className="w-full flex justify-between items-center mb-6 lg:mb-10 px-2 lg:px-4">
        <div className="flex flex-col">
          <h2 className="text-xl lg:text-3xl font-black text-pink-500 italic leading-none">UNO</h2>
          <span className="text-[8px] lg:text-[10px] text-pink-500/40 uppercase font-black mt-1">Goha Edition</span>
        </div>
        
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[8px] lg:text-[10px] text-white/30 uppercase font-bold">Bot</span>
            <div className="flex gap-0.5 lg:gap-1 mt-1">
              {Array.from({ length: botHand.length }).map((_, i) => (
                <div key={i} className="w-1.5 h-3 lg:w-2 lg:h-4 bg-pink-900 rounded-sm border border-pink-500/20" />
              ))}
            </div>
            {botHand.length === 1 && !unoState.bot && <AlertCircle size={12} className="text-pink-500 mt-1 animate-pulse" />}
          </div>
          <div className="h-8 lg:h-10 w-[1px] bg-white/5" />
          <div className="flex flex-col items-center">
             <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl shadow-lg border-2 border-white/10 ${
               activeColor === 'Red' ? 'bg-red-500 shadow-red-500/20' :
               activeColor === 'Blue' ? 'bg-blue-500 shadow-blue-500/20' :
               activeColor === 'Green' ? 'bg-green-500 shadow-green-500/20' :
               'bg-yellow-400 shadow-yellow-400/20'
             }`} />
             <span className="text-[8px] text-white/40 uppercase font-black mt-1">Active Color</span>
          </div>
        </div>
      </div>

      {/* Play Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 lg:gap-12 py-6 lg:py-10">
        <div className="flex gap-8 lg:gap-12 items-center">
          {/* Deck */}
          <div 
            onClick={handleDraw}
            className="group relative w-20 h-28 lg:w-24 lg:h-36 bg-pink-600 rounded-xl lg:rounded-2xl border-2 lg:border-4 border-white flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-all shadow-2xl shadow-pink-600/30"
          >
            <div className="absolute inset-1 lg:inset-2 border lg:border-2 border-white/20 rounded-lg lg:rounded-xl flex items-center justify-center">
               <span className="text-white font-black text-sm lg:text-2xl rotate-45 opacity-20 italic">UNO</span>
            </div>
            <Layers className="text-white w-6 h-6 lg:w-8 lg:h-8" />
          </div>

          {/* Discard Pile */}
          <div className="relative w-20 h-28 lg:w-24 lg:h-36 bg-slate-900 rounded-xl lg:rounded-2xl border-2 lg:border-4 border-white flex items-center justify-center shadow-2xl overflow-hidden">
            {discardPile.length > 0 && (
              <CardComponent card={discardPile[discardPile.length - 1]} />
            )}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          </div>
        </div>

        <div className={`px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-tighter
          ${turn === 'player' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-800 text-white/30'}`}>
          {turn === 'player' ? 'Your Turn' : 'Bot thinking...'}
        </div>
      </div>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-6"
          >
            <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-white/10 w-full max-w-sm text-center">
              <Palette className="mx-auto text-pink-500 mb-4" size={48} />
              <h3 className="text-2xl font-black text-white mb-6 uppercase italic">Select New Color</h3>
              <div className="grid grid-cols-2 gap-4">
                {COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => {
                      setActiveColor(c);
                      setShowColorPicker(false);
                      handleAction({ color: 'Wild', value: pendingEffect || 'Wild', id: '' }, true);
                      setPendingEffect(null);
                    }}
                    className={`h-16 rounded-2xl border-4 border-white/10 shadow-lg active:scale-95 transition-all
                      ${c === 'Red' ? 'bg-red-500' : c === 'Blue' ? 'bg-blue-500' : c === 'Green' ? 'bg-green-500' : 'bg-yellow-400'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Hand */}
      <div className="w-full flex flex-col items-center gap-4 mt-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (playerHand.length === 2) {
                setUnoState(prev => ({ ...prev, player: true }));
                log('Вы крикнули UNO!');
              }
            }}
            className={`px-6 py-2 rounded-full font-black text-xs transition-all
              ${unoState.player ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
          >
            {unoState.player ? 'UNO ACTIVE' : 'SAY UNO!'}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-[-15px] lg:gap-[-20px] max-w-full overflow-x-auto pb-4 px-4 lg:px-10 scrollbar-hide">
          {playerHand.map((card, i) => (
            <motion.div 
              key={card.id}
              whileHover={{ y: -40, zIndex: 100, scale: 1.1 }}
              onClick={() => turn === 'player' && !showColorPicker && playCard(card, true)}
              className="-ml-8 lg:-ml-10 first:ml-0 cursor-pointer relative"
            >
              <CardComponent card={card} interactive />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#1a0a1a]/95 backdrop-blur-2xl"
          >
            <div className="text-center p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl">
              <Trophy className="mx-auto text-pink-500 mb-6" size={80} />
              <h3 className="text-6xl font-display font-black text-white mb-2 italic">{gameOver}</h3>
              <p className="text-pink-400 font-bold tracking-[0.4em] uppercase mb-12">Session Concluded</p>
              <button 
                onClick={startNewGame} 
                className="group flex items-center gap-4 px-10 py-4 bg-pink-600 text-white rounded-[2rem] font-black text-xl hover:bg-white hover:text-pink-600 transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" />
                PLAY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CardComponent: React.FC<{ card: Card; interactive?: boolean }> = ({ card, interactive }) => {
  const getColors = () => {
    if (card.color === 'Wild') return 'bg-gradient-to-br from-red-500 via-blue-500 to-green-500 border-white';
    if (card.color === 'Red') return 'bg-red-500 border-white';
    if (card.color === 'Blue') return 'bg-blue-500 border-white';
    if (card.color === 'Green') return 'bg-green-500 border-white';
    return 'bg-yellow-400 border-white';
  };

  return (
    <div className={`w-16 h-24 lg:w-24 lg:h-36 rounded-xl lg:rounded-2xl border-2 lg:border-4 flex flex-col items-center justify-between p-1.5 lg:p-3 shadow-2xl select-none transition-all
      ${getColors()} ${interactive ? 'hover:shadow-pink-500/50' : ''}`}>
      
      <span className="self-start text-white font-black text-[10px] lg:text-base drop-shadow-md leading-none">{card.value}</span>
      
      <div className="w-10 h-14 lg:w-16 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full border lg:border-2 border-white/30 flex items-center justify-center rotate-12 shadow-inner">
        <span className="text-white font-black text-lg lg:text-3xl italic drop-shadow-lg">{card.value}</span>
      </div>

      <span className="self-end text-white font-black text-[10px] lg:text-base rotate-180 drop-shadow-md leading-none">{card.value}</span>
    </div>
  );
};

const log = (msg: string) => console.log(msg); // Placeholder for logs if needed

