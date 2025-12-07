const TARGET_HASH = "d04b98f48e8f8bcc15c6d72795c55681a9d6f22155357351496738312574d6d8";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
  const input = document.getElementById('password-input').value;
  const errorMsg = document.getElementById('login-error');
  
  if (!input) return;

  const hash = await sha256(input);

  if (hash === TARGET_HASH) {
    document.getElementById('login-screen').style.display = 'none';
    const app = document.getElementById('app-container');
    app.style.display = 'block';
    
    setTimeout(() => {
      app.style.opacity = '1';
    }, 10);

    if (typeof initApp === 'function') {
      initApp();
    }
    
    sessionStorage.setItem('isLoggedIn', 'true');
  } else {
    errorMsg.style.display = 'block';
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

document.getElementById('password-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') checkPassword();
});

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    document.getElementById('login-screen').style.display = 'none';
    const app = document.getElementById('app-container');
    app.style.display = 'block';
    app.style.opacity = '1';
    if (typeof initApp === 'function') {
      initApp();
    }
  }
});