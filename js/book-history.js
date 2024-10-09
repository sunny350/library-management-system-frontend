document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_API = 'https://library-management-system-infm.onrender.com';
    // const BACKEND_API = 'http://localhost:5000';
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
        const bookContent = document.getElementById('historyBooksContent');

        try {
            const response = await fetch(`${BACKEND_API}/api/history`, {
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
                <h4>Returned Books</h4>
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
                        </div>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

        } catch (error) {
            console.error('Error:', error);
            bookContent.innerHTML = '<p class="alert alert-danger">Failed to load books. Please try again later.</p>';
        }
    };

    renderSidebar();
    renderBookContent();
});
