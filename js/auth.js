// Firebase SDK loaded via CDN in HTML pages
// Firebase App initialized here
// Auth methods: email/password + Google OAuth
// State persists across pages via onAuthStateChanged

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ---- Firebase Configuration ----
const firebaseConfig = {
  apiKey: "AIzaSyAZd8SD_eUZabeyuwslmvoop8I8VLH30Xc",
  authDomain: "abdul-portfolio-cbd2b.firebaseapp.com",
  projectId: "abdul-portfolio-cbd2b",
  storageBucket: "abdul-portfolio-cbd2b.firebasestorage.app",
  messagingSenderId: "908605755875",
  appId: "1:908605755875:web:6a81d4ae60499ebfb6d0d6"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ---- Error Messages ----
const AUTH_ERRORS = {
  'auth/user-not-found':           'No account found with this email address.',
  'auth/wrong-password':           'Incorrect password. Please try again.',
  'auth/too-many-requests':        'Too many failed attempts. Please try again later.',
  'auth/email-already-in-use':     'An account with this email already exists.',
  'auth/weak-password':            'Password must be at least 6 characters.',
  'auth/invalid-email':            'Please enter a valid email address.',
  'auth/popup-closed-by-user':     'Sign-in popup was closed. Please try again.',
  'auth/popup-blocked':            'Popup was blocked by your browser. Please allow popups for this site.',
  'auth/cancelled-popup-request':  'Sign-in cancelled. Please try again.',
  'auth/network-request-failed':   'Network error. Please check your connection and try again.',
  'auth/invalid-credential':       'Incorrect email or password. Please try again.',
  'auth/operation-not-allowed':    'This sign-in method is not enabled. Please contact support.',
  'auth/unauthorized-domain':      'This domain is not authorised for sign-in. Please contact support.',
  'auth/app-not-authorized':       'This app is not authorised to use Firebase Authentication.',
  'auth/internal-error':           'An internal error occurred. Please try again.',
  'auth/missing-email':            'Please enter your email address.',
  'auth/missing-password':         'Please enter your password.',
  'auth/user-disabled':            'This account has been disabled. Please contact support.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
};

function getAuthErrorMessage(code, err) {
  if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  // Show the raw code in the message so the issue can be identified
  console.error('Firebase auth error:', err);
  return 'Sign-in failed (' + (code || 'unknown') + '). Please try again or contact support.';
}

// ---- Show / Hide Error ----
function showAuthError(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearAuthError(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
}

// ---- Auth State Observer — updates header on all pages ----
onAuthStateChanged(auth, (user) => {
  const loginBtn  = document.getElementById('header-login-btn');
  const signupBtn = document.getElementById('header-signup-btn');
  const userGreeting = document.getElementById('header-user-greeting');
  const logoutBtn = document.getElementById('header-logout-btn');

  if (user) {
    const displayName = user.displayName || user.email.split('@')[0];
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (userGreeting) {
      userGreeting.textContent = 'Hi, ' + displayName;
      userGreeting.style.display = 'flex';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (loginBtn)  loginBtn.style.display  = '';
    if (signupBtn) signupBtn.style.display = '';
    if (userGreeting) userGreeting.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});

// ---- Logout ----
window.handleLogout = async function() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// =========================================================
// LOGIN PAGE LOGIC
// =========================================================
(function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const forgotLink = document.getElementById('forgot-password-link');

  // Password show/hide
  const pwField  = document.getElementById('login-password');
  const pwToggle = document.getElementById('login-pw-toggle');
  if (pwField && pwToggle) {
    pwToggle.addEventListener('click', () => {
      const isText = pwField.type === 'text';
      pwField.type = isText ? 'password' : 'text';
      pwToggle.innerHTML = isText ? EYE_ICON : EYE_OFF_ICON;
    });
  }

  // Login form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError('auth-error');

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = form.querySelector('[type="submit"]');

    if (!email || !password) {
      showAuthError('auth-error', 'Please enter your email and password.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing In...';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
    } catch (err) {
      showAuthError('auth-error', getAuthErrorMessage(err.code, err));
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  });

  // Google login
  const googleBtn = document.getElementById('google-login-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      clearAuthError('auth-error');
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = 'index.html';
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          showAuthError('auth-error', getAuthErrorMessage(err.code, err));
        }
      }
    });
  }

  // Forgot password
  if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      if (!email) {
        showAuthError('auth-error', 'Enter your email address above, then click Forgot Password.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        showAuthError('auth-error', 'Password reset email sent. Check your inbox.');
        document.getElementById('auth-error').style.borderColor = 'var(--accent)';
        document.getElementById('auth-error').style.color = 'var(--accent)';
        document.getElementById('auth-error').style.backgroundColor = 'rgba(0,166,126,0.08)';
      } catch (err) {
        showAuthError('auth-error', getAuthErrorMessage(err.code, err));
      }
    });
  }
})();

// =========================================================
// SIGNUP PAGE LOGIC
// =========================================================
(function initSignupPage() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  // Password show/hide toggles
  const pwField     = document.getElementById('signup-password');
  const pwToggle    = document.getElementById('signup-pw-toggle');
  const confField   = document.getElementById('signup-confirm');
  const confToggle  = document.getElementById('signup-conf-toggle');

  if (pwField && pwToggle) {
    pwToggle.addEventListener('click', () => {
      const isText = pwField.type === 'text';
      pwField.type = isText ? 'password' : 'text';
      pwToggle.innerHTML = isText ? EYE_ICON : EYE_OFF_ICON;
    });
  }

  if (confField && confToggle) {
    confToggle.addEventListener('click', () => {
      const isText = confField.type === 'text';
      confField.type = isText ? 'password' : 'text';
      confToggle.innerHTML = isText ? EYE_ICON : EYE_OFF_ICON;
    });
  }

  // Password strength indicator
  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');

  if (pwField && strengthFill && strengthText) {
    pwField.addEventListener('input', () => {
      const val = pwField.value;
      const strength = getPasswordStrength(val);
      strengthFill.className = 'strength-bar-fill ' + strength.level;
      strengthText.className = 'strength-text ' + strength.level;
      strengthText.textContent = val ? strength.label : '';
    });
  }

  // Signup form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError('auth-error');

    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm  = document.getElementById('signup-confirm').value;
    const agreeEl  = document.getElementById('agree-privacy');
    const btn      = form.querySelector('[type="submit"]');

    if (!name) {
      showAuthError('auth-error', 'Please enter your full name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthError('auth-error', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      showAuthError('auth-error', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      showAuthError('auth-error', 'Passwords do not match. Please re-enter.');
      return;
    }
    if (agreeEl && !agreeEl.checked) {
      showAuthError('auth-error', 'Please agree to the Privacy Policy to continue.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating Account...';

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      window.location.href = 'index.html';
    } catch (err) {
      showAuthError('auth-error', getAuthErrorMessage(err.code, err));
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });

  // Google signup
  const googleBtn = document.getElementById('google-signup-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      clearAuthError('auth-error');
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = 'index.html';
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          showAuthError('auth-error', getAuthErrorMessage(err.code, err));
        }
      }
    });
  }
})();

// ---- Password Strength Helper ----
function getPasswordStrength(password) {
  if (!password) return { level: '', label: '' };
  const hasUpper   = /[A-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const len        = password.length;
  const score      = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  if (score <= 2) return { level: 'weak',   label: 'Weak' };
  if (score <= 3) return { level: 'fair',   label: 'Fair' };
  return            { level: 'strong', label: 'Strong' };
}

// ---- SVG Icons for password toggle ----
const EYE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
