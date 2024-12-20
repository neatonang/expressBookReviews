const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});



// Fetch the books using async/await
public_users.get('/', async function (req, res) {
    try {
        // Simulate fetching the books with a Promise
        const fetchBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books); // Resolve the promise with the books object
                } else {
                    reject(new Error("Books data not available"));
                }
            });
        };

        const bookList = await fetchBooks(); // Await the result of the Promise
        return res.status(200).json(bookList); // Respond with the books data
    } catch (error) {
        console.error("Error fetching books:", error.message);
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Simulate fetching the book details with a Promise
        const fetchBookDetails = (isbn) => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]); // Resolve with book details
                } else {
                    reject(new Error(`Book with ISBN ${isbn} not found`));
                }
            });
        };

        const bookDetails = await fetchBookDetails(isbn); // Await the Promise
        return res.status(200).json(bookDetails); // Respond with book details
    } catch (error) {
        console.error("Error fetching book details:", error.message);
        return res.status(404).json({ message: error.message });
    }
});

// Get book details based on Author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // Simulate fetching the book details with a Promise
        const fetchBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const matchingBooks = Object.values(books).filter(book => 
                    book.author.toLowerCase() === author.toLowerCase()
                );
                if (matchingBooks.length > 0) {
                    resolve(matchingBooks); // Resolve with the list of books
                } else {
                    reject(new Error(`No books found for author ${author}`));
                }
            });
        };

        const bookList = await fetchBooksByAuthor(author); // Await the Promise
        return res.status(200).json(bookList); // Respond with the books
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        return res.status(404).json({ message: error.message });
    }
});


// Get book details based on Title using async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        // Simulate fetching the book details with a Promise
        const fetchBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const matchingBooks = Object.values(books).filter(book => 
                    book.title.toLowerCase() === title.toLowerCase()
                );
                if (matchingBooks.length > 0) {
                    resolve(matchingBooks); // Resolve with the list of books
                } else {
                    reject(new Error(`No books found with title "${title}"`));
                }
            });
        };

        const bookList = await fetchBooksByTitle(title); // Await the Promise
        return res.status(200).json(bookList); // Respond with the books
    } catch (error) {
        console.error("Error fetching books by title:", error.message);
        return res.status(404).json({ message: error.message });
    }
});



// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Check if the book exists for the given ISBN
    const book = books[isbn];
    if (book) {
        // If the book exists, return the reviews
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        // If the book does not exist, respond with a 404 status
        return res.status(404).json({ message: "No reviews found for the given ISBN" });
    }
});





module.exports.general = public_users;
