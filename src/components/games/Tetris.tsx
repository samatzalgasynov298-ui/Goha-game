import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Play, RotateCcw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

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
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
          ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
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
              (currentPiece.current!.pos.x + c) * BLOCK_SIZE,
              (currentPiece.current!.pos.y + r) * BLOCK_SIZE,
              BLOCK_SIZE - 1,
              BLOCK_SIZE - 1
            );
          }
        });
      });
    }
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
    <div className="flex flex-col items-center bg-black/60 p-6 rounded-[2rem] border-2 border-pink-500/30">
      <div className="flex justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          <span className="font-display font-black text-2xl">{score}</span>
        </div>
        <button 
          onClick={startGame}
          className="p-2 bg-pink-600 rounded-xl hover:bg-pink-500 transition-colors"
        >
          {isPlaying ? <RotateCcw size={20} /> : <Play size={20} />}
        </button>
      </div>

      <div className="relative border-4 border-white/20 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        <canvas 
          ref={canvasRef} 
          width={COLS * BLOCK_SIZE} 
          height={ROWS * BLOCK_SIZE}
          className="block"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <h2 className="text-4xl font-display font-black text-white mb-4">
              {isGameOver ? 'GAME OVER' : 'TETRIS'}
            </h2>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-pink-600 rounded-2xl font-black text-white shadow-lg shadow-pink-600/50 hover:scale-105 active:scale-95 transition-all"
            >
              {isGameOver ? 'RETRY' : 'START GAME'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white/40 text-xs font-bold uppercase tracking-widest flex gap-4">
        <span>← → MOVE</span>
        <span>↑ ROTATE</span>
        <span>↓ SOFT DROP</span>
      </div>
    </div>
  );
};
