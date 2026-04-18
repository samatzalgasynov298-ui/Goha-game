import { useEffect, useRef, useState } from 'react';
import { Bird, Pipe } from '../types';
import { useGame } from '../context/GameContext';

interface Props {
  onGameOver: (score: number) => void;
}

export default function FlappyGame({ onGameOver }: Props) {
  const { addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 45;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 180;
  const GRAVITY = 0.4;
  const LIFT = -8;

  // Game state refs (for performance in loop)
  const bird = useRef<Bird>({
    x: 50,
    y: CANVAS_HEIGHT / 2,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    gravity: GRAVITY,
    lift: LIFT,
    velocity: 0
  });
  const pipes = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const birdImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    // Use the specific image requested by user
    img.src = '/goha-removebg-preview.png';
    img.onerror = () => {
      // Fallback if image not found
      birdImg.current = null;
    };
    img.onload = () => {
      birdImg.current = img;
    };
  }, []);

  const resetGame = () => {
    bird.current = {
      x: 50,
      y: CANVAS_HEIGHT / 2,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      gravity: GRAVITY,
      lift: LIFT,
      velocity: 0
    };
    pipes.current = [];
    scoreRef.current = 0;
    setScore(0);
    setIsGameRunning(true);
    setShowPrompt(false);
  };

  const jump = () => {
    if (!isGameRunning) {
      resetGame();
    } else {
      bird.current.velocity = bird.current.lift;
    }
  };

  useEffect(() => {
    if (!isGameRunning) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const loop = () => {
      // 1. Update Physics
      bird.current.velocity += bird.current.gravity;
      bird.current.y += bird.current.velocity;

      // 2. Bound checks
      if (bird.current.y + BIRD_SIZE > CANVAS_HEIGHT || bird.current.y < 0) {
        handleGameOver();
        return;
      }

      // 3. Pipes Logic
      if (pipes.current.length === 0 || pipes.current[pipes.current.length - 1].x < CANVAS_WIDTH - 200) {
        pipes.current.push({
          x: CANVAS_WIDTH,
          top: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
          passed: false
        });
      }

      pipes.current.forEach((p, i) => {
        p.x -= 3;

        // Collision check
        const hitTop = bird.current.x < p.x + PIPE_WIDTH && 
                     bird.current.x + BIRD_SIZE > p.x && 
                     bird.current.y < p.top;
        const hitBottom = bird.current.x < p.x + PIPE_WIDTH && 
                        bird.current.x + BIRD_SIZE > p.x && 
                        bird.current.y + BIRD_SIZE > p.top + PIPE_GAP;

        if (hitTop || hitBottom) {
          handleGameOver();
          return;
        }

        // Score check
        if (!p.passed && p.x + PIPE_WIDTH < bird.current.x) {
          p.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          addCoins(5); // 5 coins per pipe
        }

        // Cleanup
        if (p.x < -PIPE_WIDTH) {
          pipes.current.splice(i, 1);
        }
      });

      // 4. Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background elements (optional simple clouds)
      ctx.fillStyle = '#f06292';
      pipes.current.forEach(p => {
        // Top Pipe
        ctx.beginPath();
        ctx.roundRect(p.x, 0, PIPE_WIDTH, p.top, [0, 0, 10, 10]);
        ctx.fill();
        
        // Bottom Pipe
        ctx.beginPath();
        ctx.roundRect(p.x, p.top + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (p.top + PIPE_GAP), [10, 10, 0, 0]);
        ctx.fill();
      });

      // Bird
      if (birdImg.current) {
        ctx.drawImage(birdImg.current, bird.current.x, bird.current.y, BIRD_SIZE, BIRD_SIZE);
      } else {
        // Fallback cat-like bird
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bird.current.x + BIRD_SIZE/2, bird.current.y + BIRD_SIZE/2, BIRD_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#db6c7f';
        ctx.font = '24px Arial';
        ctx.fillText('🐱', bird.current.x + 8, bird.current.y + 30);
      }

      animationId = requestAnimationFrame(loop);
    };

    const handleGameOver = () => {
      setIsGameRunning(false);
      setShowPrompt(true);
      onGameOver(scoreRef.current);
      cancelAnimationFrame(animationId);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isGameRunning, onGameOver, addCoins]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isGameRunning]);

  return (
    <div className="relative w-full h-full cursor-pointer touch-none" onClick={jump}>
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-slate-800"
      />
      
      {/* UI Overlays */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
        <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-lg border-2 border-[#db6c7f]">
          <span className="text-[#db6c7f] font-black text-xl">Счёт: {score}</span>
        </div>
      </div>

      {showPrompt && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl scale-in transform transition-transform">
            <h3 className="text-2xl font-display font-black text-[#ff4081] mb-2">
              {score > 0 ? 'Конец Игры!' : 'Flappy Goha'}
            </h3>
            {score > 0 && <p className="text-slate-600 font-bold mb-4">Твой результат: {score}</p>}
            <button className="bg-[#ff4081] text-white px-8 py-3 rounded-2xl font-black text-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
              {score > 0 ? 'Попробовать снова' : 'Начать'}
            </button>
            <p className="mt-4 text-slate-400 text-sm font-medium">Нажми Пробел или Тапни</p>
          </div>
        </div>
      )}
    </div>
  );
}
