document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_API = 'http://localhost:5000';
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token'); // Assuming you store the token in localStorage

    const renderSidebar = () => {
        const sidebarItems = {
            MEMBER: [
                { text: 'Books', link: 'books.html' },
            ],
            LIBRARIAN: [
                { text: 'Books', link: 'books.html' },
                { text: 'Users', link: 'users.html' },

            ],
        };

        const sidebar = document.getElementById('sidebarItems');
        sidebar.innerHTML = ''; // Clear previous items

        if (role && sidebarItems[role]) {
            sidebarItems[role].forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${item.link}">${item.text}</a>`;
                sidebar.appendChild(li);
            });
        }
    };

    const renderBookContent = async () => {
        const bookContent = document.getElementById('bookContent');
        const addBookBtn = document.getElementById('addBookBtn');
        // Fetch all books with bearer token
        const response = await fetch(`${BACKEND_API}/api/books`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Add the bearer token here
                'Content-Type': 'application/json'
            }
        });

        console.log(response)

        let books = await response.json();
        books = books.data

        if (response.ok) {
            bookContent.innerHTML = '<h4>Available Books</h4><div id="bookList"></div>';
            const bookList = document.getElementById('bookList');

            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item', 'mb-3', 'p-3', 'border', 'rounded');
                bookItem.innerHTML = `
                    <h5>${book.title} by ${book.author}</h5>
                    <p>Status: ${book.status=== "AVAILABLE" ? 'Available' : 'Not Available'}</p>
                    ${role === 'MEMBER' ? `
                        <button class="btn btn-primary borrow-btn" data-id="${book._id}">Borrow</button>
                        <button class="btn btn-secondary return-btn" data-id="${book._id}" style="display:none;">Return</button>
                        <div class="borrowed-status" style="display:none;">You have borrowed this book.</div>
                    ` : `
                        <button class="btn btn-danger delete-btn" data-id="${book._id}">Delete</button>
                        <button class="btn btn-info edit-btn" data-id="${book._id}">Edit</button>
                    `}
                `;
                bookList.appendChild(bookItem);
            });

            // Add event listeners for borrow, return, delete, and edit buttons
            if (role === 'MEMBER') {
                document.querySelectorAll('.borrow-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const bookId = e.target.getAttribute('data-id');
                        const borrowResponse = await fetch(`${BACKEND_API}/api/borrow/${bookId}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`, // Add the bearer token here
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
                    });
                });

                document.querySelectorAll('.return-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const bookId = e.target.getAttribute('data-id');
                        const returnResponse = await fetch(`${BACKEND_API}/api/return/${bookId}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`, // Add the bearer token here
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
                    });
                });
            } else if (role === 'LIBRARIAN') {
                addBookBtn.style.display = 'block';

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const bookId = e.target.getAttribute('data-id');
                        console.log("bokId",bookId)
                        const deleteResponse = await fetch(`${BACKEND_API}/api/books/${bookId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`, // Add the bearer token here
                                'Content-Type': 'application/json'
                            }
                        });

                        if (deleteResponse.ok) {
                            e.target.parentElement.remove(); // Remove the book from the list
                        }
                    });
                });

                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const bookId = e.target.getAttribute('data-id');
                        
                        // Fetch book details
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

                            // Pre-fill the modal inputs with book data
                            document.getElementById('bookTitle').value = book.title;
                            document.getElementById('bookAuthor').value = book.author;
                
                            // Show the modal
                            $('#editBookModal').modal('show'); // Use Bootstrap's modal method
                
                            // Add event listener for saving changes
                            document.getElementById('saveBookChanges').addEventListener('click', async () => {

                                const updatedTitle = document.getElementById('bookTitle').value;
                                const updatedAuthor = document.getElementById('bookAuthor').value;
                
                                // Update book details with PUT request
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
                                    // Close the modal and refresh the book list
                                    $('#editBookModal').modal('hide');
                                    renderBookContent(); // Refresh book list
                                } else {
                                    alert("Failed to update the book. Please try again.");
                                }
                            }, { once: true }); // Use { once: true } to ensure only one event listener is added
                        } else {
                            alert("Failed to load book details.");
                        }
                    });
                });

                document.getElementById('addBookBtn').addEventListener('click', () => {
                    $('#addBookModal').modal('show'); // Show the Add Book Modal
                });

                document.getElementById('saveNewBook').addEventListener('click', async () => {
                    const newBookTitle = document.getElementById('newBookTitle').value;
                    const newBookAuthor = document.getElementById('newBookAuthor').value;
            
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
                        renderBookContent(); // Refresh book list after adding a new book
                    } else {
                        alert("Failed to add the book. Please try again.");
                        $('#addBookModal').modal('hide');
                    }
                });
            
            }
        } else {
            bookContent.innerHTML = '<p>Failed to load books. Please try again later.</p>';
        }
    };

    renderSidebar(); // Render sidebar
    renderBookContent(); // Render content based on role
});
