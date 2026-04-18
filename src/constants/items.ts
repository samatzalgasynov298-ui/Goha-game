export type Rarity = 'Common' | 'Rare' | 'Legendary';

export interface GameItem {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  price: number;
  sellPrice: number;
}

export const ITEMS_CONFIG: GameItem[] = [
  { 
    id: 'item-1', 
    name: 'Baha', 
    image: '/img/photo_baha.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-2', 
    name: 'Gyro', 
    image: '/img/gyro.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-3', 
    name: '67676767', 
    image: '/img/67.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-4', 
    name: 'Steve', 
    image: '/img/steve.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-5', 
    name: 'Ronaldo', 
    image: '/img/ronaldo.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-6', 
    name: 'Ellie', 
    image: '/img/peter.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-7', 
    name: 'Fang', 
    image: '/img/fang.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-8', 
    name: 'Johny', 
    image: '/img/johny.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-9', 
    name: 'Ronaldo Kiss', 
    image: '/img/ronaldo kiss.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-10', 
    name: 'Steve Harrington', 
    image: '/img/steve.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-11', 
    name: 'Levi', 
    image: '/img/levi bald.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-12', 
    name: 'Ratatouille', 
    image: '/img/remi ratatui.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-13', 
    name: 'LilUziVert', 
    image: '/img/liluzi.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-14', 
    name: 'Masuka', 
    image: '/img/masuka.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-15', 
    name: 'Your Dream', 
    image: '/img/melodie.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-16', 
    name: 'Misa', 
    image: '/img/misa.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-17', 
    name: 'Morgenshtern', 
    image: '/img/morgen.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-18', 
    name: 'Патрик', 
    image: '/img/patrik.jpg', 
    rarity: 'Rare', 
    price: 1500, 
    sellPrice: 750 
  },
  { 
    id: 'item-19', 
    name: 'Peter', 
    image: '/img/peter.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-20', 
    name: 'Ratatouille 2', 
    image: '/img/remi ratatui.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-21', 
    name: 'Ricardo', 
    image: '/img/ricardo.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-22', 
    name: 'invincible', 
    image: '/img/invincible.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-22', 
    name: 'Саматпро228', 
    image: '/img/photo_2026-04-18_05-19-34Samat.jpg', 
    rarity: 'Legendary', 
    price: 5000, 
    sellPrice: 2500 
  },
];

export const CASE_PRICE = 200;
