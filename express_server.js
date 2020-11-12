const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { fetchUser, verifyData, urlsForUser } = require("./helper");
const app = express();
app.use(cookieParser());
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "user1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "user2"
  }
};

const generateRandomString = () => {
  let randomShortURL = Math.random().toString(36).substring(2,8);
  return randomShortURL;
};


app.set("view engine", "ejs");




app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect(`/login`);
});



app.post("/urls", (req, res) => {
  const newLongURL = req.body["longURL"];
  const newShortURL = generateRandomString();
  const userId = req.cookies["userId"];
  if (userId === null || userId === undefined) {

    res.redirect("/login");
  } else {

    urlDatabase[newShortURL] = {longURL: newLongURL, userID: userId };
    res.redirect(`/urls/${newShortURL}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["userId"];

  if (userId === null || userId === undefined) {

    res.redirect("/login");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const updatedURL = req.body.longURL;
  
  
  urlDatabase[req.params.shortURL].longURL = updatedURL;

  res.redirect(`/urls`);

});



app.get("/", (req, res) => {
  res.send(`Hello!`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    error: null,
    userId: null};

  res.render("register", templateVars);

});

app.get("/login", (req, res) => {
  const templateVars = {
    error: null,
    userId: null};

  res.render("login", templateVars);

});


app.post("/register", (req, res) => {

  const { email, password } = req.body;

  const checkData = verifyData(users, email, password);

  if (checkData.error === 'email' || checkData.error === 'password' || checkData.error === 'email_exists') {
    
    const templateVars = {
      error: checkData.error,
      message: checkData.message,
      userId: null};
    
    res.status(400);
    return res.render("register", templateVars);
  } else {


    const id = generateRandomString();
    const newUser = {
      id,
      email: checkData.email,
      password: checkData.password
    };
    users[id] = newUser;
    res.cookie("userId", id);

    return res.redirect(`/urls`);
  }
  
});


app.post("/login", (req, res) => {
  const {email, password} = req.body;


  const checkData = verifyData(users, email, password);

  if (checkData.error === 'email_exists') {
    if (checkData.password !== password) {
      
      const templateVars = {
        error: 403,
        message: "Wrong Password!",
        userId: null};
      res.status(403);
      return res.render("login", templateVars);
    } else {
      res.cookie('userId', checkData.id);
      return res.redirect('/urls');
    }

  } else {

    
    const templateVars = {
      error: 403,
      message: "Email or password incorrect!",
      userId: null};

    res.status(403);
    return res.render("login", templateVars);
  }
});



app.get("/urls", (req, res) => {
  let templateVars = {};
  const userId = req.cookies["userId"];

  if (userId === null || userId === undefined) {

    res.redirect("/login");
  } else {
    const fetchedUser = fetchUser(users, userId);
    const filtredURL = urlsForUser(urlDatabase, userId);

    templateVars = {
      userId,
      email: fetchedUser.email,
      password: fetchedUser.password,
      urls: filtredURL
    };


    res.render("urls_index", templateVars);
  }
});



app.get("/urls/new", (req, res) => {
  
  const userId = req.cookies["userId"];

  if (userId === null || userId === undefined) {

    res.redirect("/login");
  } else {
    const fetchedUser = fetchUser(users, userId);


    const templateVars = {
      userId,
      email: fetchedUser.email,
      password: fetchedUser.password
    };
    res.render("urls_new", templateVars);
  }
});



app.get("/urls/:shortURL", (req, res) => {


  const userId = req.cookies["userId"];

  if (userId === null || userId === undefined) {

    res.redirect("/login");
  } else {
    const fetchedUser = fetchUser(users, userId);

    const templateVars = {
      userId,
      email: fetchedUser.email,
      password: fetchedUser.password,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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