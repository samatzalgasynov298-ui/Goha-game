import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Check, Hand, ArrowDown } from 'lucide-react';

type Suit = '♠' | '♣' | '♥' | '♦';
type Rank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

const SUITS: Suit[] = ['♠', '♣', '♥', '♦'];
const RANKS: Rank[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<Rank, number> = { '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

export const Durak: React.FC = () => {
  const { addCoins } = useGame();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [botHand, setBotHand] = useState<Card[]>([]);
  const [trump, setTrump] = useState<Card | null>(null);
  const [table, setTable] = useState<{ attack: Card; defense?: Card }[]>([]);
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [attacker, setAttacker] = useState<'player' | 'bot'>('player');
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [isFirstRound, setIsFirstRound] = useState(true);

  const log = (msg: string) => setGameLog(prev => [msg, ...prev].slice(0, 5));

  const createDeck = () => {
    let newDeck: Card[] = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        newDeck.push({ id: Math.random().toString(), suit, rank, value: RANK_VALUES[rank] });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const startNewGame = useCallback(() => {
    const newDeck = createDeck();
    const pHand = newDeck.splice(0, 6);
    const bHand = newDeck.splice(0, 6);
    const trumpCard = newDeck[newDeck.length - 1]; // Trump is at the bottom
    
    // Determine who starts
    const playerMinTrump = pHand.filter(c => c.suit === trumpCard.suit).reduce((min, c) => c.value < min ? c.value : min, 99);
    const botMinTrump = bHand.filter(c => c.suit === trumpCard.suit).reduce((min, c) => c.value < min ? c.value : min, 99);
    
    const firstAttacker = playerMinTrump <= botMinTrump ? 'player' : 'bot';
    
    setPlayerHand(pHand);
    setBotHand(bHand);
    setTrump(trumpCard);
    setDeck(newDeck);
    setTable([]);
    setAttacker(firstAttacker);
    setTurn(firstAttacker);
    setGameOver(null);
    setGameLog(['Игра началась! Масть: ' + trumpCard.suit]);
    setIsFirstRound(true);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const refillHands = (prevAttacker: 'player' | 'bot', prevDefender: 'player' | 'bot', tookCards: boolean) => {
    let currentDeck = [...deck];
    let pHand = [...playerHand];
    let bHand = [...botHand];

    // Attacker draws first
    if (prevAttacker === 'player') {
      while (pHand.length < 6 && currentDeck.length > 0) pHand.push(currentDeck.shift()!);
      while (bHand.length < 6 && currentDeck.length > 0) bHand.push(currentDeck.shift()!);
    } else {
      while (bHand.length < 6 && currentDeck.length > 0) bHand.push(currentDeck.shift()!);
      while (pHand.length < 6 && currentDeck.length > 0) pHand.push(currentDeck.shift()!);
    }

    setPlayerHand(pHand);
    setBotHand(bHand);
    setDeck(currentDeck);

    if (currentDeck.length === 0) {
      if (pHand.length === 0 && bHand.length === 0) setGameOver('Ничья!');
      else if (pHand.length === 0) { setGameOver('Вы выиграли!'); addCoins(500); }
      else if (bHand.length === 0) setGameOver('Бот выиграл!');
    }

    if (!tookCards) {
      setAttacker(prevDefender);
      setTurn(prevDefender);
    } else {
      setAttacker(prevAttacker);
      setTurn(prevAttacker);
    }
    setTable([]);
    setIsFirstRound(false);
  };

  const handleAttack = (card: Card) => {
    if (turn !== 'player' || attacker !== 'player') return;
    
    const maxOnTable = isFirstRound ? 5 : 6;
    if (table.length >= maxOnTable || table.length >= botHand.length && !table[table.length-1]?.defense) {
      log('Достигнут лимит карт!');
      return;
    }

    if (table.length > 0) {
      const allowedRanks = new Set(table.flatMap(p => [p.attack.rank, p.defense?.rank].filter(Boolean)));
      if (!allowedRanks.has(card.rank)) {
        log('Нельзя подкинуть эту карту!');
        return;
      }
    }

    setTable([...table, { attack: card }]);
    setPlayerHand(playerHand.filter(c => c.id !== card.id));
    setTurn('bot'); // Bot must defend
    log('Вы атаковали ' + card.rank + card.suit);
  };

  const handleDefense = (card: Card) => {
    if (turn !== 'player' || attacker !== 'bot') return;
    
    const indexToDefend = table.findIndex(p => !p.defense);
    if (indexToDefend === -1) return;
    
    const attackCard = table[indexToDefend].attack;
    const canDefend = 
      (card.suit === attackCard.suit && card.value > attackCard.value) ||
      (card.suit === trump?.suit && attackCard.suit !== trump?.suit);

    if (canDefend) {
      const newTable = [...table];
      newTable[indexToDefend].defense = card;
      setTable(newTable);
      setPlayerHand(playerHand.filter(c => c.id !== card.id));
      setTurn('bot'); // Bot can now add more cards
      log('Вы отбились ' + card.rank + card.suit);
    } else {
      log('Этой картой нельзя отбиться!');
    }
  };

  const takeCards = () => {
    if (turn !== 'player' || attacker !== 'bot') return;
    const allCards = table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])]);
    setPlayerHand([...playerHand, ...allCards]);
    log('Вы забрали карты');
    refillHands('bot', 'player', true);
  };

  const passTurn = () => {
    if (turn !== 'player' || attacker !== 'player') return;
    if (table.length === 0) return;
    if (!table.every(p => p.defense)) {
      log('Бот еще не отбился!');
      return;
    }
    log('Бито!');
    refillHands('player', 'bot', false);
  };

  // Bot Logic
  useEffect(() => {
    if (gameOver) return;

    if (turn === 'bot') {
      const timer = setTimeout(() => {
        if (attacker === 'bot') {
          // Bot is attacking
          const maxOnTable = isFirstRound ? 5 : 6;
          const allowedRanks = table.length === 0 ? null : new Set(table.flatMap(p => [p.attack.rank, p.defense?.rank].filter(Boolean)));
          
          let playable = botHand.filter(c => !allowedRanks || allowedRanks.has(c.rank));
          // Limit by defender's hand or table max
          const currentTableCards = table.length;
          const canAddCount = Math.min(maxOnTable - currentTableCards, playerHand.length - (table.some(p => !p.defense) ? 1 : 0));

          if (playable.length > 0 && canAddCount > 0) {
            // Pick lowest non-trump if possible
            const nonTrumps = playable.filter(c => c.suit !== trump?.suit);
            const card = (nonTrumps.length > 0 ? nonTrumps : playable).reduce((min, c) => c.value < min.value ? c : min, playable[0]);
            
            setTable([...table, { attack: card }]);
            setBotHand(botHand.filter(c => c.id !== card.id));
            setTurn('player');
            log('Бот атаковал ' + card.rank + card.suit);
          } else {
            // Bot finishes move
            if (table.every(p => p.defense)) {
              log('Бот сказал БИТО');
              refillHands('bot', 'player', false);
            }
          }
        } else {
          // Bot is defending
          const indexToDefend = table.findIndex(p => !p.defense);
          if (indexToDefend === -1) return;

          const attackCard = table[indexToDefend].attack;
          const defenseOptions = botHand.filter(c => 
            (c.suit === attackCard.suit && c.value > attackCard.value) ||
            (c.suit === trump?.suit && attackCard.suit !== trump?.suit)
          ).sort((a,b) => a.value - b.value);

          if (defenseOptions.length > 0) {
            const defenseCard = defenseOptions[0];
            const newTable = [...table];
            newTable[indexToDefend].defense = defenseCard;
            setTable(newTable);
            setBotHand(botHand.filter(c => c.id !== defenseCard.id));
            setTurn('player');
            log('Бот отбился ' + defenseCard.rank + defenseCard.suit);
          } else {
            // Bot takes cards
            const allCards = table.flatMap(p => [p.attack, ...(p.defense ? [p.defense] : [])]);
            setBotHand([...botHand, ...allCards]);
            log('Бот забрал карты');
            refillHands('player', 'bot', true);
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, botHand, playerHand, table, trump, attacker, isFirstRound, gameOver]);

  return (
    <div className="w-full flex flex-col items-center bg-[#0a0a1a] p-4 md:p-8 rounded-[3rem] border-2 border-cyan-500/10 backdrop-blur-3xl min-h-[700px] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {/* Game Info bar */}
      <div className="w-full flex justify-between items-center mb-10 px-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-cyan-400 italic leading-none">DURAK</h2>
          <span className="text-[10px] text-cyan-500/40 uppercase font-black mt-1">Russian Classic</span>
        </div>
        
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/30 uppercase font-bold">Bot Hand</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: botHand.length }).map((_, i) => (
                <div key={i} className="w-2 h-4 bg-cyan-900 rounded-sm border border-cyan-400/20" />
              ))}
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5" />
          <div className="relative group">
            <div className="w-12 h-18 bg-white/5 border-2 border-white/10 rounded-xl flex flex-col items-center justify-center">
              <span className="text-white font-black text-xl">{deck.length}</span>
              <span className="text-[8px] text-white/40 uppercase font-bold">Deck</span>
            </div>
            {trump && (
              <div className="absolute -bottom-2 -right-2 w-10 h-14 bg-white rounded-lg border-2 border-cyan-500 flex items-center justify-center text-black font-black text-xs rotate-12 shadow-lg">
                {trump.rank}{trump.suit}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 w-full max-w-4xl glass-panel p-6 flex flex-wrap gap-4 md:gap-8 justify-center items-center min-h-[300px] border-white/5 my-4 relative">
        <AnimatePresence>
          {table.map((pair, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-20 h-28 md:w-24 md:h-36"
            >
              <CardComponent card={pair.attack} />
              {pair.defense && (
                <motion.div 
                  initial={{ x: 20, y: 20, rotate: 15, opacity: 0 }}
                  animate={{ x: 15, y: 15, rotate: 15, opacity: 1 }}
                  className="absolute inset-0"
                >
                  <CardComponent card={pair.defense} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {table.length === 0 && (
          <div className="text-white/5 flex flex-col items-center select-none">
             <Trophy size={80} />
             <span className="font-black text-2xl uppercase mt-4">Play Zone</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="absolute bottom-4 right-4 flex gap-4">
          {attacker === 'player' && table.length > 0 && table.every(p => p.defense) && (
            <ActionButton onClick={passTurn} color="bg-cyan-600">
               <Check size={20} /> БИТО
            </ActionButton>
          )}
          {attacker === 'bot' && table.length > 0 && !table.every(p => p.defense) && (
            <ActionButton onClick={takeCards} color="bg-red-600">
               <Hand size={20} /> ВЗЯТЬ
            </ActionButton>
          )}
        </div>
      </div>

      {/* Logs and Turn Info */}
      <div className="w-full flex justify-between items-end mb-4 px-4">
        <div className="space-y-1">
          {gameLog.map((m, i) => (
            <p key={i} className={`text-[10px] font-bold ${i === 0 ? 'text-cyan-400' : 'text-white/20'}`}>{m}</p>
          ))}
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] text-white/40 uppercase font-black mb-1">Current Turn</span>
           <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-lg
             ${turn === 'player' ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-slate-800 text-white/50'}`}>
             {turn === 'player' ? "Your Action" : "Bot's Defense"}
           </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="w-full flex justify-center flex-wrap gap-[-30px] p-4 relative pt-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/20">
           <ArrowDown size={14} />
           <span className="text-[10px] font-black uppercase tracking-widest">Your Hand</span>
           <ArrowDown size={14} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {playerHand.sort((a,b) => {
            if (a.suit === trump?.suit && b.suit !== trump?.suit) return 1;
            if (a.suit !== trump?.suit && b.suit === trump?.suit) return -1;
            return a.value - b.value;
          }).map((card) => (
            <motion.div 
              key={card.id}
              whileHover={{ y: -30, zIndex: 50, scale: 1.1 }}
              onClick={() => attacker === 'player' ? handleAttack(card) : handleDefense(card)}
              className="relative"
            >
              <CardComponent card={card} interactive isTrump={card.suit === trump?.suit} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-2xl"
          >
            <div className="text-center p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl">
              <Trophy className="mx-auto text-yellow-400 mb-6" size={80} />
              <h3 className="text-6xl font-display font-black text-white mb-2 italic">{gameOver}</h3>
              <p className="text-cyan-400 font-bold tracking-[0.4em] uppercase mb-12">Game Over</p>
              <button 
                onClick={startNewGame} 
                className="group flex items-center gap-4 px-12 py-5 bg-cyan-500 text-black rounded-3xl font-black text-2xl hover:bg-white transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" />
                REMATCH
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CardComponent: React.FC<{ card: Card; isTrump?: boolean; interactive?: boolean }> = ({ card, isTrump, interactive }) => {
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div className={`w-20 h-28 md:w-24 md:h-36 bg-white rounded-2xl border-2 flex flex-col items-center justify-between p-3 md:p-4 shadow-xl select-none transition-all
      ${interactive ? 'cursor-pointer hover:border-cyan-500' : 'border-slate-200'}
      ${isTrump ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-slate-200'}`}>
      
      <div className="w-full flex justify-between items-start">
        <span className={`font-black text-lg md:text-xl leading-none ${isRed ? 'text-red-500' : 'text-black'}`}>
          {card.rank}
        </span>
        <span className={`text-xl md:text-2xl leading-none ${isRed ? 'text-red-500' : 'text-black'}`}>
          {card.suit}
        </span>
      </div>

      <div className={`text-4xl md:text-5xl leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none ${isRed ? 'text-red-500' : 'text-black'}`}>
        {card.suit}
      </div>

      <div className="w-full flex justify-between items-end rotate-180">
        <span className={`font-black text-lg md:text-xl leading-none ${isRed ? 'text-red-500' : 'text-black'}`}>
          {card.rank}
        </span>
        <span className={`text-xl md:text-2xl leading-none ${isRed ? 'text-red-500' : 'text-black'}`}>
          {card.suit}
        </span>
      </div>

      {isTrump && (
        <div className="absolute -top-1 -right-1">
           <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_yellow]" />
        </div>
      )}
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; color: string }> = ({ onClick, children, color }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 ${color} text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg`}
  >
    {children}
  </button>
);

