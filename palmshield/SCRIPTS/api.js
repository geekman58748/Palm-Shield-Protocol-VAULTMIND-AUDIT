/**
 * PalmShield Supabase API
 * Lightweight REST wrapper sssooo no SDK required.
 */

/**
 * Generic Supabase REST fetch.
 * @param {string} path  - e.g. "submissions?select=*"
 * @param {object} opts  - { method, prefer, body, headers }
 */
async function sb(path, opts = {}) {
  const { headers: extraHeaders, prefer, body, method } = opts;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: method || 'GET',
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type':  'application/json',
      'Prefer':        prefer || (method === 'POST' ? 'return=representation' : 'return=representation'),
      ...(extraHeaders || {}),
    },
    ...(body ? { body } : {}),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL or null on failure.
 */
async function uploadEvidence(file, walletAddress) {
  const ext  = file.name.split('.').pop();
  const path = `${walletAddress}_${Date.now()}.${ext}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/evidence/${path}`, {
    method: 'PUT',
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type':  file.type,
      'x-upsert':      'true',
    },
    body: file,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Image upload failed:', errText);
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/evidence/${path}`;
}

// ── Data Loaders ────────────────────────────────────────────

async function loadSubmissions() {
  try {
    const rows = await sb(
      'submissions?select=*,comments(id,author_wallet,text,created_at),votes(id,voter_wallet,vote)&order=created_at.desc'
    );
    state.submissions = rows.map(normalizeRow);

    // Load SNS names for all unique submitter wallets
    const wallets = [...new Set(rows.map(r => r.submitter_wallet).filter(Boolean))];
    await loadSNSCache(wallets);

  } catch (e) {
    showToast('Could not load submissions');
  }
}

async function loadMyVotes() {
  try {
    const rows = await sb(`votes?voter_wallet=eq.${state.wallet}&select=submission_id,vote`);
    state.myVotes = {};
    rows.forEach(v => { state.myVotes[v.submission_id] = v.vote; });
    state.daoVotesCast = rows.length;

    // Update both the sidebar count and the stat card
    const sidebarEl  = document.getElementById('dao-votes-cast');
    const statCardEl = document.getElementById('dao-your-votes');
    if (sidebarEl)  sidebarEl.textContent  = rows.length;
    if (statCardEl) statCardEl.textContent = rows.length;
  } catch (e) {
    // non-critical
  }
}

async function loadHunterBalance() {
  try {
    const rows = await sb(`users?wallet_address=eq.${state.wallet}&select=pusd_balance`);
    if (rows.length) {
      state.hunterBalance = rows[0].pusd_balance || 0;
      updateHunterBalance();
    }
  } catch (e) {
    // non-critical
  }
}
