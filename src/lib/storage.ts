import { PlayerRecord } from '../types';

const STORAGE_KEY = 'gohaRecords';

export const getLeaderboard = (): PlayerRecord[] => {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
};

export const saveScore = (name: string, score: number) => {
  let records = getLeaderboard();
  const existingPlayerIndex = records.findIndex(r => r.name === name);

  if (existingPlayerIndex > -1) {
    if (score > records[existingPlayerIndex].score) {
      records[existingPlayerIndex].score = score;
    }
  } else {
    records.push({ name, score });
  }

  records.sort((a, b) => b.score - a.score);
  records = records.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};
