export type PriceSource = "VCP" | "CardLadder";

export interface PricingStrategy {
  enabled: boolean;
  bidThresholdPercent: number; // -30 to +30, negative = below market, positive = above
  priceSource: PriceSource;
}

export interface BidEvaluation {
  shouldBid: boolean;
  maxBid: number;
  trueCost: number;
  percentageFromAvg: number;
  recommendation: string;
}

export const BUYER_PREMIUMS: Record<string, number> = {
  eBay: 0.13,
  Fanatics: 0.15,
  Goldin: 0.22,
  SIRIUS: 0.12,
  PWCC: 0.15,
};

export const PLATFORM_LIST = Object.entries(BUYER_PREMIUMS).map(
  ([name, rate]) => ({ name, rate, displayRate: `${Math.round(rate * 100)}%` })
);

const STORAGE_KEY = "collecthub_pricing_strategy";

const DEFAULT_STRATEGY: PricingStrategy = {
  enabled: true,
  bidThresholdPercent: 0,
  priceSource: "VCP",
};

export function loadStrategy(): PricingStrategy {
  if (typeof window === "undefined") return DEFAULT_STRATEGY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STRATEGY;
    return { ...DEFAULT_STRATEGY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STRATEGY;
  }
}

export function saveStrategy(strategy: PricingStrategy): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
}

export function evaluateBid(
  currentBid: number,
  marketAvg: number,
  platform: string,
  strategy: PricingStrategy
): BidEvaluation {
  const premiumRate = BUYER_PREMIUMS[platform] ?? 0.15;
  const trueCost = currentBid * (1 + premiumRate);
  const percentageFromAvg =
    marketAvg > 0 ? ((trueCost - marketAvg) / marketAvg) * 100 : 0;
  const thresholdPrice = marketAvg * (1 + strategy.bidThresholdPercent / 100);
  const maxBid = thresholdPrice / (1 + premiumRate);
  const shouldBid = strategy.enabled ? trueCost <= thresholdPrice : true;

  let recommendation: string;
  if (!strategy.enabled) {
    recommendation = "Strategy disabled";
  } else if (percentageFromAvg <= -10) {
    recommendation = `Great deal — ${Math.abs(Math.round(percentageFromAvg))}% below market`;
  } else if (percentageFromAvg < 0) {
    recommendation = `Good deal — ${Math.abs(Math.round(percentageFromAvg))}% below market`;
  } else if (percentageFromAvg <= 5) {
    recommendation = `Near market — ${Math.round(percentageFromAvg)}% above market`;
  } else {
    recommendation = `Over budget — ${Math.round(percentageFromAvg)}% above market`;
  }

  return {
    shouldBid,
    maxBid: Math.max(0, Math.round(maxBid * 100) / 100),
    trueCost: Math.round(trueCost * 100) / 100,
    percentageFromAvg: Math.round(percentageFromAvg * 10) / 10,
    recommendation,
  };
}

export type BadgeLevel = "good" | "near-limit" | "over-budget";

export function getBadgeLevel(
  percentageFromAvg: number,
  thresholdPercent: number
): BadgeLevel {
  const distance = percentageFromAvg - thresholdPercent;
  if (distance <= 0) return "good";
  if (distance <= 5) return "near-limit";
  return "over-budget";
}
