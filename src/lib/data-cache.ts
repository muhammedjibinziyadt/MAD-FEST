type CacheStore = {
  teams: any[] | null;
  students: any[] | null;
  programs: any[] | null;
  juries: any[] | null;
  assignments: any[] | null;
  pendingResults: any[] | null;
  approvedResults: any[] | null;
  liveScores: any[] | null;
  registrations: any[] | null;
  replacementRequests: any[] | null;
  registrationSchedule: any | null;
};

declare global {
  var dataCacheStore: CacheStore | undefined;
}

const cache: CacheStore = global.dataCacheStore ?? (global.dataCacheStore = {
  teams: null,
  students: null,
  programs: null,
  juries: null,
  assignments: null,
  pendingResults: null,
  approvedResults: null,
  liveScores: null,
  registrations: null,
  replacementRequests: null,
  registrationSchedule: null,
});

export function getCached<T>(key: keyof CacheStore): T | null {
  return cache[key] as T | null;
}

export function setCached<T>(key: keyof CacheStore, value: T): T {
  cache[key] = value as any;
  return value;
}

export function clearCache(key?: keyof CacheStore) {
  if (key) {
    cache[key] = null;
  } else {
    Object.keys(cache).forEach((k) => {
      cache[k as keyof CacheStore] = null;
    });
  }
}
