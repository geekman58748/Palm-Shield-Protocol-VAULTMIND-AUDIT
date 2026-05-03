/**
 * PalmShield DAO Dashboard
 * Review feed, vote history, voting, quorum, payouts.
would update to wallet based bal reading later on as thats more stable
 */

// ── Dashboard Init ──────────────────────────────────────────

async function goToDAO() {
  setScreen('screen-dao');

  const navDisplay = state.snsName || state.walletShort;
  document.getElementById('dao-wallet-display').textContent = navDisplay;
  document.getElementById('dao-wallet-full').textContent = state.wallet || '';

  if (state.role === 'both') {
    document.getElementById('dao-role-badge').textContent = 'HUNTER + DAO';
    document.getElementById('dao-role-badge').className = 'nav-role-badge role-both';
    document.getElementById('dao-dash-switch').style.display = 'flex';
  } else {
    document.getElementById('dao-role-badge').textContent = 'DAO MEMBER';
    document.getElementById('dao-role-badge').className = 'nav-role-badge role-dao';
    document.getElementById('dao-dash-switch').style.display = 'none';
  }

  document.getElementById('dao-feed').innerHTML = `
    <div class="empty">
      <div class="empty-icon" style="animation:pulse 1.5s infinite">⏳</div>
      <div class="empty-title">Loading submissions...</div>
    </div>`;

  await loadSubmissions();
  await loadMyVotes();
  renderDAOFeed();
  updateDaoPendingCount();
  startRealtime();
}

function updateDaoPendingCount() {
  const n = state.submissions.filter(s => s.status === 'pending').length;
  const el = document.getElementById('dao-pending-count');
  if (el) el.textContent = n;
}

// ── Tab Switching ───────────────────────────────────────────

function switchDaoTab(tab, btn, from) {
  ['review', 'history'].forEach(t => hide('dtab-' + t));
  show('dtab-' + tab);

  if (!from) {
    document.querySelectorAll('#screen-dao .nav-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  if (tab === 'review') renderDAOFeed();
  if (tab === 'history') renderDaoHistory();
}

// ── Render: DAO Feed ────────────────────────────────────────

function renderDAOFeed() {
  const feed = document.getElementById('dao-feed');
  const pending = state.submissions.filter(s => s.status === 'pending');
  const confirmed = state.submissions.filter(s => s.status === 'confirmed');

  const ps = document.getElementById('dao-stat-pending');
  const cs = document.getElementById('dao-stat-confirmed');

  if (ps) ps.textContent = pending.length;
  if (cs) cs.textContent = confirmed.length;

  feed.innerHTML = '';

  if (!state.submissions.length) {
    feed.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🏛️</div>
        <div class="empty-title">No submissions yet</div>
        <div class="empty-desc">When hunters submit threat reports they'll appear here.</div>
      </div>`;
    return;
  }

  if (!pending.length) {
    feed.innerHTML = `
      <div class="empty">
        <div class="empty-icon">✅</div>
        <div class="empty-title">All caught up</div>
        <div class="empty-desc">No pending submissions right now. Check back soon.</div>
      </div>`;
    return;
  }

  pending.forEach(s => feed.appendChild(renderSubmissionCard(s, 'dao')));
  updateDaoPendingCount();
}

// ── Render: Vote History ────────────────────────────────────

function renderDaoHistory() {
  const feed = document.getElementById('dao-history-feed');
  const voted = Object.keys(state.myVotes);

  if (!voted.length) {
    feed.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🗳️</div>
        <div class="empty-title">No votes cast yet</div>
        <div class="empty-desc">Your voting history will appear here.</div>
      </div>`;
    return;
  }

  feed.innerHTML = '';

  voted.forEach(id => {
    const sub = state.submissions.find(s => s.id === id);
    if (!sub) return;

    const vote = state.myVotes[id];
    const targetShort = sub.targetWallet.slice(0, 8) + '...' + sub.targetWallet.slice(-6);

    const div = document.createElement('div');
    div.className = 'submission';
    div.onclick = () => openModal(id);

    div.innerHTML = `
      <div class="sub-stripe ${vote === 'confirm' ? 'stripe-review' : 'stripe-critical'}"></div>
      <div class="sub-body">
        <div class="sub-top">
          <div>
            <div class="sub-addr">
              <a href="https://solscan.io/account/${sub.targetWallet}?
