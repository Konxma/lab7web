import { STORE_CONFIG, StoreConfig } from './app-config.provider';

export const FEE_CALCULATOR = 'FEE_CALCULATOR';

export interface FeeCalculator {
  calculateTax(amount: number): number;
}

export const feeCalculatorProvider = {
  provide: FEE_CALCULATOR,
  useFactory: (config: StoreConfig): FeeCalculator => ({
    calculateTax: (amount: number): number =>
      Math.round(amount * config.taxPercent) / 100,
  }),
  inject: [STORE_CONFIG],
};
