const fetchUser = (db, uId) => {

  for (const user in db) {

    
    if (user === uId) {
      

      return {error:null, id: db[user].id, email: db[user].email, password: db[user].password};
    }
  }
  return {error: 'uId', id: null, email: null, password: null};
};

const urlsForUser = (db, id) => {
  let returnedList = {};

  for (const url in db) {

    
    if (db[url].userID === id) {
       
      returnedList[url] = {longURL: db[url].longURL, userID: db[url].userID};
      
      
    }
  }

  return returnedList;
};

const verifyData = (db, email, password) => {
  if (email === "") {
    return {error: 'email', message: 'email empty', id: null, email: null, password: null};
  } else {
    if (password === "") {
      return {error: 'password', message: 'password empty', id: null, email: null, password: null};
    } else {
      for (const user in db) {


        if (db[user].email === email) {

          return {error: 'email_exists', message: 'email exists already!', id: db[user].id, email: db[user].email, password: db[user].password};
        }
        
      }
      return {error: null, message: null, email, password};
    }
  }
  
};
module.exports = { fetchUser, verifyData, urlsForUser };