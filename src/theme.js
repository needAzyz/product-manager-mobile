export const colors = {
  bg: '#F6F8FB',
  white: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#ECFDF5',
  red: '#EF4444',
  redLight: '#FEF2F2',
  yellow: '#F59E0B',
  yellowLight: '#FFFBEB',
  blue: '#3B82F6',
};

export const categoryColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#06B6D4', '#EF4444', '#F97316', '#14B8A6', '#6366F1',
  '#84CC16', '#D946EF', '#0EA5E9', '#64748B',
];

export const getCategoryColor = (id) => categoryColors[id % categoryColors.length];

export const getStatusColor = (product) => {
  if (product.expired_count > 0) return colors.red;
  if (product.expiring_count > 0) return colors.yellow;
  return colors.green;
};

export const getStatusText = (product) => {
  if (product.expired_count > 0) return 'Expired';
  if (product.expiring_count > 0) return 'Expiring';
  if (product.batch_count > 0) return 'Fresh';
  return 'No batches';
};

export const getBatchStatusColor = (batch) => {
  const now = Date.now();
  const expiry = new Date(batch.expiry_date).getTime();
  const mfg = new Date(batch.manufactured_at).getTime();
  if (expiry < now) return colors.red;
  const totalLife = expiry - mfg;
  const elapsed = now - mfg;
  if (totalLife > 0 && (elapsed / totalLife) >= 0.9) return colors.yellow;
  return colors.green;
};

export const getBatchStatus = (batch) => {
  const now = Date.now();
  const expiry = new Date(batch.expiry_date).getTime();
  const mfg = new Date(batch.manufactured_at).getTime();
  if (expiry < now) return { text: 'Expired', color: colors.red };
  const totalLife = expiry - mfg;
  const elapsed = now - mfg;
  const pct = totalLife > 0 ? Math.round((elapsed / totalLife) * 100) : 0;
  const remaining = 100 - pct;
  if (pct >= 90) return { text: `Expiring (${remaining}%)`, color: colors.yellow };
  return { text: `Fresh (${remaining}%)`, color: colors.green };
};

export const getBatchRemaining = (batch) => {
  const now = Date.now();
  const expiry = new Date(batch.expiry_date).getTime();
  const mfg = new Date(batch.manufactured_at).getTime();
  const totalLife = expiry - mfg;
  if (totalLife <= 0) return 0;
  const elapsed = now - mfg;
  const pct = Math.round((elapsed / totalLife) * 100);
  return Math.max(0, Math.min(100, 100 - pct));
};
