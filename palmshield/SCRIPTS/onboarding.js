/**
 * Dah PalmShield Onboarding
 * Role selection and protocol join flow and SNSS too.
 */

function selectRole(role) {
  // SNS card routes to claim screen, not a role
  if (role === 'sns') {
    // highlight the card briefly then route
    document.getElementById('rc-sns').className = 'role-card selected-sns';
    setTimeout(() => {
      // populate the SNS screen with current wallet
      const walletEl = document.getElementById('sns-preview-wallet');
      if (walletEl) walletEl.textContent = state.walletShort || 'Connected wallet';
      setScreen('screen-sns');
    }, 200);
    return;
  }

  state.role = role;
  ['hunter', 'dao', 'sns'].forEach(r => {
    const el = document.getElementById('rc-' + r);
    if (el) el.className = 'role-card';
  });
  document.getElementById('rc-' + role).className = 'role-card selected-' + role;
  document.getElementById('join-btn').disabled = false;
}

async function joinProtocol() {
  if (!state.role) return;
  const btn = document.getElementById('join-btn');
  btn.textContent = 'Registering...';
  btn.disabled = true;

  try {
    const existing = await sb(`users?wallet_address=eq.${state.wallet}&select=wallet_address`);

    if (existing.length > 0) {
      await sb(`users?wallet_address=eq.${state.wallet}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: JSON.stringify({
          role: state.role,
        }),
      });
    } else {
      await sb('users', {
        method: 'POST',
        prefer: 'return=minimal',
        body: JSON.stringify({
          wallet_address: state.wallet,
          role: state.role,
          pusd_balance: 0,
        }),
      });
    }

    showToast('✓ Welcome to PalmShield!', true);
    setTimeout(() => {
      if (state.role === 'dao') goToDAO();
      else goToHunter();
    }, 600);
  } catch (e) {
    showToast('Error saving role: ' + e.message);
    btn.textContent = 'Join PalmShield →';
    btn.disabled = false;
  }
}
