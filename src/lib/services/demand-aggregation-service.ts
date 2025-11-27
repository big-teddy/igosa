/**
 * Demand Aggregation Service with Redis
 *
 * Real-time demand tracking using Redis Sorted Sets
 * Provides insights on price distribution and user demand
 */

import { getRedisClient, REDIS_KEYS, REDIS_TTL } from '@/lib/redis/client';
import type { DemandAggregation } from '@/types/price-tracking';

export interface DemandEntry {
  userId: string;
  targetPrice: number;
  createdAt: number; // Unix timestamp
}

export interface PriceTier {
  price: number;
  userCount: number;
  percentage: number;
}

/**
 * Add user's target price to demand aggregation
 */
export async function addDemandEntry(
  productId: string,
  userId: string,
  targetPrice: number
): Promise<void> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.PRODUCT_DEMAND(productId);

  // Use Sorted Set: score = target price, member = userId:timestamp
  const member = `${userId}:${Date.now()}`;
  await redis.zadd(key, { score: targetPrice, member });

  // Set expiration (30 days)
  await redis.expire(key, 30 * 24 * 60 * 60);

  // Invalidate cache
  await redis.del(REDIS_KEYS.PRICE_DISTRIBUTION(productId));
  await redis.del(REDIS_KEYS.DEMAND_STATS(productId));
}

/**
 * Remove user's demand entry
 */
export async function removeDemandEntry(
  productId: string,
  userId: string
): Promise<void> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.PRODUCT_DEMAND(productId);

  // Find and remove all entries for this user
  const allEntries = (await redis.zrange(key, 0, -1)) as string[];
  const toRemove = allEntries.filter((entry) => entry.startsWith(`${userId}:`));

  if (toRemove.length > 0) {
    await redis.zrem(key, ...toRemove);

    // Invalidate cache
    await redis.del(REDIS_KEYS.PRICE_DISTRIBUTION(productId));
    await redis.del(REDIS_KEYS.DEMAND_STATS(productId));
  }
}

/**
 * Update user's target price
 */
export async function updateDemandEntry(
  productId: string,
  userId: string,
  newTargetPrice: number
): Promise<void> {
  await removeDemandEntry(productId, userId);
  await addDemandEntry(productId, userId, newTargetPrice);
}

/**
 * Get demand aggregation for a product
 */
export async function getDemandAggregation(
  productId: string
): Promise<DemandAggregation> {
  const redis = getRedisClient();

  // Check cache first
  const cacheKey = REDIS_KEYS.DEMAND_STATS(productId);
  const cached = await redis.get(cacheKey);

  if (cached && typeof cached === 'string') {
    return JSON.parse(cached);
  }

  // Get all demand entries
  const key = REDIS_KEYS.PRODUCT_DEMAND(productId);
  const entries = (await redis.zrange(key, 0, -1, { withScores: true })) as (string | number)[];

  if (!entries || entries.length === 0) {
    const emptyResult: DemandAggregation = {
      productId,
      productName: `Product ${productId}`,
      timestamp: new Date(),
      priceTiers: [],
      totalUsers: 0,
      peakDemandPrice: 0,
      avgTargetPrice: 0,
      medianTargetPrice: 0,
      priceRange: { min: 0, max: 0 },
    };
    return emptyResult;
  }

  // Parse entries and group by price tiers (10k buckets)
  const priceMap = new Map<number, Set<string>>();
  const prices: number[] = [];

  for (let i = 0; i < entries.length; i += 2) {
    const member = entries[i] as string;
    const score = entries[i + 1];
    const price = typeof score === 'number' ? score : parseFloat(score as string);

    const userId = member.split(':')[0];
    const bucket = Math.floor(price / 10000) * 10000;

    if (!priceMap.has(bucket)) {
      priceMap.set(bucket, new Set());
    }
    priceMap.get(bucket)!.add(userId);
    prices.push(price);
  }

  // Calculate statistics
  const totalUsers = new Set(
    Array.from(priceMap.values()).flatMap((set) => Array.from(set))
  ).size;

  const avgTargetPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const medianTargetPrice =
    sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] +
          sortedPrices[sortedPrices.length / 2]) /
        2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

  // Find peak demand price (bucket with most users)
  let peakDemandPrice = 0;
  let maxUsers = 0;
  Array.from(priceMap.entries()).forEach(([price, users]) => {
    if (users.size > maxUsers) {
      maxUsers = users.size;
      peakDemandPrice = price;
    }
  });

  // Create price tiers
  const priceTiers: PriceTier[] = Array.from(priceMap.entries())
    .map(([price, users]) => ({
      price,
      userCount: users.size,
      percentage: (users.size / totalUsers) * 100,
    }))
    .sort((a, b) => a.price - b.price);

  const result: DemandAggregation = {
    productId,
    productName: `Product ${productId}`, // TODO: Get from product service
    timestamp: new Date(),
    priceTiers,
    totalUsers,
    peakDemandPrice,
    avgTargetPrice: Math.round(avgTargetPrice),
    medianTargetPrice: Math.round(medianTargetPrice),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
  };

  // Cache result
  await redis.set(cacheKey, JSON.stringify(result), {
    ex: REDIS_TTL.STATS_CACHE,
  });

  return result;
}

/**
 * Get similar users count for a specific price
 */
export async function getSimilarUsersCount(
  productId: string,
  targetPrice: number,
  tolerance: number = 5000
): Promise<number> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.PRODUCT_DEMAND(productId);

  // Count users within price range
  const minPrice = targetPrice - tolerance;
  const maxPrice = targetPrice + tolerance;

  // Get all entries with scores
  const allEntries = (await redis.zrange(key, 0, -1, { withScores: true })) as (string | number)[];

  // Filter by price range and deduplicate by userId
  const uniqueUsers = new Set<string>();
  for (let i = 0; i < allEntries.length; i += 2) {
    const member = allEntries[i] as string;
    const price = allEntries[i + 1] as number;

    if (price >= minPrice && price <= maxPrice) {
      const userId = member.split(':')[0];
      uniqueUsers.add(userId);
    }
  }

  return uniqueUsers.size;
}

/**
 * Get price distribution histogram data
 */
export async function getPriceDistributionHistogram(
  productId: string,
  bucketSize: number = 10000
): Promise<{ price: number; count: number }[]> {
  const aggregation = await getDemandAggregation(productId);
  return aggregation.priceTiers.map((tier) => ({
    price: tier.price,
    count: tier.userCount,
  }));
}

/**
 * Calculate probability of reaching target price
 * Based on demand distribution and historical data
 */
export async function calculatePriceReachProbability(
  productId: string,
  targetPrice: number,
  currentPrice: number
): Promise<number> {
  const aggregation = await getDemandAggregation(productId);

  if (aggregation.totalUsers === 0) {
    // No data, use simple heuristic
    if (targetPrice >= currentPrice) return 0.95;
    const discount = ((currentPrice - targetPrice) / currentPrice) * 100;
    if (discount <= 10) return 0.75;
    if (discount <= 20) return 0.50;
    if (discount <= 30) return 0.25;
    return 0.10;
  }

  // Calculate based on demand distribution
  const demandAtOrAbove = aggregation.priceTiers
    .filter((tier) => tier.price >= targetPrice)
    .reduce((sum, tier) => sum + tier.userCount, 0);

  const demandRatio = demandAtOrAbove / aggregation.totalUsers;

  // Adjust probability based on demand
  let baseProbability = 0;
  const discount = ((currentPrice - targetPrice) / currentPrice) * 100;

  if (discount <= 0) baseProbability = 0.95;
  else if (discount <= 10) baseProbability = 0.75;
  else if (discount <= 20) baseProbability = 0.50;
  else if (discount <= 30) baseProbability = 0.25;
  else baseProbability = 0.10;

  // Boost probability if there's high demand
  const demandBoost = Math.min(demandRatio * 0.3, 0.2); // Max 20% boost

  return Math.min(baseProbability + demandBoost, 0.99);
}
