// Shared in-memory cache layer attached to globalThis
// Persists across Next.js dev route bundles and hot-reloads
// Prevents PgBouncer connection starvation and WAN round-trip overhead

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface AppGlobalCache {
  authMe: Map<string, CacheEntry<any>>;
  employees: Map<string, CacheEntry<any>>;
  companies: Map<string, CacheEntry<any>>;
  reports: Map<string, CacheEntry<any>>;
}

const g = globalThis as unknown as { __appCache?: AppGlobalCache };

if (!g.__appCache) {
  g.__appCache = {
    authMe: new Map(),
    employees: new Map(),
    companies: new Map(),
    reports: new Map(),
  };
}

const cache = g.__appCache;

// 1. Auth Me Cache (TTL 60s)
export function getAuthMeCache(userId: string) {
  const entry = cache.authMe.get(userId);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}
export function setAuthMeCache(userId: string, data: any, ttlMs = 300000) {
  cache.authMe.set(userId, { data, expiresAt: Date.now() + ttlMs });
}
export function invalidateAuthCache(userId?: string) {
  if (userId) {
    cache.authMe.delete(userId);
  } else {
    cache.authMe.clear();
  }
}

// 2. Employee Directory Cache (TTL 30s)
export function getEmployeeCache(cacheKey: string) {
  const entry = cache.employees.get(cacheKey);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}
export function setEmployeeCache(cacheKey: string, data: any, ttlMs = 30000) {
  cache.employees.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
}
export function invalidateEmployeeCache() {
  cache.employees.clear();
}

// 3. Company Cache (TTL 60s)
export function getCompanyCache(cacheKey: string) {
  const entry = cache.companies.get(cacheKey);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}
export function setCompanyCache(cacheKey: string, data: any, ttlMs = 60000) {
  cache.companies.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
}
export function invalidateCompanyCache() {
  cache.companies.clear();
}

// 4. Reports / Analytics Cache (TTL 30s)
export function getReportsCache(cacheKey: string) {
  const entry = cache.reports.get(cacheKey);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}
export function setReportsCache(cacheKey: string, data: any, ttlMs = 30000) {
  cache.reports.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
}
export function invalidateReportsCache() {
  cache.reports.clear();
}
