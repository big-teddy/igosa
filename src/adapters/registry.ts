import { ShoppingPlatformAdapter } from './types';
import { CoupangAdapter } from './kr/coupang';
import { AmazonUSAdapter } from './us/amazon';

export class AdapterRegistry {
    private adapters: Map<string, ShoppingPlatformAdapter> = new Map();

    constructor() {
        this.register(new CoupangAdapter());
        this.register(new AmazonUSAdapter());
    }

    register(adapter: ShoppingPlatformAdapter) {
        this.adapters.set(adapter.name, adapter);
    }

    getAdapter(name: string): ShoppingPlatformAdapter | undefined {
        return this.adapters.get(name);
    }

    getAdaptersByCountry(country: 'KR' | 'US' | 'JP'): ShoppingPlatformAdapter[] {
        return Array.from(this.adapters.values()).filter(
            (adapter) => adapter.country === country
        );
    }

    getAllAdapters(): ShoppingPlatformAdapter[] {
        return Array.from(this.adapters.values());
    }
}

export const adapterRegistry = new AdapterRegistry();
