export interface AuctionListing {
  id: string;
  title: string;
  player: string;
  team: string;
  year: string;
  set: string;
  grade: number;
  gradeLabel: string;
  auctionHouse: string;
  currentBid: number;
  startingBid: number;
  estimatedValue: number;
  bidCount: number;
  endsAt: string;
  imageColor: string;
  condition: string;
  cardNumber: string;
  marketAvgPrice: number;
}

export interface AuctionHouseInventory {
  auctionHouse: string;
  totalListings: number;
  listings: AuctionListing[];
}

export interface BidResponse {
  success: boolean;
  message: string;
  newBid: number;
  bidCount: number;
}

export interface PriceHistory {
  date: string;
  price: number;
  source: string;
}

export interface CardValuation {
  cardId: string;
  estimatedValue: number;
  priceRange: { low: number; high: number };
  recentSales: PriceHistory[];
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

const MOCK_LISTINGS: AuctionListing[] = [
  {
    id: "fan-001",
    title: "2018 Topps Chrome Shohei Ohtani RC #150",
    player: "Shohei Ohtani",
    team: "LAA",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Fanatics",
    currentBid: 2450,
    startingBid: 1500,
    estimatedValue: 3200,
    bidCount: 18,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    imageColor: "#005A9C",
    condition: "PSA 10",
    cardNumber: "#150",
    marketAvgPrice: 3050,
  },
  {
    id: "fan-002",
    title: "2011 Topps Update Mike Trout RC #US175",
    player: "Mike Trout",
    team: "LAA",
    year: "2011",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Fanatics",
    currentBid: 45000,
    startingBid: 35000,
    estimatedValue: 55000,
    bidCount: 42,
    endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    imageColor: "#BA0021",
    condition: "PSA 10",
    cardNumber: "#US175",
    marketAvgPrice: 53000,
  },
  {
    id: "gol-001",
    title: "2017 Topps Chrome Aaron Judge RC #169",
    player: "Aaron Judge",
    team: "NYY",
    year: "2017",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Goldin",
    currentBid: 1850,
    startingBid: 1200,
    estimatedValue: 2400,
    bidCount: 14,
    endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    imageColor: "#003087",
    condition: "PSA 10",
    cardNumber: "#169",
    marketAvgPrice: 2300,
  },
  {
    id: "gol-002",
    title: "2018 Topps Chrome Ronald Acuña Jr. RC #193",
    player: "Ronald Acuña Jr.",
    team: "ATL",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Goldin",
    currentBid: 980,
    startingBid: 600,
    estimatedValue: 1400,
    bidCount: 22,
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    imageColor: "#CE1141",
    condition: "PSA 10",
    cardNumber: "#193",
    marketAvgPrice: 1250,
  },
  {
    id: "pwcc-001",
    title: "2019 Topps Chrome Fernando Tatis Jr. RC #203",
    player: "Fernando Tatis Jr.",
    team: "SD",
    year: "2019",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "PWCC",
    currentBid: 520,
    startingBid: 300,
    estimatedValue: 750,
    bidCount: 9,
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    imageColor: "#2F241D",
    condition: "PSA 10",
    cardNumber: "#203",
    marketAvgPrice: 680,
  },
  {
    id: "pwcc-002",
    title: "2022 Topps Series 1 Julio Rodríguez RC #659",
    player: "Julio Rodríguez",
    team: "SEA",
    year: "2022",
    set: "Topps Series 1",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "PWCC",
    currentBid: 340,
    startingBid: 200,
    estimatedValue: 500,
    bidCount: 11,
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    imageColor: "#005C5C",
    condition: "PSA 10",
    cardNumber: "#659",
    marketAvgPrice: 450,
  },
  {
    id: "fan-003",
    title: "2014 Bowman Chrome Mookie Betts RC #BCP109",
    player: "Mookie Betts",
    team: "LAD",
    year: "2014",
    set: "Bowman Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Fanatics",
    currentBid: 1200,
    startingBid: 800,
    estimatedValue: 1600,
    bidCount: 16,
    endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    imageColor: "#005A9C",
    condition: "PSA 10",
    cardNumber: "#BCP109",
    marketAvgPrice: 1500,
  },
  {
    id: "gol-003",
    title: "2018 Topps Update Juan Soto RC #US300",
    player: "Juan Soto",
    team: "NYM",
    year: "2018",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    auctionHouse: "Goldin",
    currentBid: 2800,
    startingBid: 2000,
    estimatedValue: 3500,
    bidCount: 25,
    endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    imageColor: "#002D72",
    condition: "PSA 10",
    cardNumber: "#US300",
    marketAvgPrice: 3300,
  },
];

const MOCK_VALUATIONS: Record<string, CardValuation> = {
  "fan-001": {
    cardId: "fan-001",
    estimatedValue: 3200,
    priceRange: { low: 2800, high: 3800 },
    recentSales: [
      { date: "2026-03-01", price: 3100, source: "eBay" },
      { date: "2026-02-15", price: 2950, source: "PWCC" },
      { date: "2026-02-01", price: 3300, source: "Goldin" },
      { date: "2026-01-15", price: 2800, source: "Fanatics" },
    ],
    trend: "up",
    trendPercent: 8.5,
  },
  "fan-002": {
    cardId: "fan-002",
    estimatedValue: 55000,
    priceRange: { low: 48000, high: 62000 },
    recentSales: [
      { date: "2026-02-20", price: 52000, source: "Goldin" },
      { date: "2026-01-10", price: 49500, source: "PWCC" },
      { date: "2025-12-05", price: 58000, source: "Heritage" },
    ],
    trend: "stable",
    trendPercent: 1.2,
  },
  "gol-001": {
    cardId: "gol-001",
    estimatedValue: 2400,
    priceRange: { low: 2000, high: 2800 },
    recentSales: [
      { date: "2026-02-28", price: 2350, source: "eBay" },
      { date: "2026-02-10", price: 2100, source: "PWCC" },
      { date: "2026-01-20", price: 2500, source: "Fanatics" },
    ],
    trend: "up",
    trendPercent: 5.2,
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAuctionListings(
  auctionHouse?: string
): Promise<AuctionListing[]> {
  await delay(800);
  if (auctionHouse) {
    return MOCK_LISTINGS.filter(
      (l) => l.auctionHouse.toLowerCase() === auctionHouse.toLowerCase()
    );
  }
  return [...MOCK_LISTINGS];
}

export async function fetchAuctionInventory(): Promise<AuctionHouseInventory[]> {
  await delay(600);
  const houses = ["Fanatics", "Goldin", "PWCC"];
  return houses.map((house) => {
    const listings = MOCK_LISTINGS.filter((l) => l.auctionHouse === house);
    return {
      auctionHouse: house,
      totalListings: listings.length,
      listings,
    };
  });
}

export async function placeBid(
  listingId: string,
  bidAmount: number
): Promise<BidResponse> {
  await delay(1200);
  const listing = MOCK_LISTINGS.find((l) => l.id === listingId);
  if (!listing) {
    return {
      success: false,
      message: "Listing not found",
      newBid: 0,
      bidCount: 0,
    };
  }
  if (bidAmount <= listing.currentBid) {
    return {
      success: false,
      message: `Bid must be higher than current bid of $${listing.currentBid.toLocaleString()}`,
      newBid: listing.currentBid,
      bidCount: listing.bidCount,
    };
  }
  listing.currentBid = bidAmount;
  listing.bidCount += 1;
  return {
    success: true,
    message: "Bid placed successfully!",
    newBid: bidAmount,
    bidCount: listing.bidCount,
  };
}

export async function fetchCardValuation(
  cardId: string
): Promise<CardValuation | null> {
  await delay(500);
  return MOCK_VALUATIONS[cardId] ?? null;
}

export async function searchListings(query: string): Promise<AuctionListing[]> {
  await delay(400);
  const q = query.toLowerCase();
  return MOCK_LISTINGS.filter(
    (l) =>
      l.player.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.team.toLowerCase().includes(q) ||
      l.set.toLowerCase().includes(q)
  );
}
