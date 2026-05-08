import type { CollectionItem, WantListItem } from "./collectionTypes";

export interface TradeUser {
  id: string;
  name: string;
  avatarColor: string;
  rating: number;
  totalTrades: number;
}

export interface TradeMatch {
  id: string;
  user: TradeUser;
  theirCard: CollectionItem;
  myWant: WantListItem;
  matchScore: number;
  estimatedValue: number;
}

export type TradeStatus = "proposed" | "incoming" | "accepted" | "declined";

export interface TradeProposal {
  id: string;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
  matchId: string;
  theirUser: TradeUser;
  theirCard: CollectionItem;
  myWant: WantListItem;
  myOfferedCards: CollectionItem[];
  cashOffer: number;
  message?: string;
}
