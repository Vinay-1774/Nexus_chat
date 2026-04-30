// ===== Configuration =====
// Auto-detect: if served by FastAPI on port 8000, use same origin; otherwise fallback
const API_BASE = window.location.port === '8000'
    ? window.location.origin
    : 'http://127.0.0.1:8000';

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

        const res = await fetch(`${API_BASE}/Login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('login_time', new Date().toISOString());
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
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Session expired');
        const user = await res.json();

        // Populate dashboard
        const initial = user.username.charAt(0).toUpperCase();
        document.getElementById('nav-avatar').textContent = initial;
        document.getElementById('nav-username').textContent = user.username;
        document.getElementById('dash-username').textContent = user.username;
        document.getElementById('dash-avatar-lg').textContent = initial;
        document.getElementById('detail-username').textContent = user.username;
        document.getElementById('detail-email').textContent = user.email;
        document.getElementById('detail-mobile').textContent = user.mobile_no;

        // Session info
        const loginTime = localStorage.getItem('login_time');
        document.getElementById('session-time').textContent = loginTime
            ? new Date(loginTime).toLocaleTimeString() : 'Just now';
        document.getElementById('session-expiry').textContent = '30 minutes';

        // Time display
        updateDashTime();
        setInterval(updateDashTime, 60000);

        // Switch views
        document.getElementById('auth-view').classList.remove('active');
        document.getElementById('dashboard-view').classList.add('active');

        loadUsers();
    } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('login_time');
        showToast('Session expired. Please login again.', 'error');
    }
}

function updateDashTime() {
    const now = new Date();
    document.getElementById('dash-time').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ===== Load Users =====
async function loadUsers() {
    const token = localStorage.getItem('access_token');
    const container = document.getElementById('users-list');
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading users...</span></div>';

    try {
        const res = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load users');
        const users = await res.json();

        if (users.length === 0) {
            container.innerHTML = '<div class="empty-state">No users found</div>';
            return;
        }

        const colors = ['#818cf8', '#c084fc', '#38bdf8', '#34d399', '#fbbf24', '#f87171'];
        container.innerHTML = users.map((u, i) => `
            <div class="user-row">
                <div class="avatar" style="background:${colors[i % colors.length]}">${u.username.charAt(0).toUpperCase()}</div>
                <div class="user-row-info">
                    <div class="user-row-name">${u.username}</div>
                    <div class="user-row-email">${u.email}</div>
                </div>
                <span class="user-row-id">#${u.id}</span>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<div class="empty-state">Could not load users</div>';
    }
}

// ===== Logout =====
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('login_time');
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('auth-view').classList.add('active');
    document.getElementById('login-form').reset();
    showToast('Logged out successfully', 'success');
}

// ===== Auto-login if token exists =====
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (token) showDashboard();
});
