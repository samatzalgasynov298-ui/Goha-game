import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Play, RotateCcw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};

const COLORS = {
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000',
};

export const Tetris: React.FC = () => {
  const { addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blockSize, setBlockSize] = useState(30);

  const grid = useRef<string[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
  const currentPiece = useRef<{
    pos: { x: number; y: number };
    shape: number[][];
    type: keyof typeof TETROMINOS;
  } | null>(null);

  const spawnPiece = useCallback(() => {
    const types = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
    const type = types[Math.floor(Math.random() * types.length)];
    const shape = TETROMINOS[type];
    
    currentPiece.current = {
      pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
      shape,
      type,
    };

    if (collision(currentPiece.current.pos.x, currentPiece.current.pos.y, shape)) {
      setIsGameOver(true);
      setIsPlaying(false);
    }
  }, []);

  const collision = (x: number, y: number, shape: number[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const newX = x + c;
        const newY = y + r;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && grid.current[newY][newX]) return true;
      }
    }
    return false;
  };

  const merge = () => {
    if (!currentPiece.current) return;
    const { pos, shape, type } = currentPiece.current;
    shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) grid.current[pos.y + r][pos.x + c] = type;
      });
    });
    
    // Clear lines
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid.current[r].every(cell => cell !== '')) {
        grid.current.splice(r, 1);
        grid.current.unshift(Array(COLS).fill(''));
        linesCleared++;
        r++;
      }
    }
    
    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100);
      addCoins(linesCleared * 50);
    }
    
    spawnPiece();
  };

  const rotate = () => {
    if (!currentPiece.current) return;
    const newShape = currentPiece.current.shape[0].map((_, i) =>
      currentPiece.current!.shape.map(row => row[i]).reverse()
    );
    if (!collision(currentPiece.current.pos.x, currentPiece.current.pos.y, newShape)) {
      currentPiece.current.shape = newShape;
    }
  };

  const move = (dx: number, dy: number) => {
    if (!currentPiece.current) return;
    if (!collision(currentPiece.current.pos.x + dx, currentPiece.current.pos.y + dy, currentPiece.current.shape)) {
      currentPiece.current.pos.x += dx;
      currentPiece.current.pos.y += dy;
    } else if (dy > 0) {
      merge();
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    grid.current.forEach((row, r) => {
      row.forEach((type, c) => {
        if (type) {
          ctx.fillStyle = COLORS[type as keyof typeof COLORS];
          ctx.fillRect(c * blockSize, r * blockSize, blockSize - 1, blockSize - 1);
        }
      });
    });

    // Draw current piece
    if (currentPiece.current) {
      ctx.fillStyle = COLORS[currentPiece.current.type];
      currentPiece.current.shape.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value) {
            ctx.fillRect(
              (currentPiece.current!.pos.x + c) * blockSize,
              (currentPiece.current!.pos.y + r) * blockSize,
              blockSize - 1,
              blockSize - 1
            );
          }
        });
      });
    }
  }, [blockSize]);

  // Handle Resize for mobile
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Use container width to calculate block size, leaving space for margins
        const availableWidth = Math.min(width - 40, 400); 
        const newBlockSize = Math.floor(availableWidth / COLS);
        setBlockSize(newBlockSize);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      move(0, 1);
      draw();
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, draw]);

  const startGame = () => {
    grid.current = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnPiece();
    draw();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowUp') rotate();
      draw();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, draw]);

  return (
    <div ref={containerRef} className="flex flex-col items-center bg-black/60 p-4 md:p-8 rounded-3xl md:rounded-[3rem] border-2 border-pink-500/30 w-full max-w-lg mx-auto overflow-hidden">
      <div className="flex justify-between w-full mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/10 rounded-xl border border-yellow-400/20 flex items-center justify-center">
            <Trophy className="text-yellow-400" size={20} />
          </div>
          <div>
            <span className="text-[10px] text-white/30 uppercase font-black block leading-none mb-1">Score Matrix</span>
            <span className="font-display font-black text-2xl md:text-3xl leading-none">{score}</span>
          </div>
        </div>
        <button 
          onClick={startGame}
          className="w-12 h-12 bg-pink-600 rounded-xl hover:bg-pink-500 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
        >
          {isPlaying ? <RotateCcw size={24} /> : <Play size={24} />}
        </button>
      </div>

      <div className="relative border-4 border-[#1e1e3f] rounded-2xl overflow-hidden bg-[#050515] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <canvas 
          ref={canvasRef} 
          width={COLS * blockSize} 
          height={ROWS * blockSize}
          className="block"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050515]/80 backdrop-blur-md px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-2 italic tracking-tighter">
              {isGameOver ? 'SYS ERROR' : 'TETRIS'}
            </h2>
            <p className="text-pink-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
              {isGameOver ? 'Core Overload Detected' : 'Neural Link Ready'}
            </p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-pink-600 rounded-2xl font-black text-white shadow-[0_15px_30px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all text-xl"
            >
              {isGameOver ? 'REBOOT' : 'INITIALIZE'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Gamepad */}
      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-[280px]">
        <div />
        <ControlButton 
          onClick={() => { rotate(); draw(); }} 
          className="bg-white/10"
          icon={<RotateCcw size={24} />}
        />
        <div />
        
        <ControlButton 
          onClick={() => { move(-1, 0); draw(); }}
          className="bg-white/5"
          icon={<span className="text-2xl font-black">←</span>}
        />
        <ControlButton 
          onClick={() => { move(0, 1); draw(); }}
          className="bg-white/5"
          icon={<span className="text-2xl font-black">↓</span>}
        />
        <ControlButton 
          onClick={() => { move(1, 0); draw(); }}
          className="bg-white/5"
          icon={<span className="text-2xl font-black">→</span>}
        />
      </div>

      <div className="mt-6 text-white/20 text-[8px] font-black uppercase tracking-[0.2em] hidden md:flex gap-6">
        <span>← → MOVE</span>
        <span>↑ ROTATE</span>
        <span>↓ SOFT DROP</span>
      </div>
    </div>
  );
};

function ControlButton({ onClick, icon, className }: any) {
  return (
    <button 
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      onTouchStart={(e) => { e.preventDefault(); onClick(); }}
      className={`h-16 rounded-2xl border border-white/10 flex items-center justify-center transition-all active:scale-90 active:bg-white/20 ${className}`}
    >
      {icon}
    </button>
  );
}
