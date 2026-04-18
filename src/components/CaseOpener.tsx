import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ITEMS_CONFIG, CASE_PRICE, GameItem } from '../constants/items';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { ItemImage } from './ui/ItemImage';
import { Sparkles, Package } from 'lucide-react';

export const CaseOpener: React.FC = () => {
  const { coins, removeCoins, addToInventory } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<GameItem | null>(null);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a long list of items for the roulette
  const [rouletteItems, setRouletteItems] = useState<GameItem[]>([]);

  const GAP = 8; 
  const VISIBLE_ITEMS = 60;

  const spin = async () => {
    if (coins < CASE_PRICE || isSpinning) return;

    removeCoins(CASE_PRICE);
    setIsSpinning(true);
    setReward(null);

    // Dynamic width based on screen size (matching Tailwind classes)
    const cardWidth = window.innerWidth < 640 ? 90 : 110;

    // Build roulette list
    const commonItems = ITEMS_CONFIG.filter(i => i.rarity === 'Common');
    const rareItems = ITEMS_CONFIG.filter(i => i.rarity === 'Rare');
    const legendaryItems = ITEMS_CONFIG.filter(i => i.rarity === 'Legendary');

    const newItems = Array.from({ length: VISIBLE_ITEMS }, () => {
      const rand = Math.random() * 100;
      if (rand < 2 && legendaryItems.length > 0) return legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
      if (rand < 20 && rareItems.length > 0) return rareItems[Math.floor(Math.random() * rareItems.length)];
      return commonItems[Math.floor(Math.random() * commonItems.length)] || ITEMS_CONFIG[0];
    });

    setRouletteItems(newItems);

    // Target index (somewhere near the end)
    const targetIndex = VISIBLE_ITEMS - 6;
    const finalReward = newItems[targetIndex];
    
    // Animation
    await controls.set({ x: 0 });
    
    // Calculate exact center position
    const targetX = -(targetIndex * (cardWidth + GAP) + cardWidth / 2);
    
    await controls.start({
      x: targetX,
      transition: { duration: 5, ease: [0.15, 0, 0, 1] } 
    });

    setReward(finalReward);
    addToInventory(finalReward);
    setIsSpinning(false);

    if (finalReward.rarity === 'Legendary' || finalReward.rarity === 'Rare') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4081', '#00e5ff', '#ffffff']
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[500px] h-[130px] sm:h-[160px] bg-black/40 border-2 border-pink-500/30 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 flex items-center"
      >        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-pink-500 z-10 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
        
        <motion.div 
          animate={controls}
          className="flex gap-2 px-[50%]"
          style={{ width: 'max-content' }}
        >
          {rouletteItems.map((item, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-[90px] h-[110px] sm:w-[110px] sm:h-[130px] rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center p-2
                ${item.rarity === 'Legendary' ? 'border-yellow-400 bg-yellow-400/10' : 
                  item.rarity === 'Rare' ? 'border-purple-500 bg-purple-500/10' : 
                  'border-blue-400/30 bg-blue-400/5'}`}
            >
              <ItemImage 
                src={item.image} 
                alt={item.name} 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover mb-1 shrink-0"
                rarity={item.rarity}
              />
              <p className="text-[8px] sm:text-[10px] font-bold text-center truncate w-full">{item.name}</p>
              <div className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded mt-1
                ${item.rarity === 'Legendary' ? 'bg-yellow-400 text-black' : 
                  item.rarity === 'Rare' ? 'bg-purple-500 text-white' : 
                  'bg-blue-400 text-white'}`}
              >
                {item.rarity}
              </div>
            </div>
          ))}
        </motion.div>
        
        {!rouletteItems.length && !isSpinning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
            <Package size={48} className="mb-2 opacity-20" />
            <p className="font-display font-bold uppercase tracking-widest">Case Simulator</p>
          </div>
        )}
      </div>

      <button 
        onClick={spin}
        disabled={isSpinning || coins < CASE_PRICE}
        className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl overflow-hidden transition-all active:scale-95
          ${coins < CASE_PRICE ? 'bg-slate-700 text-white/30 cursor-not-allowed' : 'bg-pink-600 text-white hover:bg-pink-500'}`}
      >
        <Sparkles size={18} className={`sm:w-6 sm:h-6 ${isSpinning ? 'animate-spin' : ''}`} />
        {isSpinning ? 'SPINNING...' : `OPEN CASE (${CASE_PRICE} 🪙)`}
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      </button>

      {reward && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center"
        >
          <p className="text-white/60 mb-2 sm:mb-3 text-sm">You won:</p>
          <div className={`p-1 rounded-xl sm:rounded-2xl bg-gradient-to-b mb-3 sm:mb-4
            ${reward.rarity === 'Legendary' ? 'from-yellow-400 to-yellow-600' : 
              reward.rarity === 'Rare' ? 'from-purple-400 to-purple-600' : 'from-blue-400 to-blue-600'}`}
          >
            <ItemImage 
              src={reward.image} 
              alt={reward.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl object-cover shadow-2xl"
              rarity={reward.rarity}
            />
          </div>
          <p className={`text-2xl sm:text-4xl font-display font-black uppercase tracking-tighter text-center
            ${reward.rarity === 'Legendary' ? 'text-yellow-400' : 
              reward.rarity === 'Rare' ? 'text-purple-400' : 'text-blue-400'}`}
          >
            {reward.name}
          </p>
        </motion.div>
      )}
    </div>
  );
};
