/**
 * generate a random string of 6 caracters
 **/
const generateRandomString = () => {
  let randomShortURL = Math.random().toString(36).substring(2,8);
  return randomShortURL;
};

/**
 * return user by email
 **/
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return  user;
    }
  }
};

/**
 * return user by userID
 **/
const fetchUser = (database, uId) => {
  for (const user in database) {
    if (user === uId) {
      return {error:null, id: database[user].id, email: database[user].email, password: database[user].password};
    }
  }
  return {error: 'uId', id: null, email: null, password: null};
};

/**
 * return the list of urls created by the user via his userID
 **/
 
const urlsForUser = (database, id) => {
  let returnedList = {};
  for (const url in database) {
    if (database[url].userID === id) {
      returnedList[url] = {longURL: database[url].longURL, userID: database[url].userID};
    }
  }
  return returnedList;
};

const urlBelongToUser = (database, urlP, id) => {
  const listUsersURL = urlsForUser(database, id);
  if (listUsersURL) {
    return verifyExistsURL(listUsersURL, urlP);
  }
};

/**
 * verify user by his email and password
 **/

const verifyUser = (database, email, password) => {
  if (email === "") {
    return {error: 'email', message: 'email empty', id: null, email: null, password: null};
  } else {
    if (password === "") {
      return {error: 'password', message: 'password empty', id: null, email: null, password: null};
    } else {
      const user = getUserByEmail(email, database);
      if (user) {
        return {error: 'email_exists', message: 'email exists already!', id: database[user].id, email: database[user].email, password: database[user].password};
      }
        
      return {error: null, message: null, email, password};
    }
  }
  
};

/**
 * verify if url exists in database
 **/
const verifyExistsURL = (database, urlP) =>{
  for (const url in database) {
    if (url === urlP) {
      return urlP;
    }
  }
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  fetchUser,
  verifyUser,
  urlsForUser,
  verifyExistsURL,
  urlBelongToUser };