const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const exist = (username) => {
  return users.map(
    (user) => user.username
  ).includes(username);
}

const authenticate = (username,password) => {
  return users.filter(
    (user) => user.username === username && user.password === password
  ).length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(username && password) {
    if (authenticate(username,password)) {
      const accessToken = jwt.sign(
        {data: password,}, 'access', {expiresIn: 60*60}
      );
      req.session.authorization = {accessToken, username};
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  } else {
    return res.status(404).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; 
  const book = books[isbn];
  if (book) {
    book.reviews[username] = req.body.review;
    res.send("Review added!");
  } else {
    return res.status(404).json({message: "There is no book with your isbn"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req,res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const book = books[isbn];
  if (book) {
    if (book.reviews[username]) {
      delete book.reviews[username];
      res.send("Review deleted!");
    }
    else {
      return res.status(404).json({message: "You have no review"});  
    }
  } else {
    return res.status(404).json({message: "There is no book with your isbn"});
  }
});

module.exports.authenticated = regd_users;
module.exports.existUser = exist;
module.exports.users = users;
