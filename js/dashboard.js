let spendChart  = null;
let catChart    = null;
let activeFilter = 'All';

// Render the full dashboard
function renderDashboard() {
  const total       = totalMonth();
  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
  const remaining   = totalBudget - total;
  const topCat      = CATS.reduce((a, b) => catTotal(a) > catTotal(b) ? a : b);

  // ── Metric cards ──
  document.getElementById('metrics-row').innerHTML = `
    <div class="metric">
      <div class="metric-label">Spent this month</div>
      <div class="metric-value ${total > totalBudget ? 'red' : ''}">${fmt(total)}</div>
      <div class="metric-sub">of ${fmt(totalBudget)} budget</div>
    </div>
    <div class="metric">
      <div class="metric-label">Remaining</div>
      <div class="metric-value ${remaining >= 0 ? 'green' : 'red'}">${fmt(Math.abs(remaining))}</div>
      <div class="metric-sub">${remaining >= 0 ? 'available' : 'over budget'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Transactions</div>
      <div class="metric-value blue">${expenses.length}</div>
      <div class="metric-sub">all time</div>
    </div>
    <div class="metric">
      <div class="metric-label">This month</div>
      <div class="metric-value">${monthExpenses().length}</div>
      <div class="metric-sub">transactions</div>
    </div>
    <div class="metric">
      <div class="metric-label">Top category</div>
      <div class="metric-value amber" style="font-size:18px;">${CAT_META[topCat].icon} ${topCat}</div>
      <div class="metric-sub">${fmt(catTotal(topCat))}</div>
    </div>
  `;

  // ── Filter pills ──
  document.getElementById('filter-row').innerHTML = ['All', ...CATS].map(c =>
    `<button class="fpill ${activeFilter === c ? 'active' : ''}" onclick="setFilter('${c}')">${c}</button>`
  ).join('');

  // ── Expense list ──
  const listEl = document.getElementById('expense-list');
  let filtered = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (activeFilter !== 'All') filtered = filtered.filter(e => e.category === activeFilter);
  filtered = filtered.slice(0, 10);

  if (!filtered.length) {
    listEl.innerHTML = '<li class="empty">No expenses yet.</li>';
  } else {
    listEl.innerHTML = filtered.map(e => {
      const m = CAT_META[e.category] || CAT_META.Other;
      return `<li class="expense-item">
        <div class="cat-dot" style="background:${m.bg};color:${m.color}">${m.icon}</div>
        <div class="expense-info">
          <div class="expense-desc">${escHtml(e.desc)}</div>
          <div class="expense-meta">${e.category} · ${e.date}</div>
        </div>
        <div class="expense-amount">${fmt(e.amount)}</div>
        <button class="del-btn" onclick="delExpense('${e.id}')" title="Delete">×</button>
      </li>`;
    }).join('');
  }

  // ── Budget bars ──
  document.getElementById('budget-bars').innerHTML = CATS.map(cat => {
    const spent  = catTotal(cat);
    const budget = budgets[cat] || 0;
    const pct    = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
    const col    = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';
    return `<div class="budget-row">
      <div class="budget-cat">${CAT_META[cat].icon} ${cat}</div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${col};"></div></div>
      <div class="budget-pct">${pct}%</div>
    </div>`;
  }).join('');

  renderSpendChart();
}

// Filter expense list by category
function setFilter(cat) {
  activeFilter = cat;
  renderDashboard();
}

// Line chart: daily spending over 30 days
function renderSpendChart() {
  const ctx = document.getElementById('spendChart').getContext('2d');
  if (spendChart) spendChart.destroy();

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const data   = days.map(d => expenses.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0));
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  spendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map((d, i) => i % 5 === 0 ? d.slice(5) : ''),
      datasets: [{
        label: 'Daily spend',
        data,
        borderColor: '#4f8ef7',
        backgroundColor: 'rgba(79,142,247,0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)' },
          ticks: { color: isDark ? '#9ca3af' : '#6b7280', font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)' },
          ticks: {
            callback: v => '₹' + v.toLocaleString('en-IN'),
            color: isDark ? '#9ca3af' : '#6b7280',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// Doughnut chart: spending by category
function renderCatChart() {
  const ctx = document.getElementById('catChart').getContext('2d');
  if (catChart) catChart.destroy();

  catChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: CATS.map(c => CAT_META[c].icon + ' ' + c),
      datasets: [{
        data: CATS.map(c => catTotal(c)),
        backgroundColor: COLORS,
        borderWidth: 3,
        borderColor: 'transparent'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 12 }, padding: 14 }
        }
      }
    }
  });
}
