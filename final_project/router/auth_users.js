const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Register new users (handled in general.js)

// Login a registered user
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    return res.status(200).json({ message: "User logged in successfully", token: accessToken });
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.query;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    const username = req.user; // Use username from the token
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in to post a review" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} added/updated successfully`,
        reviews: book.reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Ensure the user is authenticated
    const username = req.user; // Extracted from the token in middleware
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in to delete a review" });
    }

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Check if the review exists for this user
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user to delete" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({
        message: `Review by ${username} for book with ISBN ${isbn} deleted successfully`,
        reviews: book.reviews // Return remaining reviews
    });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
