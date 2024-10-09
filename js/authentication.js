document.addEventListener('DOMContentLoaded', () => {
    // const BACKEND_API = 'https://library-management-system-infm.onrender.com';
    const BACKEND_API = 'http://localhost:5000';
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    function showMessage(elementId, message, isError = false) {
        const messageElement = document.getElementById(elementId);
        messageElement.innerText = message;
        messageElement.classList.remove('alert-success', 'alert-danger');
        messageElement.classList.add(isError ? 'alert-danger' : 'alert-success');
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${BACKEND_API}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('loginMessage', 'Login successful!');
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('role', data.data.role);
                    setTimeout(() => {
                        window.location.href = 'books.html';
                    }, 1000);
                } else {
                    showMessage('loginMessage', data.message || 'Login failed', true);
                }
            } catch (error) {
                showMessage('loginMessage', 'An error occurred. Please try again later.', true);
                console.error("Error:", error);
            }

            document.getElementById('username').value = "";
            document.getElementById('password').value = "";
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            try {
                const response = await fetch(`${BACKEND_API}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, role }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('signupMessage', 'Account created successfully!');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showMessage('signupMessage', data.message || 'Signup failed', true);
                }
            } catch (error) {
                showMessage('signupMessage', 'An error occurred. Please try again later.', true);
                console.error("Error:", error);
            }
        });
    }
});
