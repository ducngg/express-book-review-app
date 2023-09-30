const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const general_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",
  session({
    secret:"fingerprint_customer"
    ,resave: true,
    saveUninitialized: true
}))

app.use("/customer/auth/*", (req,res,next) => {
  //Check if logged in
  if(req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    //Verify if authenticated in
    jwt.verify(token, "access", (err) => {
      if(!err){
        next();
      } else {
        return res.status(403).json({message: "User not authenticated"});
      }
    });
  } else {
    return res.status(403).json({message: "User not logged in"});
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", general_routes);

app.listen(PORT,()=>console.log("Server is running"));
