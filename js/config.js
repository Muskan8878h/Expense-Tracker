const API_KEY = 'AIzaSyBUQ8AWOLZUYfL-vs8aj-T083j4uWWoXPI';

// ── Category metadata (icon, colors) ──
const CAT_META = {
  Food:          { icon: '🍽', bg: '#fef3c7', color: '#92400e' },
  Transport:     { icon: '🚗', bg: '#dbeafe', color: '#1e40af' },
  Shopping:      { icon: '🛍', bg: '#fce7f3', color: '#9d174d' },
  Health:        { icon: '💊', bg: '#dcfce7', color: '#166534' },
  Entertainment: { icon: '🎬', bg: '#ede9fe', color: '#5b21b6' },
  Utilities:     { icon: '⚡', bg: '#ffedd5', color: '#9a3412' },
  Other:         { icon: '📦', bg: '#f3f4f6', color: '#374151' }
};

// ── Category list ──
const CATS = Object.keys(CAT_META);

// ── Chart colors (one per category) ──
const COLORS = ['#4f8ef7', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#84cc16'];

// ── Default monthly budgets (₹) ──
const DEFAULT_BUDGETS = {
  Food: 5000,
  Transport: 3000,
  Shopping: 4000,
  Health: 2000,
  Entertainment: 2000,
  Utilities: 2000,
  Other: 1000
};
