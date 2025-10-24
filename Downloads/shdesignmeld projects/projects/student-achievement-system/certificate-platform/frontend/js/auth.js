// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const data = await app.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      app.setToken(data.token);
      app.setUser(data.user);
      app.showAlert('Login successful!', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      app.showAlert(error.message, 'error');
    }
  });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const data = await app.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      app.setToken(data.token);
      app.setUser(data.user);
      app.showAlert('Registration successful!', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      app.showAlert(error.message, 'error');
    }
  });
}

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    app.removeToken();
    app.removeUser();
    window.location.href = 'index.html';
  });
}

// Display user info
const userDisplay = document.getElementById('userDisplay');
if (userDisplay) {
  const user = app.getUser();
  if (user) {
    userDisplay.textContent = user.username;
  }
}