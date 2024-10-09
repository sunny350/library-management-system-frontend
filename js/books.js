document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_API = 'https://library-management-system-infm.onrender.com';
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    const renderSidebar = () => {
        const sidebarItems = {
            MEMBER: [
                { text: 'Books', link: 'books.html', icon: 'fas fa-book' },
                { text: 'My Borrows', link: 'my-borrows.html', icon: 'fas fa-bookmark' },
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
        const bookContent = document.getElementById('bookContent');
        const addBookBtn = document.getElementById('addBookBtn');

        try {
            const response = await fetch(`${BACKEND_API}/api/books`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }

            let books = await response.json();
            books = books.data;

            bookContent.innerHTML = `
                <h4>Available Books</h4>
                <div id="bookList" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
            `;
            const bookList = document.getElementById('bookList');

            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('col');
                bookItem.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">by ${book.author}</h6>
                            <p class="card-text">Status: ${book.status === "AVAILABLE" ? '<span class="badge bg-success">Available</span>' : '<span class="badge bg-danger">Not Available</span>'}</p>
                            ${role === 'MEMBER' ? `
                                <button class="btn btn-primary borrow-btn" data-id="${book._id}">
                                    <i class="fas fa-hand-holding"></i> Borrow
                                </button>
                                <button class="btn btn-secondary return-btn" data-id="${book._id}" style="display:none;">
                                    <i class="fas fa-undo"></i> Return
                                </button>
                                <div class="borrowed-status mt-2" style="display:none;">You have borrowed this book.</div>
                            ` : `
                                <button class="btn btn-danger delete-btn" data-id="${book._id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                                <button class="btn btn-info edit-btn" data-id="${book._id}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            `}
                        </div>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

            // Add event listeners for borrow, return, delete, and edit buttons
            if (role === 'MEMBER') {
                document.querySelectorAll('.borrow-btn').forEach(button => {
                    button.addEventListener('click', handleBorrow);
                });

                document.querySelectorAll('.return-btn').forEach(button => {
                    button.addEventListener('click', handleReturn);
                });
            } else if (role === 'LIBRARIAN') {
                addBookBtn.style.display = 'block';

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', handleDelete);
                });

                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', handleEdit);
                });

                document.getElementById('addBookBtn').addEventListener('click', () => {
                    $('#addBookModal').modal('show');
                });

                document.getElementById('saveNewBook').addEventListener('click', handleAddBook);
            }
        } catch (error) {
            bookContent.innerHTML = '<p class="alert alert-danger">Failed to load books. Please try again later.</p>';
            console.error('Error:', error);
        }
    };

    const handleBorrow = async (e) => {
        const bookId = e.target.getAttribute('data-id');
        try {
            const borrowResponse = await fetch(`${BACKEND_API}/api/borrow/${bookId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (borrowResponse.ok) {
                e.target.style.display = 'none';
                const returnButton = e.target.nextElementSibling;
                returnButton.style.display = 'inline-block';
                const borrowedStatus = e.target.parentElement.querySelector('.borrowed-status');
                borrowedStatus.style.display = 'block';
            }
        } catch (error) {
            console.error('Error borrowing book:', error);
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

            if (returnResponse.ok) {
                e.target.style.display = 'none';
                const borrowButton = e.target.previousElementSibling;
                borrowButton.style.display = 'inline-block';
                const borrowedStatus = e.target.parentElement.querySelector('.borrowed-status');
                borrowedStatus.style.display = 'none';
            }
        } catch (error) {
            console.error('Error returning book:', error);
        }
    };

    const handleDelete = async (e) => {
        const bookId = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                const deleteResponse = await fetch(`${BACKEND_API}/api/books/${bookId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (deleteResponse.ok) {
                    e.target.closest('.col').remove();
                }
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    };

    const handleEdit = async (e) => {
        const bookId = e.target.getAttribute('data-id');
        try {
            const response = await fetch(`${BACKEND_API}/api/books/${bookId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                let book = await response.json();
                book = book.data;

                document.getElementById('bookTitle').value = book.title;
                document.getElementById('bookAuthor').value = book.author;

                $('#editBookModal').modal('show');

                document.getElementById('saveBookChanges').onclick = async () => {
                    const updatedTitle = document.getElementById('bookTitle').value;
                    const updatedAuthor = document.getElementById('bookAuthor').value;

                    const updateResponse = await fetch(`${BACKEND_API}/api/books/${bookId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: updatedTitle,
                            author: updatedAuthor
                        })
                    });

                    if (updateResponse.ok) {
                        $('#editBookModal').modal('hide');
                        renderBookContent();
                    } else {
                        alert("Failed to update the book. Please try again.");
                    }
                };
            } else {
                alert("Failed to load book details.");
            }
        } catch (error) {
            console.error('Error editing book:', error);
        }
    };

    const handleAddBook = async () => {
        const newBookTitle = document.getElementById('newBookTitle').value;
        const newBookAuthor = document.getElementById('newBookAuthor').value;

        try {
            const createBookResponse = await fetch(`${BACKEND_API}/api/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newBookTitle,
                    author: newBookAuthor
                })
            });

            if (createBookResponse.ok) {
                $('#addBookModal').modal('hide');
                renderBookContent();
            } else {
                alert("Failed to add the book. Please try again.");
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert("Failed to add the book. Please try again.");
        }
    };

    renderSidebar();
    renderBookContent();
});