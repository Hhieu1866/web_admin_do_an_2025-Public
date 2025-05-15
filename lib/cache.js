/**
 * Một cơ chế cache đơn giản cho các truy vấn MongoDB
 */

// Đối tượng lưu trữ cache
const cache = new Map();

// Thời gian cache mặc định (30 phút)
const DEFAULT_CACHE_TIME = 30 * 60 * 1000;

// Giới hạn kích thước cache (số lượng mục tối đa)
const MAX_CACHE_SIZE = 1000;

// Thống kê cache
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  clears: 0,
};

/**
 * Lấy dữ liệu từ cache
 * @param {string} key Khóa cache
 * @returns {Object|null} Dữ liệu từ cache hoặc null nếu không tìm thấy
 */
export function getCache(key) {
  if (!key) return null;

  const item = cache.get(key);
  if (!item) {
    stats.misses++;
    return null;
  }

  // Kiểm tra xem cache có hết hạn không
  if (Date.now() > item.expiry) {
    cache.delete(key);
    stats.deletes++;
    return null;
  }

  // Tăng số lần truy cập và cập nhật thời gian truy cập gần nhất
  item.hits++;
  item.lastAccessed = Date.now();

  stats.hits++;
  return item.data;
}

/**
 * Lưu dữ liệu vào cache
 * @param {string} key Khóa cache
 * @param {any} data Dữ liệu cần lưu
 * @param {number} ttl Thời gian sống của cache (ms)
 */
export function setCache(key, data, ttl = DEFAULT_CACHE_TIME) {
  if (!key) return;

  // Kiểm tra kích thước cache - nếu đầy thì xóa key cũ nhất
  if (cache.size >= MAX_CACHE_SIZE) {
    // Tìm key được truy cập lâu nhất để xóa
    let oldestKey = null;
    let oldestAccess = Infinity;

    for (const [k, v] of cache.entries()) {
      if (v.lastAccessed < oldestAccess) {
        oldestAccess = v.lastAccessed;
        oldestKey = k;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      stats.deletes++;
    }
  }

  const expiry = Date.now() + ttl;
  cache.set(key, {
    data,
    expiry,
    hits: 0,
    createdAt: Date.now(),
    lastAccessed: Date.now(),
  });

  stats.sets++;
}

/**
 * Xóa một mục trong cache
 * @param {string} key Khóa cache cần xóa
 */
export function deleteCache(key) {
  if (key) {
    cache.delete(key);
    stats.deletes++;
  }
}

/**
 * Xóa mục cache theo mẫu
 * @param {string} pattern Mẫu khóa cần xóa (ví dụ: 'users:*')
 */
export function deleteCacheByPattern(pattern) {
  if (!pattern) return;

  const regex = new RegExp(pattern.replace("*", ".*"));
  let count = 0;

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }

  if (count > 0) {
    stats.deletes += count;
    console.log(`[Cache] Đã xóa ${count} mục theo mẫu: ${pattern}`);
  }
}

/**
 * Xóa toàn bộ cache
 */
export function clearCache() {
  const size = cache.size;
  cache.clear();
  stats.clears++;
  stats.deletes += size;
  console.log(`[Cache] Đã xóa toàn bộ ${size} mục cache`);
}

/**
 * Tạo khóa cache từ tên hàm và các tham số
 * @param {string} prefix Tiền tố cho khóa (thường là tên hàm)
 * @param {Array} args Các tham số
 * @returns {string} Khóa cache
 */
export function createCacheKey(prefix, ...args) {
  return `${prefix}:${args.map((arg) => JSON.stringify(arg)).join(":")}`;
}

/**
 * Decorator để cache kết quả của một hàm async
 * @param {Function} fn Hàm cần cache kết quả
 * @param {string} prefix Tiền tố cho khóa cache
 * @param {number} ttl Thời gian sống của cache
 * @returns {Function} Hàm mới có cache
 */
export function withCache(fn, prefix, ttl = DEFAULT_CACHE_TIME) {
  return async function (...args) {
    const cacheKey = createCacheKey(prefix || fn.name, ...args);
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      console.log(`[Cache] Hit: ${cacheKey}`);
      return cachedData;
    }

    console.log(`[Cache] Miss: ${cacheKey}`);
    const result = await fn.apply(this, args);
    setCache(cacheKey, result, ttl);
    return result;
  };
}

/**
 * Cache thông minh với TTL tự điều chỉnh dựa trên tần suất truy cập
 * @param {Function} fn Hàm cần cache
 * @param {string} prefix Tiền tố khóa
 * @param {Object} options Tùy chọn cho cache
 * @returns {Function} Hàm đã cache
 */
export function withAdaptiveCache(fn, prefix, options = {}) {
  const {
    baseTTL = DEFAULT_CACHE_TIME,
    maxTTL = DEFAULT_CACHE_TIME * 5,
    hitBonus = 0.1, // Mỗi lần hit tăng thêm 10% TTL
  } = options;

  return async function (...args) {
    const cacheKey = createCacheKey(prefix || fn.name, ...args);
    const item = cache.get(cacheKey);

    // Cache hit
    if (item && Date.now() <= item.expiry) {
      // Tính toán TTL mới dựa trên số lần hit
      const hitFactor = Math.min(5, 1 + item.hits * hitBonus);
      const newTTL = Math.min(maxTTL, baseTTL * hitFactor);

      // Gia hạn thời gian cache
      item.expiry = Date.now() + newTTL;
      item.hits++;
      item.lastAccessed = Date.now();

      stats.hits++;
      return item.data;
    }

    // Cache miss
    stats.misses++;
    const result = await fn.apply(this, args);
    setCache(cacheKey, result, baseTTL);
    return result;
  };
}

/**
 * Lấy thống kê về cache
 * @returns {Object} Thống kê cache
 */
export function getCacheStats() {
  return {
    ...stats,
    size: cache.size,
    hitRatio: stats.hits / (stats.hits + stats.misses) || 0,
    memoryEstimate: estimateCacheSize(),
  };
}

/**
 * Ước tính kích thước cache trong bộ nhớ (bytes)
 * @returns {number} Kích thước ước tính (bytes)
 */
function estimateCacheSize() {
  let total = 0;

  for (const [key, value] of cache.entries()) {
    // Ước tính kích thước của key
    total += key.length * 2; // Mỗi ký tự JavaScript = 2 bytes

    // Ước tính kích thước của value
    total += JSON.stringify(value.data).length * 2;

    // Thêm overhead cho các trường khác
    total += 8 * 5; // expiry, hits, createdAt, lastAccessed (8 bytes mỗi số)
  }

  return total;
}
