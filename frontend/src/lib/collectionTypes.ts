export interface CardCondition {
  gradingCompany: "PSA" | "BGS" | "SGC" | "raw";
  grade: number | null; // null if raw
}

export interface CardIdentity {
  playerName: string;
  year?: number;
  brand?: string;
  setName?: string;
  condition: CardCondition;
}

export interface CollectionItem extends CardIdentity {
  id: string;
  certNumber?: string;
  purchasePrice: number;
  currentValue?: number; // derived dynamically, never hardcoded
  forTrade: boolean;
  notes?: string;
  dateAdded: string;
}

export interface WantListItem extends CardIdentity {
  id: string;
  maxPrice: number;
  priority: "low" | "medium" | "high";
  dateAdded: string;
  // condition.grade = MINIMUM acceptable grade
  // e.g. grade: 8 matches PSA 8, 9, and 10
}
