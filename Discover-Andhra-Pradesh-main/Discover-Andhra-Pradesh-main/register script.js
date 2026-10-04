const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');
const overlay = document.querySelector('.user-type-overlay');

const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Toggle between login and register forms
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
}

// Handle login form submission with Backend API
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginError) loginError.style.display = 'none';

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, username: username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (loginError) {
                    loginError.textContent = data.error || 'Login failed';
                    loginError.style.display = 'block';
                } else {
                    alert(data.error || 'Login failed');
                }
                return;
            }

            // Save token and user details to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userType', data.user.user_type || 'explorer');

            // Redirect to main tourism portal
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Login error:', err);
            if (loginError) {
                loginError.textContent = 'Server connection error. Please try again.';
                loginError.style.display = 'block';
            }
        }
    });
}

// Pending registered user state before persona selection
let pendingRegistration = null;
let pendingSocialProvider = null;

// Handle register form submission with Backend API
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (registerError) registerError.style.display = 'none';

        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        pendingRegistration = { username, email, password };
        showUserTypeOverlay();
    });
}

// Handle Social Login Clicks (Google, Facebook, GitHub, LinkedIn)
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = button.getAttribute('data-provider') || 'Google';
        pendingSocialProvider = provider;
        showUserTypeOverlay();
    });
});

function showUserTypeOverlay() {
    if (overlay) overlay.style.display = 'flex';
}

// Handle user type selection and complete registration / social login
document.querySelectorAll('.user-type-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const userType = button.getAttribute('data-type');
        localStorage.setItem('userType', userType);

        // Social Login Flow
        if (pendingSocialProvider) {
            try {
                const res = await fetch('/api/auth/social', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: pendingSocialProvider,
                        user_type: userType
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                    return;
                } else {
                    alert(data.error || 'Social login failed');
                }
            } catch (err) {
                console.error('Social login error:', err);
                alert('Server connection error during social login.');
            }
        }

        // Standard Email/Password Register Flow
        if (pendingRegistration) {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: pendingRegistration.username,
                        email: pendingRegistration.email,
                        password: pendingRegistration.password,
                        user_type: userType
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    if (overlay) overlay.style.display = 'none';
                    if (registerError) {
                        registerError.textContent = data.error || 'Registration failed';
                        registerError.style.display = 'block';
                    } else {
                        alert(data.error || 'Registration failed');
                    }
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
                return;
            } catch (err) {
                console.error('Registration API error:', err);
                alert('Server connection error during registration.');
            }
        }

        window.location.href = 'index.html';
    });
});

// --- Forgot Password Modal Logic ---
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordOverlay = document.getElementById('forgotPasswordOverlay');
const closeForgotModal = document.getElementById('closeForgotModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotMsg = document.getElementById('forgotMsg');

if (forgotPasswordLink && forgotPasswordOverlay) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordOverlay.style.display = 'flex';
        if (forgotMsg) forgotMsg.style.display = 'none';
        if (forgotPasswordForm) forgotPasswordForm.reset();

        // Pre-fill username/email if already typed in login
        const existingLoginInput = document.getElementById('loginUsername')?.value;
        const forgotInput = document.getElementById('forgotIdentifier');
        if (existingLoginInput && forgotInput) {
            forgotInput.value = existingLoginInput;
        }
    });
}

if (closeForgotModal && forgotPasswordOverlay) {
    closeForgotModal.addEventListener('click', () => {
        forgotPasswordOverlay.style.display = 'none';
    });
}

// Close when clicking outside modal
window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordOverlay) {
        forgotPasswordOverlay.style.display = 'none';
    }
});

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (forgotMsg) forgotMsg.style.display = 'none';

        const identifier = document.getElementById('forgotIdentifier').value.trim();
        const newPassword = document.getElementById('forgotNewPassword').value;
        const confirmPassword = document.getElementById('forgotConfirmPassword').value;

        if (newPassword !== confirmPassword) {
            forgotMsg.textContent = 'Passwords do not match.';
            forgotMsg.style.background = '#ffebee';
            forgotMsg.style.color = '#c62828';
            forgotMsg.style.display = 'block';
            return;
        }

        if (newPassword.length < 4) {
            forgotMsg.textContent = 'Password must be at least 4 characters.';
            forgotMsg.style.background = '#ffebee';
            forgotMsg.style.color = '#c62828';
            forgotMsg.style.display = 'block';
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: identifier, username: identifier, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                forgotMsg.textContent = data.error || 'Failed to reset password.';
                forgotMsg.style.background = '#ffebee';
                forgotMsg.style.color = '#c62828';
                forgotMsg.style.display = 'block';
                return;
            }

            forgotMsg.textContent = '✅ ' + (data.message || 'Password reset successful!');
            forgotMsg.style.background = '#e8f5e9';
            forgotMsg.style.color = '#2e7d32';
            forgotMsg.style.display = 'block';

            // Auto-fill in login form
            const loginUsername = document.getElementById('loginUsername');
            if (loginUsername) loginUsername.value = data.username || identifier;
            const loginPassword = document.getElementById('loginPassword');
            if (loginPassword) loginPassword.value = newPassword;

            setTimeout(() => {
                if (forgotPasswordOverlay) forgotPasswordOverlay.style.display = 'none';
            }, 1800);
        } catch (err) {
            console.error('Password reset error:', err);
            forgotMsg.textContent = 'Server connection error. Please try again.';
            forgotMsg.style.background = '#ffebee';
            forgotMsg.style.color = '#c62828';
            forgotMsg.style.display = 'block';
        }
    });
}