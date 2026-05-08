import type { CollectionItem } from "./collectionTypes";
import type { TradeUser } from "./tradeTypes";

const MOCK_USERS: TradeUser[] = [
  { id: "user-mc", name: "Marcus Chen", avatarColor: "#3b82f6", rating: 4.8, totalTrades: 47 },
  { id: "user-sr", name: "Sarah Rodriguez", avatarColor: "#ec4899", rating: 4.9, totalTrades: 82 },
  { id: "user-jt", name: "Jake Thompson", avatarColor: "#f59e0b", rating: 4.5, totalTrades: 23 },
  { id: "user-pp", name: "Priya Patel", avatarColor: "#8b5cf6", rating: 5.0, totalTrades: 61 },
  { id: "user-dw", name: "Devon Williams", avatarColor: "#10b981", rating: 4.3, totalTrades: 15 },
];

const MOCK_COLLECTIONS: Record<string, CollectionItem[]> = {
  "user-mc": [
    {
      id: "mc-1",
      playerName: "Shohei Ohtani",
      year: 2018,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "PSA", grade: 9 },
      purchasePrice: 1800,
      forTrade: true,
      dateAdded: "2025-11-10T00:00:00Z",
    },
    {
      id: "mc-2",
      playerName: "Aaron Judge",
      year: 2017,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "BGS", grade: 9.5 },
      purchasePrice: 2200,
      forTrade: true,
      dateAdded: "2025-09-22T00:00:00Z",
    },
    {
      id: "mc-3",
      playerName: "Fernando Tatis Jr.",
      year: 2019,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "PSA", grade: 8 },
      purchasePrice: 400,
      forTrade: true,
      dateAdded: "2026-01-05T00:00:00Z",
    },
  ],
  "user-sr": [
    {
      id: "sr-1",
      playerName: "Mike Trout",
      year: 2011,
      brand: "Topps",
      setName: "Topps Update",
      condition: { gradingCompany: "PSA", grade: 8 },
      purchasePrice: 12000,
      forTrade: true,
      dateAdded: "2025-06-15T00:00:00Z",
    },
    {
      id: "sr-2",
      playerName: "Juan Soto",
      year: 2018,
      brand: "Topps",
      setName: "Topps Update",
      condition: { gradingCompany: "PSA", grade: 10 },
      purchasePrice: 4200,
      forTrade: true,
      dateAdded: "2025-08-20T00:00:00Z",
    },
    {
      id: "sr-3",
      playerName: "Mookie Betts",
      year: 2014,
      brand: "Bowman",
      setName: "Bowman Chrome",
      condition: { gradingCompany: "PSA", grade: 9 },
      purchasePrice: 1300,
      forTrade: true,
      dateAdded: "2025-12-01T00:00:00Z",
    },
  ],
  "user-jt": [
    {
      id: "jt-1",
      playerName: "Julio Rodríguez",
      year: 2022,
      brand: "Topps",
      setName: "Topps Series 1",
      condition: { gradingCompany: "PSA", grade: 10 },
      purchasePrice: 600,
      forTrade: true,
      dateAdded: "2026-02-14T00:00:00Z",
    },
    {
      id: "jt-2",
      playerName: "Ronald Acuña Jr.",
      year: 2018,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "BGS", grade: 9.5 },
      purchasePrice: 1100,
      forTrade: true,
      dateAdded: "2025-10-30T00:00:00Z",
    },
  ],
  "user-pp": [
    {
      id: "pp-1",
      playerName: "Shohei Ohtani",
      year: 2018,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "BGS", grade: 10 },
      purchasePrice: 3800,
      forTrade: true,
      dateAdded: "2025-07-18T00:00:00Z",
    },
    {
      id: "pp-2",
      playerName: "Aaron Judge",
      year: 2017,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "PSA", grade: 10 },
      purchasePrice: 3500,
      forTrade: true,
      dateAdded: "2025-05-04T00:00:00Z",
    },
  ],
  "user-dw": [
    {
      id: "dw-1",
      playerName: "Fernando Tatis Jr.",
      year: 2019,
      brand: "Topps",
      setName: "Topps Chrome",
      condition: { gradingCompany: "SGC", grade: 9 },
      purchasePrice: 550,
      forTrade: true,
      dateAdded: "2026-03-01T00:00:00Z",
    },
    {
      id: "dw-2",
      playerName: "Mike Trout",
      year: 2011,
      brand: "Topps",
      setName: "Topps Update",
      condition: { gradingCompany: "raw", grade: null },
      purchasePrice: 5000,
      forTrade: true,
      dateAdded: "2025-11-28T00:00:00Z",
    },
  ],
};

const IMAGE_COLORS: Record<string, string> = {
  "Shohei Ohtani": "#005A9C",
  "Aaron Judge": "#003087",
  "Fernando Tatis Jr.": "#2F241D",
  "Mike Trout": "#BA0021",
  "Juan Soto": "#002D72",
  "Mookie Betts": "#005A9C",
  "Julio Rodríguez": "#005C5C",
  "Ronald Acuña Jr.": "#CE1141",
};

export function getImageColor(player: string): string {
  return IMAGE_COLORS[player] ?? "#1a365d";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTradeUsers(): Promise<TradeUser[]> {
  await delay(300);
  return [...MOCK_USERS];
}

export async function fetchAllTradeableCards(): Promise<
  { user: TradeUser; cards: CollectionItem[] }[]
> {
  await delay(700);
  return MOCK_USERS.map((user) => ({
    user,
    cards: MOCK_COLLECTIONS[user.id] ?? [],
  }));
}
