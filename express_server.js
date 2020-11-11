const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { fetchUser } = require("./helper");
const app = express();
app.use(cookieParser());
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const generateRandomString = () => {
  let randomShortURL = Math.random().toString(36).substring(2,8);
  return randomShortURL;
};


app.set("view engine", "ejs");

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/register`);
});



app.post("/urls", (req, res) => {
  const newLongURL = req.body;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = newLongURL["longURL"];
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);

});

app.post("/urls/:shortURL", (req, res) => {
  const updatedURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = updatedURL;

  res.redirect(`/urls`);

});



app.get("/", (req, res) => {
  res.send(`Hello!`);
});

app.get("/register", (req, res) => {

  res.render("register");

});

app.post("/register", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password
  }
  users[id] = newUser;
  res.cookie("user_id", id);
  console.log(users);
  res.redirect(`/urls`);

});


app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  console.log("users = ", users);
  const fetchedUser = fetchUser(users, userId);

  console.log("fetchedUser = ", fetchedUser)

  const templateVars = {
    id: req.cookies["user_id"],
    email: fetchedUser.email,
    password: fetchedUser.password,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);

});



app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const fetcedhUser = fetchUser(users, userId);

  const templateVars = {
    id: req.cookies["user_id"],
    email: fetchedUser.email,
    password: fetchedUser.password
  };
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const fetchedUser = fetchUser(users, userId);

  const templateVars = {
    id: req.cookies["user_id"],
    email: fetchedUser.email,
    password: fetchedUser.password,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});