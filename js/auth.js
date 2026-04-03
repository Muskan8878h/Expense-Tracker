function authSwitch(mode) {
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active',
      (mode === 'login' && i === 0) || (mode === 'signup' && i === 1)
    )
  );
  document.getElementById('auth-login').style.display  = mode === 'login'  ? '' : 'none';
  document.getElementById('auth-signup').style.display = mode === 'signup' ? '' : 'none';
}

// Sign in existing user
function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const errEl = document.getElementById('l-err');

  if (!email || !pass) { errEl.textContent = 'Please fill all fields.'; return; }
  if (pass.length < 3) { errEl.textContent = 'Password too short.'; return; }

  const accounts = JSON.parse(localStorage.getItem('ss_accounts') || '{}');
  if (accounts[email] && accounts[email] !== pass) {
    errEl.textContent = 'Incorrect password.';
    return;
  }

  // Save session and boot app
  currentUser = email;
  localStorage.setItem('ss_session', email);
  bootApp();
}

// Create new account
function doSignup() {
  const name  = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass  = document.getElementById('s-pass').value;
  const errEl = document.getElementById('s-err');

  if (!name || !email || !pass) { errEl.textContent = 'Please fill all fields.'; return; }
  if (pass.length < 6)          { errEl.textContent = 'Password must be 6+ characters.'; return; }

  const accounts = JSON.parse(localStorage.getItem('ss_accounts') || '{}');
  if (accounts[email]) { errEl.textContent = 'Account already exists. Sign in.'; return; }

  // Save account
  accounts[email] = pass;
  localStorage.setItem('ss_accounts', JSON.stringify(accounts));

  // Save name
  const names = JSON.parse(localStorage.getItem('ss_names') || '{}');
  names[email] = name;
  localStorage.setItem('ss_names', JSON.stringify(names));

  // Auto-login
  currentUser = email;
  localStorage.setItem('ss_session', email);
  bootApp();
}

// Sign out current user
function doLogout() {
  localStorage.removeItem('ss_session');
  location.reload();
}
