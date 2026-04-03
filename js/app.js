let currentUser = null;
let expenses    = [];
let budgets     = { ...DEFAULT_BUDGETS };

// ── LocalStorage Helpers ──

function storageKey(suffix) {
  return `ss_${currentUser}_${suffix}`;
}

function saveData() {
  localStorage.setItem(storageKey('exp'), JSON.stringify(expenses));
  localStorage.setItem(storageKey('bud'), JSON.stringify(budgets));
}

function loadData() {
  expenses = JSON.parse(localStorage.getItem(storageKey('exp')) || '[]');
  budgets  = JSON.parse(localStorage.getItem(storageKey('bud')) || JSON.stringify(DEFAULT_BUDGETS));
}

// ── Utility Helpers ──

// Get today's date as YYYY-MM-DD string
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Format number as Indian rupees
function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Show a brief toast notification
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Escape HTML to prevent XSS
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Data Helpers ──

// Get this month's expenses only
function monthExpenses() {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

// Total spent in a category this month
function catTotal(cat) {
  return monthExpenses()
    .filter(e => e.category === cat)
    .reduce((s, e) => s + e.amount, 0);
}

// Total spent this month across all categories
function totalMonth() {
  return monthExpenses().reduce((s, e) => s + e.amount, 0);
}

// ── Navigation ──
function go(tab, btn) {
  // Hide all sections, deactivate all nav items
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show selected section and mark nav item active
  document.getElementById('tab-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');

  // Re-render relevant data
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'budget')    renderBudgetInputs();
  if (tab === 'forecast')  renderCatChart();
}

// ── Boot App (after login) ──
function bootApp() {
  loadData();

  // Show app, hide auth screen
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  // Personalise greeting
  const names = JSON.parse(localStorage.getItem('ss_names') || '{}');
  const name  = names[currentUser]
    ? names[currentUser].split(' ')[0]
    : currentUser.split('@')[0];
  document.getElementById('dash-greeting').textContent =
    `Welcome back, ${name}! Here's your financial snapshot.`;

  // Set default date on form
  document.getElementById('f-date').value = today();

  // Initial renders
  renderBudgetInputs();
  renderDashboard();
  renderCatChart();
}

// ── Auto-login if session exists ──
(function init() {
  const session = localStorage.getItem('ss_session');
  if (session) {
    currentUser = session;
    bootApp();
  }
})();
