/**
 * PalmShield Rendrr & Modal
 * Shared card renderer + wallet detail modal logic.
 */

// ── Shared Card Renderer ────────────────────────────────────

function renderSubmissionCard(sub, context) {
  const si = getSeverityInfo(sub.threatType);
  const total = sub.confirms + sub.denies;
  const pct = total ? Math.round(sub.confirms / total * 100) : 0;
  const isDao = context === 'dao';
  const alreadyVoted = state.myVotes[sub.id];

  const div = document.createElement('div');
  div.className = 'submission';
  div.onclick = () => openModal(sub.id);

  let badgeClass = si.badge;
  let badgeText = sub.threatType;

  if (sub.status === 'confirmed') {
    badgeClass = 'badge-confirmed';
    badgeText = 'Confirmed';
  }

  const submitterDisplay = displayNameLink(
    sub.submitterWalletFull,
    'font-family:var(--mono);font-size:10px;'
  );

  const targetShort = sub.targetWallet.length > 20
    ? sub.targetWallet.slice(0, 8) + '...' + sub.targetWallet.slice(-6)
    : sub.targetWallet;

  const targetLink = `<a href="https://solscan.io/account/${sub.targetWallet}?cluster=devnet"
    target="_blank"
    rel="noopener"
    style="color:inherit;text-decoration:none"
    onclick="event.stopPropagation()"
    onmouseover="this.style.textDecoration='underline'"
    onmouseout="this.style.textDecoration='none'"
    title="${sub.targetWallet}">${targetShort}</a>`;

  div.innerHTML = `
    <div class="sub-stripe ${si.stripe}"></div>
    ${sub.image
      ? `<img src="${sub.image}" alt="Evidence"
          onerror="this.style.display='none';console.error('Card image failed:', this.src)"
          style="width:100%;max-height:160px;object-fit:cover;display:block;border-bottom:1px solid var(--border)"/>`
      : ''}
    <div class="sub-body">
      <div class="sub-top">
        <div>
          <div class="sub-addr">${targetLink}</div>
          <div class="sub-by">by ${submitterDisplay} · ${sub.time}</div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>

      <div class="sub-meta">
        <div class="meta-item">Type<strong>${sub.threatType}</strong></div>
        <div class="meta-item">Bounty<strong class="meta-green">${sub.bounty} PUSD</strong></div>
        <div class="meta-item">Votes<strong>${total}</strong></div>
        <div class="meta-item">Confirm<strong>${pct}%</strong></div>
      </div>

      <div class="sub-remark">${sub.remark}</div>

      <div class="vote-bar">
        <div class="vote-fill" style="width:${pct}%"></div>
      </div>

      <div class="sub-footer">
        ${isDao && !alreadyVoted && sub.status === 'pending'
          ? `<button class="vote-btn vbtn-confirm" onclick="event.stopPropagation();quickVote('${sub.id}','confirm',this)">✓ Confirm (${sub.confirms})</button>
             <button class="vote-btn vbtn-deny" onclick="event.stopPropagation();quickVote('${sub.id}','deny',this)">✕ Deny (${sub.denies})</button>
             <span style="font-family:var(--mono);font-size:9px;color:var(--muted2)">stakes ${STAKE_VOTE} PUSD</span>`
          : isDao && alreadyVoted
          ? `<span style="font-family:var(--mono);font-size:10px;color:var(--muted)">You voted: <strong style="color:${alreadyVoted === 'confirm' ? 'var(--green)' : 'var(--red)'}">${alreadyVoted}</strong></span>`
          : `<span style="font-family:var(--mono);font-size:10px;color:var(--green)">${sub.confirms} confirm · ${sub.denies} deny</span>`
        }
        <span class="sub-comments">${sub.comments.length} comments →</span>
      </div>
    </div>`;

  return div;
}

// ── Modal ───────────────────────────────────────────────────

let currentSub = null;

function openModal(id) {
  currentSub = state.submissions.find(s => s.id === id);
  if (!currentSub) return;

  const s = currentSub;

  document.getElementById('modal-tag').textContent = '// ' + s.threatType.toLowerCase();
  document.getElementById('modal-title').textContent = s.threatType;
  document.getElementById('modal-subtitle').innerHTML =
    `Submitted by ${displayNameLink(s.submitterWalletFull, 'font-size:10px;')} · ${s.time}`;

  document.getElementById('modal-wallet').innerHTML =
    `<a href="https://solscan.io/account/${s.targetWallet}?cluster=devnet"
      target="_blank"
      rel="noopener"
      style="color:inherit;text-decoration:none;word-break:break-all"
      onmouseover="this.style.textDecoration='underline'"
      onmouseout="this.style.textDecoration='none'">${s.targetWallet}</a>`;

  document.getElementById('modal-remark').textContent = s.remark;

  const img = document.getElementById('modal-image');

  if (s.image) {
    img.onload = () => {
      img.style.display = 'block';
    };

    img.onerror = () => {
      console.error('Modal image failed:', s.image);
      img.style.display = 'none';
      showToast('Evidence image could not load');
    };

    img.src = s.image;
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';
  }

  document.getElementById('modal-stats').innerHTML = `
    <div class="modal-stat">Threat Type<strong>${s.threatType}</strong></div>
    <div class="modal-stat">Bounty<strong style="color:var(--green)">${s.bounty} PUSD</strong></div>
    <div class="modal-stat">Status<strong style="color:${s.status === 'confirmed' ? 'var(--green)' : 'var(--amber)'}">${s.status}</strong></div>`;

  const total = s.confirms + s.denies;
  const pct = total ? Math.round(s.confirms / total * 100) : 0;

  document.getElementById('modal-vote-bar').style.width = pct + '%';
  document.getElementById('modal-confirms').textContent = s.confirms + ' confirm';
  document.getElementById('modal-denies').textContent = s.denies + ' deny';

  document.getElementById('modal-vote-note').textContent = s.status === 'confirmed'
    ? '✓ Quorum reached — threat confirmed.'
    : `75% confirm quorum needed · currently at ${pct}%`;

  const btns = document.getElementById('modal-dao-btns');

  if (state.myVotes[s.id] || s.status !== 'pending') {
    btns.innerHTML = `<div style="font-family:var(--mono);font-size:11px;color:var(--muted);grid-column:span 2;text-align:center;padding:12px">
      ${state.myVotes[s.id]
        ? 'You already voted on this submission.'
        : 'Voting closed — threat ' + s.status + '.'}
    </div>`;
  } else {
    btns.innerHTML = `
      <button class="dao-btn dao-confirm" onclick="castVote('confirm')">✓ Vote Confirm</button>
      <button class="dao-btn dao-deny" onclick="castVote('deny')">✕ Vote Deny</button>`;
  }

  document.getElementById('payout-flash').classList.remove('show');

  renderComments();
  switchModalTab('evidence', document.querySelector('.modal-tab'));

  document.getElementById('wallet-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('wallet-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentSub = null;
}

function maybeCloseModal(e) {
  if (e.target === document.getElementById('wallet-modal')) closeModal();
}

function switchModalTab(tab, btn) {
  ['evidence', 'comments', 'vote'].forEach(t => {
    document.getElementById('mtab-' + t).style.display = t === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));

  if (btn) btn.classList.add('active');
  else document.querySelectorAll('.modal-tab')[['evidence', 'comments', 'vote'].indexOf(tab)].classList.add('active');
}

// ── Comments ────────────────────────────────────────────────

function renderComments() {
  if (!currentSub) return;

  const list = document.getElementById('modal-comments-list');
  list.innerHTML = '';

  if (!currentSub.comments.length) {
    list.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-align:center;padding:16px">No comments yet. Be the first.</div>';
    return;
  }

  currentSub.comments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';

    const author = c.byWallet ? displayNameLink(c.byWallet) : c.by;

    div.innerHTML = `
      <div class="cmt-header">
        <span class="cmt-by">${author}</span>
        <span class="cmt-time">${c.time}</span>
      </div>
      <div class="cmt-text">${c.text}</div>`;

    list.appendChild(div);
  });
}

async function addComment() {
  if (!currentSub) return;

  const inp = document.getElementById('comment-input');
  const text = inp.value.trim();

  if (!text) return;

  inp.disabled = true;

  try {
    await sb('comments', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({
        submission_id: currentSub.id,
        author_wallet: state.wallet,
        text,
      }),
    });

    currentSub.comments.push({
      byWallet: state.wallet,
      by: state.snsName || state.walletShort,
      time: 'just now',
      text,
    });

    inp.value = '';
    renderComments();
    showToast('Comment posted', true);
  } catch (e) {
    showToast('Could not post: ' + e.message);
  } finally {
    inp.disabled = false;
  }
}

// ── Modal Vote Actions ──────────────────────────────────────

async function castVote(dir) {
  if (!currentSub) return;

  if (state.myVotes[currentSub.id]) {
    showToast('Already voted');
    return;
  }

  const btns = document.getElementById('modal-dao-btns');

  btns.innerHTML = `<div style="font-family:var(--mono);font-size:11px;color:var(--muted);grid-column:span 2;text-align:center;padding:12px">Casting vote...</div>`;

  try {
    await castVoteDB(currentSub.id, dir);

    const total = currentSub.confirms + currentSub.denies;
    const pct = total ? Math.round(currentSub.confirms / total * 100) : 0;

    document.getElementById('modal-vote-bar').style.width = pct + '%';
    document.getElementById('modal-confirms').textContent = currentSub.confirms + ' confirm';
    document.getElementById('modal-denies').textContent = currentSub.denies + ' deny';

    if (currentSub.status === 'confirmed') {
      document.getElementById('payout-flash').classList.add('show');
      document.getElementById('payout-amount').textContent = currentSub.bounty + ' PUSD';
      document
