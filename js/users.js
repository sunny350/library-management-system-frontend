document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_API = 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (role !== 'LIBRARIAN') {
        alert('You are not authorized to access this page.');
        window.location.href = 'books.html'; 
    }

    const renderSidebar = () => {
        const sidebarItems = {
            LIBRARIAN: [
                { text: 'Books', link: 'books.html', icon: 'fas fa-book' },
                { text: 'Users', link: 'users.html', icon: 'fas fa-users' },
            ],
            MEMBER: [
                { text: 'Books', link: 'books.html', icon: 'fas fa-book' },
                { text: 'My Borrows', link: 'my-borrows.html', icon: 'fas fa-bookmark' },
            ]
        };

        const sidebar = document.getElementById('sidebarItems');
        sidebar.innerHTML = '';

        if (role && sidebarItems[role]) {
            sidebarItems[role].forEach(item => {
                const li = document.createElement('li');
                li.classList.add('nav-item');
                const isActive = window.location.href.includes(item.link);
                li.innerHTML = `
                    <a class="nav-link ${isActive ? 'active' : ''}" href="${item.link}">
                        <i class="${item.icon}"></i>
                        ${item.text}
                    </a>
                `;
                sidebar.appendChild(li);
            });
        }
    };
    const renderUserContent = async () => {
        const userContent = document.getElementById('userContent');
        
        const response = await fetch(`${BACKEND_API}/api/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let users = await response.json();
        users = users.data;

        if (response.ok) {
            userContent.innerHTML = '<h4>Users</h4><div id="userList"></div>';
            const userList = document.getElementById('userList');

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item', 'mb-3', 'p-3', 'border', 'rounded');
                userItem.innerHTML = `
                    <h5>${user.username}</h5>
                    <p>Role: ${user.role}</p>
                    <button class="btn btn-danger delete-btn" data-id="${user._id}">Delete</button>
                    <button class="btn btn-info edit-btn" data-id="${user._id}">Edit</button>
                `;
                userList.appendChild(userItem);
            });

            // Delete user
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    if (confirm('Are you sure you want to delete this user?')) {
                        try {
                            const userId = e.target.getAttribute('data-id');
                            const deleteResponse = await fetch(`${BACKEND_API}/api/users/${userId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
        
                            if (deleteResponse.ok) {
                                e.target.parentElement.remove(); // Remove user from list
                            }                          
                        } catch (error) {
                            alert('unable to delete user.')
                            console.log(`unable to delete user ${error.message}`)
                        }
                    }
                });
            });

            // Edit user
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.getAttribute('data-id');

                    // Fetch user details
                    const response = await fetch(`${BACKEND_API}/api/users/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        let user = await response.json();
                        user = user.data;

                        document.getElementById('editUserName').value = user.username;
                        document.getElementById('editUserRole').value = user.role;
                        document.getElementById('editUserCurrentPassword').value = ''; 
                        document.getElementById('editUserNewPassword').value = ''; 

                        // Show edit modal
                        $('#editUserModal').modal('show');

                        // Save changes
                        document.getElementById('saveUserChanges').addEventListener('click', async () => {
                            const updatedName = document.getElementById('editUserName').value;
                            const updatedRole = document.getElementById('editUserRole').value;
                            const currentPassword = document.getElementById('editUserCurrentPassword').value;
                            const newPassword = document.getElementById('editUserNewPassword').value;

                            const updatePayload = {
                                username: updatedName,
                                role: updatedRole
                            };
            
                            // Include current and new passwords only if they are provided
                            if (currentPassword && newPassword) {
                                updatePayload.currentPassword = currentPassword;
                                updatePayload.newPassword = newPassword;
                            }

                            const updateResponse = await fetch(`${BACKEND_API}/api/users/${userId}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updatePayload)
                            });

                            if (updateResponse.ok) {
                                $('#editUserModal').modal('hide');
                                renderUserContent(); // Refresh user list
                            } else {
                                alert("Failed to update user.");
                            }
                        }, { once: true });
                    }
                });
            });
        } else {
            userContent.innerHTML = `<p>Error fetching users: ${users.message}</p>`;
        }
    };

    renderSidebar();
    renderUserContent();

    // Add user
    document.getElementById('addUserBtn').addEventListener('click', () => {
        $('#addUserModal').modal('show');
    });

    document.getElementById('saveNewUser').addEventListener('click', async () => {
        const newUserName = document.getElementById('newUserName').value;
        const newUserRole = document.getElementById('newUserRole').value;
        const newUserPassword = document.getElementById('newUserPassword').value;


        const response = await fetch(`${BACKEND_API}/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: newUserName,
                role: newUserRole,
                password: newUserPassword
            })
        });

        if (response.ok) {
            $('#addUserModal').modal('hide');
            renderUserContent(); // Refresh user list
        } else {
            alert("Failed to add user.");
        }
    });
});
