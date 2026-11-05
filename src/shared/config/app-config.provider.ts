export const STORE_CONFIG = 'STORE_CONFIG';

export interface StoreConfig {
  storeName: string;
  defaultCurrency: string;
  taxPercent: number;
}

export const appConfigProvider = {
  provide: STORE_CONFIG,
  useValue: {
    storeName: 'Clothes Store',
    defaultCurrency: 'UAH',
    taxPercent: 20,
  } satisfies StoreConfig,
};
