const {
  validatePublicKey,
  validateSecretKey,
  validateAmount,
  validateAssetCode
} = require('../utils/validation');

describe('validation utilities', () => {
  test('validates Stellar public keys by prefix and length', () => {
    expect(validatePublicKey(`G${'A'.repeat(55)}`)).toBe(true);
    expect(validatePublicKey(`S${'A'.repeat(55)}`)).toBe(false);
    expect(validatePublicKey(`G${'A'.repeat(54)}`)).toBe(false);
    expect(validatePublicKey(null)).toBe(false);
  });

  test('validates Stellar secret keys by prefix and length', () => {
    expect(validateSecretKey(`S${'B'.repeat(55)}`)).toBe(true);
    expect(validateSecretKey(`G${'B'.repeat(55)}`)).toBe(false);
    expect(validateSecretKey(`S${'B'.repeat(54)}`)).toBe(false);
    expect(validateSecretKey({})).toBe(false);
  });

  test('validates positive Stellar amounts with at most seven decimals', () => {
    expect(validateAmount('1')).toBe(true);
    expect(validateAmount('0.0000001')).toBe(true);
    expect(validateAmount(25.5)).toBe(true);
    expect(validateAmount('0')).toBe(false);
    expect(validateAmount('-1')).toBe(false);
    expect(validateAmount('1.00000001')).toBe(false);
    expect(validateAmount('abc')).toBe(false);
  });

  test('validates issued asset codes', () => {
    expect(validateAssetCode('USDC')).toBe(true);
    expect(validateAssetCode('A12345678901')).toBe(true);
    expect(validateAssetCode('')).toBe(false);
    expect(validateAssetCode('lower')).toBe(false);
    expect(validateAssetCode('TOO-LONG-ASSET')).toBe(false);
  });
});
