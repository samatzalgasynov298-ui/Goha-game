import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameItem } from '../constants/items';

interface GameContextType {
  coins: number;
  inventory: GameItem[];
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  addToInventory: (item: GameItem) => void;
  sellItem: (index: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('goha_coins');
    return saved ? parseInt(saved) : 1000; // Start with 1000
  });

  const [inventory, setInventory] = useState<GameItem[]>(() => {
    const saved = localStorage.getItem('goha_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('goha_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('goha_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const addCoins = (amount: number) => setCoins(prev => prev + amount);
  const removeCoins = (amount: number) => setCoins(prev => Math.max(0, prev - amount));
  const addToInventory = (item: GameItem) => setInventory(prev => [...prev, item]);
  
  const sellItem = (index: number) => {
    const item = inventory[index];
    if (item) {
      addCoins(item.sellPrice);
      setInventory(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <GameContext.Provider value={{ coins, inventory, addCoins, removeCoins, addToInventory, sellItem }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
