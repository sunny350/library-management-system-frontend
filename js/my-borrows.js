document.addEventListener('DOMContentLoaded', async () => {
    // const BACKEND_API = 'http://localhost:5000';
    const BACKEND_API = 'https://library-management-system-infm.onrender.com';
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    const redirectToLogin = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'index.html';
    };

    if (!token || !role) {
        redirectToLogin();
    }

    const handleApiResponse = (response) => {
        if (response.status === 401 || response.status === 403 || response.status === 400) {
            redirectToLogin();
            throw new Error('Invalid token');
        }
    };

    const renderSidebar = () => {
        const sidebarItems = {
            MEMBER: [
                { text: 'Books', link: 'books.html', icon: 'fas fa-book' },
                { text: 'My Borrows', link: 'my-borrows.html', icon: 'fas fa-bookmark' },
                { text: 'History of Books', link: 'book-history.html', icon: 'fas fa-history' }
            ],
            LIBRARIAN: [
                { text: 'Books', link: 'books.html', icon: 'fas fa-book' },
                { text: 'Users', link: 'users.html', icon: 'fas fa-users' },
            ],
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

    const renderBookContent = async () => {
        const bookContent = document.getElementById('borrowedBooksContent');

        try {
            const response = await fetch(`${BACKEND_API}/api/get/borrowed-books`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            handleApiResponse(response);

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
                return;
            }
            let books = await response.json();
            books = books.data;

            bookContent.innerHTML = `
                <h4>Borrowed Books</h4>
                <div id="bookList" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
            `;
            const bookList = document.getElementById('bookList');

            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('col');
                const isAvailable = book.status === "AVAILABLE";
                const isBorrowed = book.status === "BORROWED"; // Adjusted logic for borrowed status

                bookItem.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <h6 class="card-text">Author: ${book.author}</h6>
                            <p class="card-text">Status: ${isAvailable ? '<span clas: s="badge bg-success">Available</span>' : '<span class="badge bg-danger">Borrowed By You</span>'}</p>
                            ${role === 'MEMBER' && isBorrowed ? `
                                <button class="btn btn-primary return-btn" data-id="${book._id}">
                                    <i class="fas fa-undo"></i> Return
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

            if (role === 'MEMBER') {
                document.querySelectorAll('.return-btn').forEach(button => {
                    button.addEventListener('click', handleReturn);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            bookContent.innerHTML = '<p class="alert alert-danger">Failed to load books. Please try again later.</p>';
        }
    };

    const handleReturn = async (e) => {
        const bookId = e.target.getAttribute('data-id');
        try {
            const returnResponse = await fetch(`${BACKEND_API}/api/return/${bookId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            handleApiResponse(returnResponse);
            if (!returnResponse.ok) {
                const errorData = await returnResponse.json(); 
                alert(`Error: ${errorData.error}`);
                return;
            }

            // Hide the return button and update the UI to reflect the return
            e.target.style.display = 'none';
            const statusBadge = e.target.closest('.card-body').querySelector('.card-text span');
            statusBadge.classList.remove('bg-danger');
            statusBadge.classList.add('bg-success');
            statusBadge.textContent = 'Available';
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Ohh something went wrong. Please try again later.');
        }
    };

    renderSidebar();
    renderBookContent();
});
