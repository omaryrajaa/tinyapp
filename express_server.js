const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { fetchUser, verifyData } = require("./helper");
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
};

const generateRandomString = () => {
  let randomShortURL = Math.random().toString(36).substring(2,8);
  return randomShortURL;
};


app.set("view engine", "ejs");




app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  console.log("logout ", users);
  res.redirect(`/login`);
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
    res.status(400);
    const templateVars = {
      error: checkData.error,
      userId: null};
    return res.render("register", templateVars);
  } else {
    const id = generateRandomString();
    const newUser = {
      id,
      email,
      password
    };
    users[id] = newUser;
    res.cookie("userId", id);
    console.log(users);
    return res.redirect(`/urls`);
  }
  
});


app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const checkData = verifyData(users, email, password);
  if (checkData.error === 'email_exists') {
    if (checkData.password !== password) {
      res.status(403);
      const templateVars = {
        error: checkData.error,
        userId: null};
      return res.render("login", templateVars);
    } else {
      res.cookie('userId', checkData.id);
      return res.redirect(`/urls`);
    }

  } else {
    res.status(403);
    const templateVars = {
      error: checkData.error,
      userId: null};
    return res.render("login", templateVars);
  }
});



app.get("/urls", (req, res) => {
  let templateVars = {};
  const userId = req.cookies["userId"];
  console.log("userId = ", userId);
  const fetchedUser = fetchUser(users, userId);

  templateVars = {
    userId,
    email: fetchedUser.email,
    password: fetchedUser.password,
    urls: urlDatabase
  };
  console.log("templateVars = ", templateVars);
  res.render("urls_index", templateVars);

});



app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const fetchedUser = fetchUser(users, userId);

  const templateVars = {
    userId,
    email: fetchedUser.email,
    password: fetchedUser.password
  };
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["userId"];
  const fetchedUser = fetchUser(users, userId);

  const templateVars = {
    userId,
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