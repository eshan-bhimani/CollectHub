import type { CollectionItem, WantListItem } from "./collectionTypes";
import type { AuctionListing } from "./mockAuctionApi";
import { evaluateBid, loadStrategy } from "./pricingStrategy";

const COLLECTION_KEY = "collecthub_collection";
const WANT_LIST_KEY = "collecthub_want_list";

// ---------------------------------------------------------------------------
// Collection persistence
// ---------------------------------------------------------------------------

export function loadCollection(): CollectionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCollection(items: CollectionItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(items));
}

export function addCollectionItem(item: CollectionItem): CollectionItem[] {
  const items = loadCollection();
  items.push(item);
  saveCollection(items);
  return items;
}

export function removeCollectionItem(id: string): CollectionItem[] {
  const items = loadCollection().filter((i) => i.id !== id);
  saveCollection(items);
  return items;
}

export function updateCollectionItem(
  id: string,
  updates: Partial<CollectionItem>
): CollectionItem[] {
  const items = loadCollection().map((i) =>
    i.id === id ? { ...i, ...updates } : i
  );
  saveCollection(items);
  return items;
}

// ---------------------------------------------------------------------------
// Want list persistence
// ---------------------------------------------------------------------------

export function loadWantList(): WantListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WANT_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWantList(items: WantListItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WANT_LIST_KEY, JSON.stringify(items));
}

export function addWantListItem(item: WantListItem): WantListItem[] {
  const items = loadWantList();
  items.push(item);
  saveWantList(items);
  return items;
}

export function removeWantListItem(id: string): WantListItem[] {
  const items = loadWantList().filter((i) => i.id !== id);
  saveWantList(items);
  return items;
}

export function updateWantListItem(
  id: string,
  updates: Partial<WantListItem>
): WantListItem[] {
  const items = loadWantList().map((i) =>
    i.id === id ? { ...i, ...updates } : i
  );
  saveWantList(items);
  return items;
}

// ---------------------------------------------------------------------------
// Matching logic — pure function
// ---------------------------------------------------------------------------

export function matchWantListItems(
  listing: AuctionListing,
  wantList: WantListItem[]
): WantListItem[] {
  return wantList.filter((want) => {
    // playerName — always required, case-insensitive
    if (
      want.playerName.toLowerCase() !== listing.player.toLowerCase()
    ) {
      return false;
    }

    // year — if specified on want item, must match listing exactly
    if (
      want.year !== undefined &&
      want.year.toString() !== listing.year.toString()
    ) {
      return false;
    }

    // setName — if specified, must match listing
    if (
      want.setName !== undefined &&
      want.setName.toLowerCase() !== listing.set.toLowerCase()
    ) {
      return false;
    }

    // gradingCompany — if not "raw", must match listing
    if (
      want.condition.gradingCompany !== "raw" &&
      want.condition.gradingCompany !== listing.gradingCompany
    ) {
      return false;
    }

    // grade — if specified, listing grade must be >= want item grade
    if (
      want.condition.grade !== null &&
      listing.grade < want.condition.grade
    ) {
      return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Current value resolution
// ---------------------------------------------------------------------------

export function resolveCurrentValue(
  item: CollectionItem,
  listings: AuctionListing[]
): number | null {
  // Find a matching active auction listing using a similar matching approach
  const match = listings.find((listing) => {
    if (
      item.playerName.toLowerCase() !== listing.player.toLowerCase()
    ) {
      return false;
    }
    if (
      item.year !== undefined &&
      item.year.toString() !== listing.year.toString()
    ) {
      return false;
    }
    if (
      item.setName !== undefined &&
      item.setName.toLowerCase() !== listing.set.toLowerCase()
    ) {
      return false;
    }
    if (
      item.condition.gradingCompany !== "raw" &&
      item.condition.gradingCompany !== listing.gradingCompany
    ) {
      return false;
    }
    if (
      item.condition.grade !== null &&
      listing.grade < item.condition.grade
    ) {
      return false;
    }
    return true;
  });

  if (!match) return null;

  const strategy = loadStrategy();
  const evaluation = evaluateBid(
    match.currentBid,
    match.marketAvgPrice,
    match.auctionHouse,
    strategy
  );
  return evaluation.trueCost;
}
