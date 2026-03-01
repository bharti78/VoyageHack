const BOOKING_LEDGER_KEY = "voyagehack.booking.ledger.v1";

function safeReadLedger() {
  try {
    const raw = localStorage.getItem(BOOKING_LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteLedger(list) {
  try {
    localStorage.setItem(BOOKING_LEDGER_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage failures so booking flow never breaks.
  }
}

function getActiveUserKey() {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : {};
    return String(user?._id || user?.id || user?.email || user?.name || "guest").toLowerCase();
  } catch {
    return "guest";
  }
}

export function saveBookingRecord(record) {
  if (!record || typeof record !== "object") return;
  const ledger = safeReadLedger();
  const next = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    userKey: getActiveUserKey(),
    service: "unknown",
    ...record,
  };
  ledger.unshift(next);
  safeWriteLedger(ledger.slice(0, 300));
}

export function getBookingRecords() {
  const userKey = getActiveUserKey();
  return safeReadLedger().filter((item) => String(item?.userKey || "").toLowerCase() === userKey);
}

export function updateBookingRecordStatus(recordId, status) {
  if (!recordId) return false;
  const userKey = getActiveUserKey();
  const ledger = safeReadLedger();
  let changed = false;
  const next = ledger.map((item) => {
    const sameUser = String(item?.userKey || "").toLowerCase() === userKey;
    if (sameUser && String(item?.id || "") === String(recordId)) {
      changed = true;
      return {
        ...item,
        status: status || item.status,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  if (changed) safeWriteLedger(next);
  return changed;
}
