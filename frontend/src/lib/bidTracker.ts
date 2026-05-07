export interface TrackedBid {
  listingId: string;
  bidAmount: number;
  bidAt: string;
  player: string;
  title: string;
  auctionHouse: string;
  endsAt: string;
  imageColor: string;
  gradingCompany: "PSA" | "BGS" | "SGC" | "raw";
  grade: number;
}

export type BidNotificationType = "outbid" | "time-warning" | "ending-now" | "won";

export interface BidNotification {
  id: string;
  listingId: string;
  type: BidNotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  player: string;
}

const TRACKED_BIDS_KEY = "collecthub_tracked_bids";
const NOTIFICATIONS_KEY = "collecthub_bid_notifications";
const DISMISSED_WARNINGS_KEY = "collecthub_dismissed_warnings";

export function loadTrackedBids(): TrackedBid[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRACKED_BIDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTrackedBids(bids: TrackedBid[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRACKED_BIDS_KEY, JSON.stringify(bids));
}

export function trackBid(bid: TrackedBid): TrackedBid[] {
  const bids = loadTrackedBids();
  const existing = bids.findIndex((b) => b.listingId === bid.listingId);
  if (existing >= 0) {
    bids[existing] = bid;
  } else {
    bids.push(bid);
  }
  saveTrackedBids(bids);
  return bids;
}

export function removeTrackedBid(listingId: string): TrackedBid[] {
  const bids = loadTrackedBids().filter((b) => b.listingId !== listingId);
  saveTrackedBids(bids);
  return bids;
}

export function loadNotifications(): BidNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: BidNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addNotification(
  notification: Omit<BidNotification, "id" | "createdAt" | "read">
): BidNotification[] {
  const notifications = loadNotifications();
  const exists = notifications.some(
    (n) => n.listingId === notification.listingId && n.type === notification.type && !n.read
  );
  if (exists) return notifications;

  notifications.unshift({
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  if (notifications.length > 50) notifications.length = 50;
  saveNotifications(notifications);
  return notifications;
}

export function markNotificationRead(id: string): BidNotification[] {
  const notifications = loadNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(notifications);
  return notifications;
}

export function markAllNotificationsRead(): BidNotification[] {
  const notifications = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifications);
  return notifications;
}

export function clearNotifications(): BidNotification[] {
  saveNotifications([]);
  return [];
}

function loadDismissedWarnings(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_WARNINGS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedWarnings(set: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_WARNINGS_KEY, JSON.stringify([...set]));
}

export interface AuctionSnapshot {
  id: string;
  currentBid: number;
  endsAt: string;
  player: string;
}

export function checkBidsForAlerts(
  trackedBids: TrackedBid[],
  currentListings: AuctionSnapshot[]
): BidNotification[] {
  const dismissed = loadDismissedWarnings();
  let notifications = loadNotifications();

  for (const tracked of trackedBids) {
    const listing = currentListings.find((l) => l.id === tracked.listingId);
    if (!listing) continue;

    const diff = new Date(listing.endsAt).getTime() - Date.now();
    const minutesLeft = diff / (1000 * 60);

    if (listing.currentBid > tracked.bidAmount) {
      const key = `outbid-${tracked.listingId}-${listing.currentBid}`;
      if (!dismissed.has(key)) {
        notifications = addNotification({
          listingId: tracked.listingId,
          type: "outbid",
          message: `You've been outbid on ${tracked.player}! Current bid: $${listing.currentBid.toLocaleString()}`,
          player: tracked.player,
        });
        dismissed.add(key);
      }
    }

    if (minutesLeft > 0 && minutesLeft <= 30) {
      const key = `time-30-${tracked.listingId}`;
      if (!dismissed.has(key)) {
        notifications = addNotification({
          listingId: tracked.listingId,
          type: "time-warning",
          message: `${tracked.player} auction ends in ${Math.ceil(minutesLeft)} minutes`,
          player: tracked.player,
        });
        dismissed.add(key);
      }
    }

    if (minutesLeft > 0 && minutesLeft <= 5) {
      const key = `time-5-${tracked.listingId}`;
      if (!dismissed.has(key)) {
        notifications = addNotification({
          listingId: tracked.listingId,
          type: "ending-now",
          message: `${tracked.player} auction ending NOW — ${Math.ceil(minutesLeft)} min left!`,
          player: tracked.player,
        });
        dismissed.add(key);
      }
    }

    if (diff <= 0 && listing.currentBid <= tracked.bidAmount) {
      const key = `won-${tracked.listingId}`;
      if (!dismissed.has(key)) {
        notifications = addNotification({
          listingId: tracked.listingId,
          type: "won",
          message: `You may have won ${tracked.player} for $${tracked.bidAmount.toLocaleString()}!`,
          player: tracked.player,
        });
        dismissed.add(key);
      }
    }
  }

  saveDismissedWarnings(dismissed);
  return notifications;
}
