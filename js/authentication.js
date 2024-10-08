document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_API = 'https://755e-27-96-89-255.ngrok-free.app'
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        try {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
    
                const response = await fetch(`${BACKEND_API}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
    
                const data = await response.json();
                console.log(data)
    
                if (response.ok) {
                    document.getElementById('loginMessage').innerText = 'Login successful!';
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('role', data.data.role);
                    window.location.href = 'books.html';
                } else {
                    document.getElementById('loginMessage').innerText = data.message;
                }
                document.getElementById('username').value = ""
                document.getElementById('password').value = ""
            })
        } catch (error) {
            console.log("error: " + error.message)
        }
    };
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            const response = await fetch(`${BACKEND_API}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('signupMessage').innerText = 'Account created!';
                window.location.href = 'index.html';
            } else {
                document.getElementById('signupMessage').innerText = data.message;
            }
        });
    }
});