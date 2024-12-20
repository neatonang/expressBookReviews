const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use("/customer", session({ 
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true 
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    // Verify the token using the secret key
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            console.log("Token Verification Error:", err);
            return res.status(403).json({ message: "Invalid or expired access token" });
        }

        // Attach the username to the request object
        req.user = decoded.username;
        next();
    });
});

const PORT = 5000;

// Define routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
