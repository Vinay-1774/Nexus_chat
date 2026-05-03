// ===== Configuration =====
// API base URL - when served via Live Server on port 5500, use 8000 for API calls
const API_BASE = window.location.port === '5500' || window.location.port === '5173'
    ? 'http://127.0.0.1:8000'
    : window.location.origin;

// ===== Tab Switching =====
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const switcher = document.querySelector('.tab-switcher');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        switcher.removeAttribute('data-active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        switcher.setAttribute('data-active', 'register');
    }
}

// ===== Password Visibility Toggle =====
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// ===== Password Strength Meter =====
const regPassword = document.getElementById('reg-password');
if (regPassword) {
    regPassword.addEventListener('input', function () {
        const val = this.value;
        const bars = document.querySelectorAll('.strength-bar');
        const text = document.querySelector('.strength-text');
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        const classes = ['', 'active-weak', 'active-medium', 'active-medium', 'active-strong'];
        bars.forEach((bar, i) => {
            bar.className = 'strength-bar';
            if (i < score) bar.classList.add(classes[score]);
        });
        text.textContent = val.length > 0 ? levels[score] : '';
    });
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Button Loading State =====
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    btn.disabled = loading;
    text.style.display = loading ? 'none' : 'inline';
    loader.style.display = loading ? 'flex' : 'none';
}

// ===== Login Handler =====
async function handleLogin(e) {
    e.preventDefault();
    setLoading('login-btn', true);

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');


        showToast('Login successful!', 'success');
        setTimeout(() => showDashboard(), 500);
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setLoading('login-btn', false);
    }
}

// ===== Registration Handler =====
async function handleRegister(e) {
    e.preventDefault();
    setLoading('register-btn', true);

    const payload = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        email: document.getElementById('reg-email').value,
        mobile_no: document.getElementById('reg-mobile').value,
        address: document.getElementById('reg-address').value
    };

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');

        showToast('Account created! Please sign in.', 'success');
        document.getElementById('register-form').reset();
        document.querySelectorAll('.strength-bar').forEach(b => b.className = 'strength-bar');
        document.querySelector('.strength-text').textContent = '';
        setTimeout(() => switchTab('login'), 800);
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setLoading('register-btn', false);
    }
}

// ===== Show Dashboard =====
async function showDashboard() {
    try {
        console.log('Fetching user data from:', `${API_BASE}/verify`);
        const res = await fetch(`${API_BASE}/verify`, {
            credentials: 'include'
        });
        
        if (!res.ok) {
            console.error('Verify failed:', res.status, res.statusText);
            throw new Error('Session expired');
        }
        
        const user = await res.json();
        console.log('User data received:', user);

        // Populate dashboard
        const initial = user.username.charAt(0).toUpperCase();
        
        // Navigation bar
        const navAvatar = document.getElementById('nav-avatar');
        const navUsername = document.getElementById('nav-username');
        if (navAvatar) navAvatar.textContent = initial;
        if (navUsername) navUsername.textContent = user.username;
        console.log('Nav updated');
        
        // Welcome section
        const dashUsername = document.getElementById('dash-username');
        if (dashUsername) dashUsername.textContent = user.username;
        console.log('Welcome text updated');
        
        // Profile card
        const dashAvatarLg = document.getElementById('dash-avatar-lg');
        const detailUsername = document.getElementById('detail-username');
        const detailEmail = document.getElementById('detail-email');
        const detailMobile = document.getElementById('detail-mobile');
        
        if (dashAvatarLg) dashAvatarLg.textContent = initial;
        if (detailUsername) detailUsername.textContent = user.username;
        if (detailEmail) detailEmail.textContent = user.email;
        if (detailMobile) detailMobile.textContent = user.mobile_no;
        console.log('Profile details updated');

        // Session info
        const sessionTime = document.getElementById('session-time');
        const sessionExpiry = document.getElementById('session-expiry');
        if (sessionTime) sessionTime.textContent = 'Just now';
        if (sessionExpiry) sessionExpiry.textContent = '30 minutes';
        console.log('Session info updated');

        // Time display
        updateDashTime();
        setInterval(updateDashTime, 60000);

        // Start session countdown timer
        startSessionTimer();

        // Switch views
        const authView = document.getElementById('auth-view');
        const dashView = document.getElementById('dashboard-view');
        if (authView) authView.classList.remove('active');
        if (dashView) dashView.classList.add('active');
        console.log('Views switched to dashboard');

    } catch (err) {
        console.error('Dashboard error:', err);
        showToast('Session expired. Please login again.', 'error');
    }
}



// ===== Session Timer Management =====
let sessionTimerInterval = null;
let sessionEndTime = null;
const SESSION_DURATION_MINUTES = 30;

function formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function updateSessionTimer() {
    if (!sessionEndTime) return;
    
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((sessionEndTime - now) / 1000));
    
    const timerElement = document.getElementById('session-countdown');
    const timerContainer = timerElement?.parentElement;
    
    if (timerElement) {
        timerElement.textContent = formatTimeRemaining(timeRemaining);
    }
    
    // Update timer state based on remaining time
    if (timerContainer) {
        timerContainer.classList.remove('warning', 'critical');
        if (timeRemaining <= 0) {
            // Session expired - auto logout
            handleLogout();
            if (sessionTimerInterval) clearInterval(sessionTimerInterval);
        } else if (timeRemaining <= 300) {
            // Less than 5 minutes - critical warning
            timerContainer.classList.add('critical');
        } else if (timeRemaining <= 600) {
            // Less than 10 minutes - warning
            timerContainer.classList.add('warning');
        }
    }
}

function startSessionTimer() {
    // Clear any existing timer
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    
    // Set session end time to 30 minutes from now
    sessionEndTime = Date.now() + (SESSION_DURATION_MINUTES * 60 * 1000);
    
    // Update immediately
    updateSessionTimer();
    
    // Update every second
    sessionTimerInterval = setInterval(updateSessionTimer, 1000);
}

function stopSessionTimer() {
    if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
    }
    sessionEndTime = null;
}

function updateDashTime() {
    const now = new Date();
    const dashTimeElement = document.getElementById('dash-time');
    if (dashTimeElement) {
        dashTimeElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ===== Logout Handler =====
async function handleLogout() {
    try {
        // Stop session timer
        stopSessionTimer();

        const res = await fetch(`${API_BASE}/log-out`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Logout failed');

        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        document.querySelectorAll('.strength-bar').forEach(b => b.className = 'strength-bar');
        document.querySelector('.strength-text').textContent = '';

        // Switch views
        document.getElementById('dashboard-view').classList.remove('active');
        document.getElementById('auth-view').classList.add('active');

        // Reset to login tab
        switchTab('login');

        showToast('Logged out successfully', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Initialize Page =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
    console.log('API_BASE:', API_BASE);
    
    // Verify all dashboard elements exist
    const dashboardElements = [
        'nav-avatar', 'nav-username', 'dash-username', 'dash-avatar-lg',
        'detail-username', 'detail-email', 'detail-mobile',
        'session-time', 'session-expiry', 'dash-time',
        'auth-view', 'dashboard-view'
    ];
    
    const missingElements = dashboardElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.warn('Missing elements:', missingElements);
    } else {
        console.log('All dashboard elements found!');
    }
});

// Debug function - call from console to test
window.debugDashboard = async function() {
    console.log('=== DEBUG DASHBOARD ===');
    try {
        const res = await fetch(`${API_BASE}/verify`, { credentials: 'include' });
        console.log('Response status:', res.status);
        const user = await res.json();
        console.log('User data:', user);
        
        // Check elements
        console.log('dash-avatar-lg element:', document.getElementById('dash-avatar-lg'));
        console.log('detail-username element:', document.getElementById('detail-username'));
        console.log('detail-email element:', document.getElementById('detail-email'));
        console.log('detail-mobile element:', document.getElementById('detail-mobile'));
        
        return user;
    } catch(e) {
        console.error('Error:', e);
    }
};


