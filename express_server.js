const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, fetchUser, verifyUser, urlsForUser, verifyExistsURL, urlBelongToUser } = require("./helpers");

const PORT = 8080;
const saltRounds = 10; //for hashing password

// creating an Express app
const app = express();

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


// In memory database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"},
  "asm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}

};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$7K7mIa7TAFIV0hc29dDxneN7QRlqUyMvzHmOAkpCCotx0jA4nx9P6" //user1
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "user2"
  }
};

//--------------------------GET "/"-------------------------------------//
app.get("/", (req, res) => {
  //Get the userId from the cookie
  const userId = req.session['userId'];
  //If user is not logged in then send an error message
  if (userId === null || userId === undefined) {
    res.redirect(`/login`);
  } else {
    res.redirect(`/urls`);
  }
});

//-------------------------Register-----------------------------------//

// Display the register form
app.get("/register", (req, res) => {
  // read the user id value from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    //If user not logged in render form for register
    const templateVars = {
      error: null,
      userId: null};

    res.render("register", templateVars);
  } else {
    //If user already logged in redirect to urls
    res.redirect('/urls');
  }
});

// Get the info from the register form
app.post("/register", (req, res) => {

  // extract the info from the form
  const { email, password } = req.body;

  // check if the user is not already in the database
  const checkData = verifyUser(users, email, password);
  
  // set statusCode to 400 if email empty or password empty or email already exists
  if (checkData.error === 'email' || checkData.error === 'password' || checkData.error === 'email_exists') {
    
    const templateVars = {
      error: checkData.error,
      message: checkData.message,
      userId: null};
    
    res.status(400);
    return res.render("register", templateVars);
  } else {

    //create new user if email and password are not empty and user doesn't exist in users database
    const id = generateRandomString();
    const newUser = {
      id,
      email: checkData.email,
      password: bcrypt.hashSync(checkData.password, saltRounds)
    };
    users[id] = newUser;

    // setCookie with the user id
    req.session['userId'] = id;
    // redirect to urls
    return res.redirect(`/urls`);
  }
});

//-------------------------Login-----------------------------------//

// Display the login form
app.get("/login", (req, res) => {
  // read the user id value from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    //If user not logged in render form for login
    const templateVars = {
      error: null,
      userId: null};
  
    res.render("login", templateVars);
  } else {
    //If user already logged in redirect to urls
    res.redirect('/urls');
  }
});

// Get the info from the login form
app.post("/login", (req, res) => {
  // extract the info from the form
  const {email, password} = req.body;
  //Verify if user exists in the database
  const checkData = verifyUser(users, email, password);

  if (checkData.error === 'email_exists') {
    //Test if hashed password are  matching
    if (bcrypt.compareSync(password, checkData.password)) {
      //If password correct set cookie and redirect to urls form
      req.session['userId'] = checkData.id;
      return res.redirect('/urls');

    } else {
      //set statusCode to 403 if passwords are not matching
      const templateVars = {
        error: 403,
        message: "Wrong Password!",
        userId: null};
      res.status(403);
      return res.render("login", templateVars);
    }
  } else {
    // If email or passeword user doesn't exist or email empty or password empty set stausCode to 403
    const templateVars = {
      error: 403,
      message: "Email or password incorrect!",
      userId: null};
    res.status(403);
    return res.render("login", templateVars);
  }
});

//-------------------------Logout-----------------------------------//

app.post("/logout", (req, res) => {
  // clear the cookies and redirect to urls
  req.session = null;
  res.redirect(`/urls`);
});

//-------------------------List all the Urls-----------------------------------//

app.get("/urls", (req, res) => {
  let templateVars = {};
  // read the user id value from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    //If user not logged in return error message
    res.send("You should Login first!");
  } else {
    //If User logged in List only the urls having his ID
    const fetchedUser = fetchUser(users, userId);
    const filtredURL = urlsForUser(urlDatabase, userId);

    templateVars = {
      userId,
      email: fetchedUser.email,
      password: fetchedUser.password,
      urls: filtredURL
    };
    //List URLs
    res.render("urls_index", templateVars);
  }
});

//-------------------------Create a new URL-----------------------------------//

//create new URL form
app.get("/urls/new", (req, res) => {
  // read the user id value from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    //Redirect to Login page if user is not logged in
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

//Add the new URL to urlDatabase
app.post("/urls", (req, res) => {
  //generate a new shortUrl and get the longUrl from the form
  const newLongURL = req.body["longURL"];
  const newShortURL = generateRandomString();
  //get the userId from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    // if user is not logged in return an error message
    res.send("You should Login first!");
  } else {
    // if user logged in add the new URL to the database and redirect to the new shortURL form
    urlDatabase[newShortURL] = {longURL: newLongURL, userID: userId };
    res.redirect(`/urls/${newShortURL}`);
  }
});

//-------------------------Delete a URL-----------------------------------//

app.post("/urls/:shortURL/delete", (req, res) => {
  //get the userId from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    // if user is not logged in return an error message
    res.send("You should Login first!");
  } else {
    //Check if the Url was created by the logged in user
    const filtredURL = urlBelongToUser(urlDatabase, req.params.shortURL, userId);
    if (filtredURL) {
      //If user is logged in delete the URL from the database and show the list of URLS
      delete urlDatabase[req.params.shortURL];
      res.redirect(`/urls`);
    } else {
      //If the Url doesn't belong to the user then send an eroor message
      res.send("This Url doesn't belong to you!");
    }
  }
});

//-------------------------Edit a URL-----------------------------------//

app.post("/urls/:shortURL", (req, res) => {
  //get the userId from the cookie
  const userId = req.session['userId'];

  if (userId === null || userId === undefined) {
    // if user is not logged in return an error message
    res.send("You should Login first!");
  } else {
    const updatedURL = req.body.longURL;
    //Check if the Url was created by the logged in user
    const filtredURL = urlBelongToUser(urlDatabase, req.params.shortURL, userId);
    if (filtredURL) {
      //update the database with the new LongUrl for the shortUrl requested then redirect to /urls
      urlDatabase[req.params.shortURL].longURL = updatedURL;
      res.redirect(`/urls`);
    } else {
      //If the Url doesn't belong to the user then send an eroor message
      res.send("This Url doesn't belong to you!");
    }
  }
});

//-------------------------Get a Specific URL-----------------------------------//
app.get("/urls/:shortURL", (req, res) => {
  //Get the userId from the cookie
  const userId = req.session['userId'];
  //If user is not logged in then send an error message
  if (userId === null || userId === undefined) {
    res.send("You should Login first!");
  } else {
    //if url doesn't exist in the database send an eroor message
    const shortURL = req.params.shortURL;
    const existURL = verifyExistsURL(urlDatabase, shortURL);
    if (!existURL) {
      //If the Url doesn't exist send an error message
      res.send("This Url doesn't exist!");
    } else {
      //Check if the Url was created by the logged in user
      const filtredURL = urlBelongToUser(urlDatabase, shortURL, userId);
      if (filtredURL) {
        //if user is logged in show the form showing the short and long URL with the update button
        const fetchedUser = fetchUser(users, userId);
        const templateVars = {
          userId,
          email: fetchedUser.email,
          password: fetchedUser.password,
          shortURL: req.params.shortURL,
          longURL: urlDatabase[req.params.shortURL].longURL
        };
        res.render("urls_show", templateVars);

      } else {
        //If the Url doesn't belong to the user then send an eroor message
        res.send("This Url doesn't belong to you!");
      }
    }
  }
});

//--------------------------Access longURL Site using the short URL----------------------------------//

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //if url exists in database redirect to the website corresponding
  const existURL = verifyExistsURL(urlDatabase, shortURL);
  if (existURL) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    //If the Url doesn't exist send an error message
    res.send("This Url doesn't exist!");
  }
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});