async function expensetracker(system, userMsg, json = true) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: system + '\n\n' + userMsg }] }],
        generationConfig: { maxOutputTokens: 1000 }
      })
    }
  );

  const data = await response.json();

  // Check for API errors
  if (data.error) throw new Error(data.error.message);

  const text = data.candidates[0].content.parts[0].text;

  // Return plain text or parsed JSON
  if (!json) return text;
  return JSON.parse(text.replace(/```json?|```/g, '').trim());
}

// Shorthand for JSON responses
async function expenseJSON(system, userMsg) {
  return expenseTracker(system, userMsg, true);
}

// ── AI Insights ──

// Generate 4 financial insight tips
async function generateInsights() {
  if (!expenses.length) { toast('Log some expenses first!'); return; }

  const btn   = document.getElementById('insights-btn');
  const intro = document.getElementById('ai-intro');

  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  intro.innerHTML = `<div class="typing">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div> Crunching your numbers...`;

  const summary     = CATS.map(c => `${c}:₹${catTotal(c)}`).join(', ');
  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);

  try {
    const tips = await expenseJSON(
      `Analyze this monthly expense summary: ${summary}.
Total budget: ₹${totalBudget}. Total spent: ₹${totalMonth()}.
Give exactly 4 specific, actionable financial insights as a JSON array:
[{"icon":"💡","tip":"..."},{"icon":"⚠️","tip":"..."},{"icon":"✅","tip":"..."},{"icon":"📊","tip":"..."}]
Be specific with rupee amounts. Return only raw JSON.`,
      'Analyze my expenses'
    );

    intro.textContent = "Here's your personalized analysis for this month:";
    document.getElementById('insight-list').innerHTML = tips.map(t =>
      `<div class="insight-chip">
        <span class="chip-icon">${t.icon}</span>
        <span>${escHtml(t.tip)}</span>
      </div>`
    ).join('');

  } catch (e) {
    intro.textContent = 'Could not generate insights. Check your API key.';
    console.error(e);
  }

  btn.disabled = false;
  btn.textContent = 'Regenerate Insights';
}

// Clear insight panel
function clearInsights() {
  document.getElementById('insight-list').innerHTML = '';
  document.getElementById('ai-intro').textContent = 'Click "Generate Insights" to analyze your spending patterns.';
}

// ── Q&A Chat Advisor ──
async function askAdvisor() {
  const q      = document.getElementById('ai-question').value.trim();
  if (!q) return;

  const thread = document.getElementById('qa-thread');

  // Add user message bubble
  thread.insertAdjacentHTML('beforeend',
    `<div class="ai-bubble user-bubble">
      <div class="ai-msg">${escHtml(q)}</div>
    </div>`
  );
  document.getElementById('ai-question').value = '';

  // Add AI loading bubble
  const id = 'r' + Date.now();
  thread.insertAdjacentHTML('beforeend',
    `<div class="ai-bubble" id="${id}">
      <div class="ai-avatar">
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1v2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2v-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/>
        </svg>
      </div>
      <div class="ai-msg">
        <div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      </div>
    </div>`
  );
  thread.scrollTop = thread.scrollHeight;

  // Build context for the AI
  const ctx = `User monthly expenses: ${CATS.map(c => `${c}:₹${catTotal(c)}`).join(',')}.
Budgets: ${JSON.stringify(budgets)}. Total spent: ₹${totalMonth()}.`;

  try {
    const reply = await expensetracker(
      `You are a personal finance AI advisor. Context: ${ctx}
Be concise (2-3 sentences max), friendly, and specific with rupee amounts.`,
      q,
      false
    );
    document.getElementById(id).querySelector('.ai-msg').textContent = reply;
  } catch (e) {
    document.getElementById(id).querySelector('.ai-msg').textContent =
      'Sorry, could not connect. Check your API key.';
  }
}

// ── Forecast ──
async function runForecast() {
  if (expenses.length < 3) { toast('Log at least 3 expenses first.'); return; }

  const btn  = document.getElementById('forecast-btn');
  const fmsg = document.getElementById('forecast-msg');

  btn.disabled = true;
  btn.textContent = 'Running forecast...';
  fmsg.innerHTML = `<div class="typing">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div> Running AI prediction model...`;

  // Build next 3 month names
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date();
  const m = d.getMonth();
  const y = d.getFullYear();
  const nextMonths = [
    `${months[(m + 1) % 12]} ${m + 1 >= 12 ? y + 1 : y}`,
    `${months[(m + 2) % 12]} ${m + 2 >= 12 ? y + 1 : y}`,
    `${months[(m + 3) % 12]} ${m + 3 >= 12 ? y + 1 : y}`
  ];

  const summary = CATS.map(c => `${c}:₹${catTotal(c)}`).join(',');

  try {
    const predictions = await expenseJSON(
      `Based on current monthly spending (${summary}, total ₹${Math.round(totalMonth())}),
predict spending for: ${nextMonths.join(', ')}.
Return JSON array:
[{"month":"${nextMonths[0]}","amount":12000,"trend":"up","reason":"..."},...]
"trend": "up"|"stable"|"down". "reason": 1-sentence explanation. Return only raw JSON.`,
      'Forecast my expenses'
    );

    fmsg.textContent = predictions[0]?.reason || 'Forecast based on current spending patterns.';

    document.getElementById('predict-row').innerHTML = predictions.map(p => {
      const arrow = p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→';
      const col   = p.trend === 'up' ? '#ef4444' : p.trend === 'down' ? '#22c55e' : '#f59e0b';
      return `<div class="predict-card">
        <div class="predict-month">${p.month}</div>
        <div class="predict-amt">${fmt(p.amount)}</div>
        <div class="predict-arrow" style="color:${col}">${arrow}</div>
      </div>`;
    }).join('');

  } catch (e) {
    fmsg.textContent = 'Forecast failed. Check your API key.';
    console.error(e);
  }

  // Budget alerts
  const over = CATS.filter(c => budgets[c] > 0 && catTotal(c) > budgets[c] * 0.8);
  const alertCard = document.getElementById('alert-card');

  if (over.length) {
    alertCard.style.display = '';
    document.getElementById('alert-list').innerHTML = over.map(c => {
      const pct    = Math.round(catTotal(c) / budgets[c] * 100);
      const isOver = catTotal(c) > budgets[c];
      return `<div class="insight-chip" style="border-color:${isOver ? '#ef4444' : '#f59e0b'};">
        <span class="chip-icon">${isOver ? '🔴' : '🟡'}</span>
        <span>
          <strong>${c}:</strong>
          ${isOver ? 'Over budget!' : 'Approaching limit.'}
          Spent ${fmt(catTotal(c))} of ${fmt(budgets[c])} (${pct}%)
        </span>
      </div>`;
    }).join('');
  } else {
    alertCard.style.display = 'none';
  }

  btn.disabled = false;
  btn.textContent = 'Re-run Forecast';
  renderCatChart();
}
