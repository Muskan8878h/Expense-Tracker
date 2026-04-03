function addManual() {
  const desc = document.getElementById('f-desc').value.trim();
  const amt  = parseFloat(document.getElementById('f-amt').value);
  const cat  = document.getElementById('f-cat').value;
  const date = document.getElementById('f-date').value;

  if (!desc || !amt || !date) { toast('Please fill all fields.'); return; }

  expenses.push({
    id: Date.now() + Math.random() + '',
    desc,
    amount: amt,
    category: cat,
    date
  });

  saveData();
  renderDashboard();

  // Clear form fields
  document.getElementById('f-desc').value = '';
  document.getElementById('f-amt').value  = '';

  toast('Expense added!');
}

// Delete an expense by id
function delExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveData();
  renderDashboard();
  toast('Expense deleted.');
}

// Render budget input fields
function renderBudgetInputs() {
  document.getElementById('budget-inputs').innerHTML = CATS.map(cat =>
    `<div class="field">
      <label>${CAT_META[cat].icon} ${cat} (₹)</label>
      <input type="number" id="bud-${cat}" value="${budgets[cat] || 0}" min="0">
    </div>`
  ).join('');
}

// Save budgets from input fields
function saveBudgets() {
  CATS.forEach(c => {
    const el = document.getElementById('bud-' + c);
    if (el) budgets[c] = parseFloat(el.value) || 0;
  });
  saveData();
  toast('Budgets saved!');
  renderDashboard();
}

// Parse receipt text using AI and add expenses
async function parseReceipt() {
  const text = document.getElementById('receipt-text').value.trim();
  if (!text) { toast('Please enter receipt text first.'); return; }

  const btn = document.getElementById('parse-btn');
  const res = document.getElementById('scan-result');

  btn.disabled = true;
  btn.textContent = 'Parsing...';
  res.style.display = 'block';
  res.innerHTML = `<div class="typing">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div> Analyzing receipt with AI...`;

  try {
    const items = await claudeJSON(
      `Extract ALL expenses from this receipt/text. Return ONLY a JSON array:
[{"desc":"Coffee","amount":280,"category":"Food","date":"${today()}"}]
Categories: Food, Transport, Shopping, Health, Entertainment, Utilities, Other.
Use today's date (${today()}) if not specified. Raw JSON only, no markdown.`,
      text
    );

    if (!Array.isArray(items) || !items.length) throw new Error('No items found');

    items.forEach(it => {
      expenses.push({
        id: Date.now() + Math.random() + '',
        desc: it.desc || 'Expense',
        amount: parseFloat(it.amount) || 0,
        category: it.category || 'Other',
        date: it.date || today()
      });
    });

    saveData();
    renderDashboard();

    res.innerHTML =
      `<strong style="color:var(--c-accent2);">✓ Parsed ${items.length} expense(s):</strong><br>` +
      items.map(i => `• ${escHtml(i.desc)} — ₹${i.amount} <em style="color:var(--c-muted);">(${i.category})</em>`).join('<br>');

    document.getElementById('receipt-text').value = '';
    toast(`Added ${items.length} expense(s)!`);

  } catch (e) {
    res.innerHTML = '<span style="color:var(--c-danger);">Could not parse. Check your API key or try rephrasing.</span>';
    console.error(e);
  }

  btn.disabled = false;
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg> AI Parse &amp; Auto-Categorize`;
}
