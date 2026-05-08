import type { CollectionItem, WantListItem } from "./collectionTypes";
import type { TradeMatch, TradeProposal, TradeStatus, TradeUser } from "./tradeTypes";

const TRADES_KEY = "collecthub_trades";

// ── Trade Proposals CRUD ──

export function loadTrades(): TradeProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTrades(trades: TradeProposal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function addTrade(trade: TradeProposal): TradeProposal[] {
  const trades = loadTrades();
  trades.push(trade);
  saveTrades(trades);
  return trades;
}

export function updateTradeStatus(id: string, status: TradeStatus): TradeProposal[] {
  const trades = loadTrades().map((t) =>
    t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
  );
  saveTrades(trades);
  return trades;
}

export function removeTrade(id: string): TradeProposal[] {
  const trades = loadTrades().filter((t) => t.id !== id);
  saveTrades(trades);
  return trades;
}

export function getTradesByStatus(status: TradeStatus): TradeProposal[] {
  return loadTrades().filter((t) => t.status === status);
}

// ── Match Scoring ──

function computeMatchScore(
  theirCard: CollectionItem,
  myWant: WantListItem
): number {
  let score = 50; // base: playerName + year matched

  if (
    myWant.setName &&
    theirCard.setName &&
    myWant.setName.toLowerCase() === theirCard.setName.toLowerCase()
  ) {
    score += 20;
  }

  if (
    myWant.condition.gradingCompany !== "raw" &&
    theirCard.condition.gradingCompany === myWant.condition.gradingCompany
  ) {
    score += 10;
  }

  if (
    myWant.condition.grade != null &&
    theirCard.condition.grade != null
  ) {
    if (theirCard.condition.grade >= myWant.condition.grade) {
      score += 15;
    }
    if (theirCard.condition.grade === myWant.condition.grade) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

// ── Trade Matching ──

export function findTradeMatches(
  myWantList: WantListItem[],
  otherUsers: { user: TradeUser; cards: CollectionItem[] }[]
): TradeMatch[] {
  const matches: TradeMatch[] = [];

  for (const { user, cards } of otherUsers) {
    for (const card of cards) {
      if (!card.forTrade) continue;

      for (const want of myWantList) {
        if (want.playerName.toLowerCase() !== card.playerName.toLowerCase()) {
          continue;
        }

        if (want.year != null && card.year != null && want.year !== card.year) {
          continue;
        }

        if (
          want.setName &&
          card.setName &&
          want.setName.toLowerCase() !== card.setName.toLowerCase()
        ) {
          continue;
        }

        if (
          want.condition.gradingCompany !== "raw" &&
          card.condition.gradingCompany !== "raw" &&
          want.condition.gradingCompany !== card.condition.gradingCompany
        ) {
          continue;
        }

        if (
          want.condition.grade != null &&
          card.condition.grade != null &&
          card.condition.grade < want.condition.grade
        ) {
          continue;
        }

        const matchScore = computeMatchScore(card, want);
        matches.push({
          id: `match-${user.id}-${card.id}-${want.id}`,
          user,
          theirCard: card,
          myWant: want,
          matchScore,
          estimatedValue: card.purchasePrice,
        });
      }
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
