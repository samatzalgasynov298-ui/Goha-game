/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Gamepad2, Heart, Play, 
  Coins, Package, ChevronRight, X, 
  Sword, User, Info, LayoutGrid, BoxIcon,
  Bird
} from 'lucide-react';
import { useGame } from './context/GameContext';
import { CaseOpener } from './components/CaseOpener';
import { Tetris } from './components/games/Tetris';
import { Uno } from './components/games/Uno';
import { Durak } from './components/games/Durak';
import { ChessGame } from './components/games/ChessGame';
import CatchGame from './components/CatchGame';
import FlappyGame from './components/FlappyGame';
import { ItemImage } from './components/ui/ItemImage';

type View = 'hub' | 'flappy' | 'catch' | 'tetris' | 'uno' | 'durak' | 'chess' | 'inventory' | 'case';

export default function App() {
  const { coins, inventory, sellItem } = useGame();
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('goha_view');
    return (saved as View) || 'hub';
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    localStorage.setItem('goha_view', currentView);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-pink-500 selection:text-white overflow-x-hidden font-sans relative">
      {/* Background Particles FX */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/30 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('hub')}>
          <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            <LayoutGrid size={20} />
          </div>
          <span className="font-display font-black text-xl tracking-tighter uppercase">Goha Hub</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
            <Coins className="text-yellow-400" size={18} />
            <span className="font-display font-black text-lg tabular-nums tracking-tighter">{coins}</span>
          </div>
          <button 
            onClick={() => setCurrentView('inventory')}
            className={`p-2.5 border rounded-xl transition-all relative
              ${currentView === 'inventory' ? 'bg-pink-600 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <BoxIcon size={20} />
            {inventory.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-pink-600 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#020617]">
                {inventory.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {currentView === 'hub' && (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Hero Banner */}
              <div className="relative glass-panel p-8 md:p-16 overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-cyan-500 to-pink-500" />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-5xl md:text-8xl font-display font-black mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-none">
                    HAPPY BIRTHDAY, GOHA! 🎂
                  </h1>
                  <p className="text-pink-500 font-display font-bold text-xl uppercase tracking-[0.3em] mb-12">Level Up: +1 Year of Awesomeness</p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => setCurrentView('case')}
                      className="px-12 py-5 bg-pink-600 rounded-3xl font-black text-xl flex items-center gap-3 shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:bg-pink-500 transition-all active:scale-95 group"
                    >
                      <Package size={24} className="group-hover:rotate-12 transition-transform" />
                      CASE SIMULATOR
                    </button>
                  </div>
                </motion.div>

                {/* Decorative floating items */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full" />
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-pink-500/10 blur-[60px] rounded-full" />
              </div>

              {/* Game Grid */}
              <section>
                <h3 className="text-2xl font-display font-black mb-8 flex items-center gap-3">
                  <Gamepad2 className="text-pink-500" />
                  AVAILABLE MISSIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <GameCard 
                    title="Flappy Goha" 
                    desc="High speed flight" 
                    icon={<Bird />} color="bg-orange-800"
                    onClick={() => setCurrentView('flappy')}
                  />
                  <GameCard 
                    title="Chess" 
                    desc="Defeat the Grandmaster Bot" 
                    icon={<Sword />} color="bg-slate-800"
                    onClick={() => setCurrentView('chess')}
                  />
                  <GameCard 
                    title="UNO" 
                    desc="Color matching mayhem" 
                    icon={<Play />} color="bg-pink-800"
                    onClick={() => setCurrentView('uno')}
                  />
                  <GameCard 
                    title="Tetris" 
                    desc="Classic stack and block" 
                    icon={<LayoutGrid />} color="bg-cyan-800"
                    onClick={() => setCurrentView('tetris')}
                  />
                  <GameCard 
                    title="Durak" 
                    desc="Simplified Russian cards" 
                    icon={<User />} color="bg-blue-800"
                    onClick={() => setCurrentView('durak')}
                  />
                  <GameCard 
                    title="Hearts" 
                    desc="Catch the love!" 
                    icon={<Heart />} color="bg-rose-800"
                    onClick={() => setCurrentView('catch')}
                  />
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'case' && (
            <motion.div key="case" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <Header label="Case Opening" onClose={() => setCurrentView('hub')} />
              <div className="w-full glass-panel p-12 flex flex-col items-center">
                <CaseOpener />
              </div>
            </motion.div>
          )}

          {currentView === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Header label="Your Loot Box" onClose={() => setCurrentView('hub')} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {inventory.length > 0 ? inventory.map((item, i) => (
                  <div key={i} className="glass-panel p-3 flex flex-col items-center border-white/5 group relative overflow-hidden">
                    <ItemImage 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full aspect-square rounded-xl object-cover mb-2" 
                      rarity={item.rarity}
                    />
                    <p className="text-[10px] font-bold text-center truncate w-full">{item.name}</p>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded mt-1 mb-2
                      ${item.rarity === 'Legendary' ? 'bg-yellow-400 text-black' : 
                        item.rarity === 'Rare' ? 'bg-purple-500 text-white' : 'bg-blue-400 text-white'}`}
                    >
                      {item.rarity}
                    </span>
                    
                    {/* Sell Button Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 backdrop-blur-md">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          sellItem(i);
                        }}
                        className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-[10px] font-black rounded-lg shadow-lg flex items-center justify-center gap-1"
                      >
                        SELL ({item.sellPrice} 🪙)
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center opacity-30 italic">No loot discovered yet. Go win some games!</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Game Views */}
          {['chess', 'uno', 'durak', 'tetris', 'catch', 'flappy'].includes(currentView) && (
            <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <Header label={`${currentView.toUpperCase()}`} onClose={() => setCurrentView('hub')} />
              <div className="w-full max-w-4xl">
                {currentView === 'chess' && <ChessGame />}
                {currentView === 'uno' && <Uno />}
                {currentView === 'durak' && <Durak />}
                {currentView === 'tetris' && <Tetris />}
                {currentView === 'catch' && <div className="game-card h-[600px] w-[400px] mx-auto"><CatchGame /></div>}
                {currentView === 'flappy' && <div className="game-card h-[600px] w-[400px] mx-auto"><FlappyGame onGameOver={() => {}} /></div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function GameCard({ title, desc, icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative p-8 rounded-[2.5rem] ${color} border-2 border-white/10 group overflow-hidden transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}
    >
      <div className="flex flex-col items-start relative z-10">
        <div className="mb-6 p-4 bg-white/10 rounded-2xl group-hover:scale-110 group-hover:bg-white/20 transition-all">
          {icon}
        </div>
        <h4 className="text-3xl font-display font-black mb-1 italic">{title}</h4>
        <p className="text-white/50 text-sm font-medium">{desc}</p>
      </div>
      <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="absolute right-6 bottom-6 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
        <ChevronRight size={32} />
      </div>
    </button>
  );
}

function Header({ label, onClose }: any) {
  return (
    <div className="w-full flex items-center justify-between mb-8">
      <h2 className="text-4xl font-display font-black uppercase tracking-tighter">{label}</h2>
      <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
        <X size={24} />
      </button>
    </div>
  );
}
