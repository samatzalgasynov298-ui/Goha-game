import { useEffect, useRef, useState, MouseEvent, TouchEvent } from 'react';
import { CatchItem } from '../types';
import { useGame } from '../context/GameContext';

interface Props {
  onGameOver?: (score: number) => void;
}

export default function CatchGame({ onGameOver }: Props) {
  const { addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const CATCHER_WIDTH = 80;
  const CATCHER_HEIGHT = 80;

  // Game state refs
  const catcherX = useRef(CANVAS_WIDTH / 2 - CATCHER_WIDTH / 2);
  const items = useRef<CatchItem[]>([]);
  const scoreRef = useRef(0);
  const birdImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    // Use the specific image requested by user
    img.src = '/goha-removebg-preview.png';
    img.onerror = () => { birdImg.current = null; };
    img.onload = () => { birdImg.current = img; };
  }, []);

  const resetGame = () => {
    catcherX.current = CANVAS_WIDTH / 2 - CATCHER_WIDTH / 2;
    items.current = [];
    scoreRef.current = 0;
    setScore(0);
    setIsGameRunning(true);
    setShowPrompt(false);
  };

  useEffect(() => {
    if (!isGameRunning) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const loop = () => {
      // 1. Logic
      if (Math.random() < 0.04) {
        const isBomb = Math.random() < 0.2;
        items.current.push({
          x: Math.random() * (CANVAS_WIDTH - 40) + 20,
          y: -40,
          speed: 3 + Math.random() * 4,
          type: isBomb ? 'bomb' : 'heart'
        });
      }

      for (let i = items.current.length - 1; i >= 0; i--) {
        const item = items.current[i];
        item.y += item.speed;

        // Collision check
        const catcherY = 500;
        const centerX = item.x;
        const centerY = item.y;

        if (
          centerY > catcherY && 
          centerY < catcherY + CATCHER_HEIGHT && 
          centerX > catcherX.current && 
          centerX < catcherX.current + CATCHER_WIDTH
        ) {
          if (item.type === 'heart') {
            scoreRef.current += 1;
            setScore(scoreRef.current);
            addCoins(10); // Reward for hearts
            items.current.splice(i, 1);
          } else {
            handleGameOver();
            return;
          }
        }

        if (item.y > CANVAS_HEIGHT + 40) {
          items.current.splice(i, 1);
        }
      }

      // 2. Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background Gradient for better contrast
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw subtle grid or particles (optional, but keep it clean)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for(let i=0; i<CANVAS_WIDTH; i+=40) {
        ctx.fillRect(i, 0, 1, CANVAS_HEIGHT);
      }

      // Items with GLOWING BUBBLES
      items.current.forEach(item => {
        ctx.save();
        
        // 1. Draw glowing background sphere
        const isHeart = item.type === 'heart';
        const color = isHeart ? '#ff4081' : '#ffea00';
        const bgColor = isHeart ? 'rgba(255, 64, 129, 0.4)' : 'rgba(255, 234, 0, 0.4)';
        
        ctx.shadowBlur = 40;
        ctx.shadowColor = color;
        
        // White glow center
        ctx.beginPath();
        ctx.arc(item.x, item.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Colored outer ring
        ctx.beginPath();
        ctx.arc(item.x, item.y, 28, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 2. Draw Emoji on top
        ctx.shadowBlur = 0; // Disable shadow for text to keep it sharp
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isHeart ? '❤️' : '💩', item.x, item.y);
        
        ctx.restore();
      });

      // Catcher with subtle shadow
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      if (birdImg.current) {
        ctx.drawImage(birdImg.current, catcherX.current, 500, CATCHER_WIDTH, CATCHER_HEIGHT);
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(catcherX.current + CATCHER_WIDTH/2, 540, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐱', catcherX.current + CATCHER_WIDTH/2, 555);
      }
      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    const handleGameOver = () => {
      setIsGameRunning(false);
      setShowPrompt(true);
      if (onGameOver) onGameOver(scoreRef.current);
      cancelAnimationFrame(animationId);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isGameRunning, onGameOver, addCoins]);

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!canvasRef.current || !isGameRunning) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    catcherX.current = Math.max(0, Math.min(CANVAS_WIDTH - CATCHER_WIDTH, x - CATCHER_WIDTH / 2));
  };

  return (
    <div 
      className="relative w-full h-full cursor-none overflow-hidden touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onClick={() => !isGameRunning && resetGame()}
    >
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-slate-800"
      />
      
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-lg border-2 border-[#ff4081]">
          <span className="text-[#ff4081] font-black text-xl">Счёт: {score} 💖</span>
        </div>
      </div>

      {showPrompt && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl scale-in transform transition-transform">
            <h3 className="text-2xl font-display font-black text-[#ff4081] mb-2">
              {score > 0 ? 'БАБАХ! 💥' : 'Лови сердца'}
            </h3>
            {score > 0 && <p className="text-slate-600 font-bold mb-4">Твой результат: {score}</p>}
            <button className="bg-[#ff4081] text-white px-8 py-3 rounded-2xl font-black text-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
              {score > 0 ? 'Попробовать снова' : 'Начать'}
            </button>
            <p className="mt-4 text-slate-400 text-sm font-medium">Двигай мышкой или пальцем</p>
          </div>
        </div>
      )}
    </div>
  );
}
