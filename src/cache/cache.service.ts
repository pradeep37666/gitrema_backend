import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key: string): Promise<any> {
    if (!key) return null;
    return await this.cache.get(key);
  }

  async del(key: string): Promise<any> {
    return await this.cache.del(key);
  }

  async set(
    key: string,
    value: any,
    cachingOption: CachingConfig = {},
  ): Promise<any> {
    await this.cache.set(key, value, cachingOption);
  }
}
