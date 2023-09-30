const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let exist = require("./auth_users.js").existUser;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(username && password){
    if (!exist(username)) { 
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registred! Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } else {
    return res.status(404).json({message: "Unable to register user with that username and password."});
  }
});

const getBooks = async ({isbn,author,title}) => {
  try {
    let target;
    if(isbn) target = books[isbn];
    else if (author) {
      target = [];
      for(no in books) {
        const book = books[no];
        if(book.author === author) target.push(book);
      }
    } else if (title) {
      target = [];
      for(id in books) {
        const book = books[id];
        if(book.title === title) target.push(book);
      }
    } else
     target = books;
	const res = await Promise.resolve(target)
    
	if (res) {
	  return res;
	} else {
	  return Promise.reject(new Error('No books found.'));
	}
  } catch (err) {
	console.log(err);
  }
}

// Get the book list available in the shop
public_users.get('/', async (req,res) => {
  const data = await getBooks({});
  res.send(JSON.stringify(data,null,2));
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req,res) => {
  const isbn = req.params.isbn;
  const data = await getBooks({isbn});
  res.send(JSON.stringify(data,null,2));
});
  
// Get book details based on author
public_users.get('/author/:author', async (req,res) => {
  const author = req.params.author;
  const data = await getBooks({author});
  res.send(JSON.stringify(data,null,2));
});

// Get all books based on title
public_users.get('/title/:title', async (req,res)=>{
  const title = req.params.title;
  const data = await getBooks({title});
  res.send(JSON.stringify(data,null,4));
});

//  Get book review
public_users.get('/review/:isbn', (req,res) => {
  const isbn = req.params.isbn;
  res.send(JSON.stringify(books[isbn].reviews,null,4));
});

module.exports.general = public_users;
