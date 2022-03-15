const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "jh9h2k": "https://www.thisiscolossal.com/2014/03/absurdly-expressive-dog-portraits-by-elke-vogelsang/"
};

const userDatabase = {  
  "randomUserId": {
    id: "randomUserId", 
    email: "user@example.com", 
    password: "1234"
  },
  "123": {
    id: "123", 
    email: "user@email.com", 
    password: "1234"
  },
};

const generateRandomString = () => Math.random().toString(36).slice(2,8);
const findUserById = (userId) => userDatabase[userId] || null;
const emailExists = (email) => Object.values(userDatabase).some(user => user?.email === email);

// app.method(url, handler) === 'endpoint' | 'route'
app.get("/", (req, res) => {
  return res.send("Hello! Welcome to TinyApp :)");
});

app.get("/register", (req, res) => {
  const user = findUserById(req.cookies.user_id);
  
  // logged in users needn't register
  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user,
  };

  return res.render('register', templateVars);
});

app.post("/register", (req, res) => {

  return res.redirect('/register');
});

// app.post("/register", (req, res) => {
//   if(emailExists(req.body.email)) {
//     return res.status(400).send('Email already exists');
//   }

//   const userId = generateRandomString();
  
//   userDatabase[userId] = {
//     "id": userId,
//     "email": req.body.email,
//     "password": req.body.password,
//   }

//   if (userDatabase[userId].email === '') {
    
//     return res.status(400).send('Email cannot be blank');
//   } else if(userDatabase[userId].password === '') {
    
//     return res.status(400).send('Password cannot be blank');
//   }

//   res.cookie("user_id", userId);
//   return res.redirect('/register');
// });

app.get('/login', (req, res) => {
  const user = undefined;
  const templateVars = {
    user,
  };

  return res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;

  // if (!email || !password) {
  //   return res.status(400).send('Email and password cannot be blank');
  // }

  // const user = findUserById(user_id);

  // if(!user) {
  //   return res.status(400).send('A user with that email does not exist');
  // }

  // if(user.password !== password) {
  //   return res.status(400).send('Password does not match');
  // }

  // res.cookie('user_id', userDatabase.id);
  // res.redirect('/urls');

  // userDatabase[userId] = {
  //   "id": userId,
  //   "email": req.body.email,
  //   "password": req.body.password,
  // }

  // res.cookie("user_id", userId);
  return res.redirect('/login');
});

app.post("/logout", (req, res) => {
  
  res.clearCookie("user_id");
  return res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const user = findUserById(req.cookies.user_id);

  const templateVars = { 
    urls: urlDatabase,
    user,
  };
  
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  console.log(urlDatabase[shortURL]);
  return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = findUserById(req.cookies.user_id);

  const templateVars = {
    user,
  };
  return res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const { shortURL } = req.params;
  
  return res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  
  return res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const user = findUserById(req.cookies.user_id);

  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL],
    user,
  };
  
  return res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL] = req.body.longURL;
  
  return res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  
  return res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase)
});

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  return console.log(`Tiny app listening on port ${PORT} 👂!`);
});
