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
    image: '/public/photo_baha.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-2', 
    name: 'Gyro', 
    image: '/photo_baha.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-3', 
    name: '67676767', 
    image: '/67.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-4', 
    name: 'Choso', 
    image: '/chosojjk.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-5', 
    name: 'Ronaldo', 
    image: '/ronaldo.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-6', 
    name: 'Ellie', 
    image: '/Ellie.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-7', 
    name: 'Fang', 
    image: '/fang.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-8', 
    name: 'Johny', 
    image: '/johny.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-9', 
    name: 'Ronaldo Kiss', 
    image: '/ronaldo kiss.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-10', 
    name: 'SteveHarrington', 
    image: '/steve.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-11', 
    name: 'L', 
    image: '/L bald.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-12', 
    name: 'Красавчик', 
    image: '/levi bald.jpg', 
    rarity: 'Common', 
    price: 150, 
    sellPrice: 75 
  },
  { 
    id: 'item-13', 
    name: 'LilUziVert', 
    image: '/liluzi.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-14', 
    name: 'Masuka', 
    image: '/masuka.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-15', 
    name: 'Your Dream', 
    image: '/melodie.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-16', 
    name: 'Красотка', 
    image: '/misa.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-17', 
    name: 'Morgenshtern', 
    image: '/morgen.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-18', 
    name: 'Патрик', 
    image: '/patrik.jpg', 
    rarity: 'Rare', 
    price: 1500, 
    sellPrice: 750 
  },
  { 
    id: 'item-19', 
    name: 'Peter', 
    image: '/peter.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-20', 
    name: 'Рататуй', 
    image: '/remi ratatui.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-21', 
    name: 'Ричард', 
    image: '/ricardo.jpg', 
    rarity: 'Rare', 
    price: 800, 
    sellPrice: 400 
  },
  { 
    id: 'item-22', 
    name: 'Саматпро228', 
    image: '/photo_2026-04-18_05-19-34.jpg', 
    rarity: 'Legendary', 
    price: 5000, 
    sellPrice: 2500 
  },
];

export const CASE_PRICE = 200;
