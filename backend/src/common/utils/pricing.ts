/**
 * Centralized Pricing Rules & Utility
 * Tecyad Platform - Unified Cash & 4-Month Installment (SnappPay) Pricing Engine
 */

export const INSTALLMENT_MONTHS = 4;
export const DEFAULT_CASH_RATIO = 0.5; // Business rule: Cash price is 50% of 4-month installment price if not explicitly set

export interface PricingInput {
  price?: number;
  cashPrice?: number;
  installmentPrice?: number;
  discountPrice?: number;
  isFree?: boolean;
}

export interface NormalizedPricing {
  price: number;
  cashPrice: number;
  installmentPrice: number;
  discountPrice?: number;
  isFree: boolean;
  downPayment: number;
  monthlyInstallment: number;
}

/**
 * Normalizes pricing for Classes and Courses.
 * Guarantees that both cashPrice and installmentPrice are set and valid.
 * Respects explicit user overrides, or applies the configurable 50% cash ratio rule.
 */
export function normalizePricing(input: PricingInput): NormalizedPricing {
  if (input.isFree === true || Number(input.price) === 0 && !input.cashPrice && !input.installmentPrice) {
    return {
      price: 0,
      cashPrice: 0,
      installmentPrice: 0,
      discountPrice: undefined,
      isFree: true,
      downPayment: 0,
      monthlyInstallment: 0,
    };
  }

  const rawCash = input.cashPrice !== undefined && input.cashPrice !== null ? Number(input.cashPrice) : undefined;
  const rawInstallment = input.installmentPrice !== undefined && input.installmentPrice !== null ? Number(input.installmentPrice) : undefined;
  const rawPrice = input.price !== undefined && input.price !== null ? Number(input.price) : undefined;
  const rawDiscount = input.discountPrice !== undefined && input.discountPrice !== null ? Number(input.discountPrice) : undefined;

  let cashPrice: number;
  let installmentPrice: number;

  if (rawCash !== undefined && rawCash > 0 && rawInstallment !== undefined && rawInstallment > 0) {
    // Both explicitly provided
    cashPrice = rawCash;
    installmentPrice = rawInstallment;
  } else if (rawCash !== undefined && rawCash > 0) {
    // Only cashPrice provided -> derive installmentPrice using 50% rule (installment = cash * 2)
    cashPrice = rawCash;
    installmentPrice = Math.round(cashPrice / DEFAULT_CASH_RATIO);
  } else if (rawInstallment !== undefined && rawInstallment > 0) {
    // Only installmentPrice provided -> derive cashPrice using 50% rule (cash = installment * 0.5)
    installmentPrice = rawInstallment;
    cashPrice = Math.round(installmentPrice * DEFAULT_CASH_RATIO);
  } else if (rawPrice !== undefined && rawPrice > 0) {
    // Legacy base price provided -> treat as cashPrice
    cashPrice = rawPrice;
    installmentPrice = Math.round(cashPrice / DEFAULT_CASH_RATIO);
  } else {
    // Fallback: 0
    return {
      price: 0,
      cashPrice: 0,
      installmentPrice: 0,
      discountPrice: undefined,
      isFree: true,
      downPayment: 0,
      monthlyInstallment: 0,
    };
  }

  // Handle promotional discount on cash price if valid
  let discountPrice: number | undefined = undefined;
  if (rawDiscount !== undefined && rawDiscount > 0 && rawDiscount < cashPrice) {
    discountPrice = rawDiscount;
  }

  // 4-Month SnappPay breakdown
  const downPayment = Math.round(installmentPrice / INSTALLMENT_MONTHS);
  const monthlyInstallment = Math.round(installmentPrice / INSTALLMENT_MONTHS);

  return {
    price: cashPrice, // DB base price in sync with cashPrice
    cashPrice,
    installmentPrice,
    discountPrice,
    isFree: false,
    downPayment,
    monthlyInstallment,
  };
}

/**
 * Calculates 4-Month SnappPay installment breakdown
 */
export function calculateSnappPayBreakdown(installmentPrice: number) {
  if (!installmentPrice || installmentPrice <= 0) {
    return {
      totalInstallment: 0,
      downPayment: 0,
      monthlyInstallment: 0,
      months: INSTALLMENT_MONTHS,
    };
  }

  const downPayment = Math.round(installmentPrice / INSTALLMENT_MONTHS);
  const monthlyInstallment = Math.round(installmentPrice / INSTALLMENT_MONTHS);

  return {
    totalInstallment: installmentPrice,
    downPayment,
    monthlyInstallment,
    months: INSTALLMENT_MONTHS,
  };
}
