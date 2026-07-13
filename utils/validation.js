function validatePublicKey(value) {
  if (typeof value !== 'string') return false;
  return /^G[A-Z2-7]{55}$/.test(value);
}

function validateSecretKey(value) {
  if (typeof value !== 'string') return false;
  return /^S[A-Z2-7]{55}$/.test(value);
}

function validateAmount(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return false;

  const normalized = String(value).trim();
  if (!/^\d+(\.\d{1,7})?$/.test(normalized)) return false;

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) && numericValue > 0;
}

function validateAssetCode(value) {
  if (typeof value !== 'string') return false;
  return /^[A-Z0-9]{1,12}$/.test(value);
}

module.exports = {
  validatePublicKey,
  validateSecretKey,
  validateAmount,
  validateAssetCode
};
