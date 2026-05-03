/** SNS name claim on Supabase since currently bonfida endpoint/frontend is somehwat down
 * Ran into some demonic errors here that nearly sent me bersek so if u wanna save urself the stress PLEASE DO TAKE NOTE 
 * Supabase SQL required:
 * alter table users add column if not exists sns_name text;
 * create unique index if not exists users_sns_name_unique
 * on users (sns_name)
 * where sns_name is not null;
 */


// ── Display Name Resolution ─────────────────────────────────

/**
 * Returns the display name for a wallet address.
 * Checks state.snsCache first, then falls back to shortWallet().
 * @param {string} fullAddress  - full 44-char wallet address
 * @returns {string}            - "name.sol" or "Ab3x...9Kpq"
 */
function displayName(fullAddress) {
  if (!fullAddress) return '????...????';
  const cached = state.snsCache && state.snsCache[fullAddress];
  if (cached) return cached;
  return shortWallet(fullAddress);
}

function displayNameLink(fullAddress, extraStyle = '') {
  if (!fullAddress) return '<span style="color:var(--muted2)">????...????</span>';

  const name = displayName(fullAddress);
  const url = `https://solscan.io/account/${fullAddress}?cluster=devnet`;
  const isSns = name.endsWith('.sol');
  const color = isSns ? '#a78bfa' : 'inherit';

  return `<a href="${url}" target="_blank" rel="noopener"
    onclick="event.stopPropagation()"
    style="color:${color};text-decoration:none;cursor:pointer;${extraStyle}"
    title="${fullAddress}"
    onmouseover="this.style.textDecoration='underline'"
    onmouseout="this.style.textDecoration='none'"
  >${name}</a>`;
}

async function loadSNSCache(walletAddresses) {
  if (!walletAddresses || !walletAddresses.length) return;

  const unique = [...new Set(walletAddresses.filter(Boolean))];
  if (!unique.length) return;

  try {
    const filter = unique.map(w => `wallet_address.eq.${w}`).join(',');
    const rows = await sb(`users?or=(${filter})&select=wallet_address,sns_name`);

    if (!state.snsCache) state.snsCache = {};

    rows.forEach(r => {
      if (r.sns_name) state.snsCache[r.wallet_address] = r.sns_name;
    });
  } catch (e) {
    // non-critical — fall back to short addresses
  }
}

// ── SNS Input Validation ────────────────────────────────────

function snsInputChange(input) {
  const raw = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  input.value = raw;

  const hint = document.getElementById('sns-hint');
  const preview = document.getElementById('sns-preview-name');
  const btn = document.getElementById('sns-claim-btn');
  const wrap = document.getElementById('sns-input-wrap');

  if (preview) {
    preview.innerHTML = raw
      ? `${raw}<span style="color:#a78bfa">.sol</span>`
      : `yourname<span style="color:#a78bfa">.sol</span>`;
  }

  if (!raw || raw.length < 3) {
    if (hint) {
      hint.textContent = raw ? 'Too short — minimum 3 characters' : '3–32 characters · letters, numbers, hyphens';
      hint.style.color = raw ? '#ef4444' : '';
    }
    if (btn) btn.disabled = true;
    if (wrap) wrap.style.borderColor = raw ? 'rgba(239,68,68,.4)' : '';
    return;
  }

  if (raw.startsWith('-') || raw.endsWith('-')) {
    if (hint) {
      hint.textContent = 'Cannot start or end with a hyphen';
      hint.style.color = '#ef4444';
    }
    if (btn) btn.disabled = true;
    if (wrap) wrap.style.borderColor = 'rgba(239,68,68,.4)';
    return;
  }

  if (hint) {
    hint.textContent = `✓ ${raw}.sol — looks good`;
    hint.style.color = 'var(--green)';
  }
  if (btn) btn.disabled = false;
  if (wrap) wrap.style.borderColor = 'rgba(167,139,250,.4)';
}

// ── SNS Claim Flow ──────────────────────────────────────────

async function claimSNS() {
  const input = document.getElementById('sns-name-input');
  const raw = (input?.value || '').trim().toLowerCase();

  if (!raw || raw.length < 3) {
    showToast('⚠ Name too short — minimum 3 characters');
    return;
  }

  const snsName = raw + '.sol';
  const btn = document.getElementById('sns-claim-btn');

  btn.textContent = 'Claiming...';
  btn.disabled = true;

  try {
    const existing = await sb(`users?sns_name=eq.${snsName}&select=wallet_address`);

    if (existing.length > 0 && existing[0].wallet_address !== state.wallet) {
      showToast(`⚠ ${snsName} is already taken — try another name`);
      btn.textContent = 'Claim name & choose role →';
      btn.disabled = false;
      return;
    }

    const userRows = await sb(`users?wallet_address=eq.${state.wallet}&select=wallet_address`);

    if (userRows.length > 0) {
      await sb(`users?wallet_address=eq.${state.wallet}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: JSON.stringify({
          sns_name: snsName,
        }),
      });
    } else {
      await sb('users', {
        method: 'POST',
        prefer: 'return=minimal',
        body: JSON.stringify({
          wallet_address: state.wallet,
          sns_name: snsName,
          pusd_balance: 0,
        }),
      });
    }

    if (!state.snsCache) state.snsCache = {};
    state.snsCache[state.wallet] = snsName;
    state.snsName = snsName;

    showToast(`✓ ${snsName} claimed!`, true);

    setTimeout(() => {
      setScreen('screen-onboard');

      document.getElementById('rc-sns').style.display = 'none';
      document.getElementById('onboard-step-label').textContent = 'STEP 2 OF 2 · CHOOSE YOUR ROLE';
      document.getElementById('onboard-title').textContent = 'Now choose your role.';
      document.getElementById('onboard-sub').textContent = `Hunting or governance? You're ${snsName} — make it count.`;
      document.getElementById('join-btn').textContent = 'Join PalmShield →';

      ['hunter', 'dao'].forEach(r => {
        const el = document.getElementById('rc-' + r);
        if (el) el.className = 'role-card';
      });

      document.getElementById('join-btn').disabled = true;
      state.role = null;
    }, 800);

  } catch (e) {
    if (e.message.includes('23505') || e.message.includes('unique')) {
      showToast(`⚠ ${snsName} is already taken — try another`);
    } else {
      showToast('Claim failed: ' + e.message);
    }

    btn.textContent = 'Claim name & choose role →';
    btn.disabled = false;
  }
}

function skipSNS() {
  showToast('No worries you can claim a name later');

  setTimeout(() => {
    setScreen('screen-onboard');

    document.getElementById('rc-sns').style.display = 'none';
    document.getElementById('onboard-step-label').textContent = 'CHOOSE YOUR ROLE';
    document.getElementById('onboard-title').textContent = 'Now choose your role.';
    document.getElementById('onboard-sub').textContent = 'You can always claim a .sol name later from your profile.';
    document.getElementById('join-btn').textContent = 'Join PalmShield →';

    ['hunter', 'dao'].forEach(r => {
      const el = document.getElementById('rc-' + r);
      if (el) el.className = 'role-card';
    });

    document.getElementById('join-btn').disabled = true;
    state.role = null;
  }, 600);
}
