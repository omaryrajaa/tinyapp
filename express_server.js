const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  let randomShortURL = Math.random().toString(36).substring(2,8);
  return randomShortURL;
};


app.set("view engine", "ejs");

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

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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