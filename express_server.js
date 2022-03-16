const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

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
};

const generateRandomString = () => Math.random().toString(36).slice(2,8);
const findUserById = (userId) => userDatabase[userId] || null;
const findUserByEmail = (email) => Object.values(userDatabase).find(user => user?.email === email);

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
  const {email: givenEmail = '', password: givenPassword = ''} = req.body;

  if (givenEmail === '' || givenPassword === '') {
    return res.status(400).send('Feilds cannot be blank');
  }

  if(findUserByEmail(givenEmail)) {
    return res.status(400).send('Email already exists');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  
  userDatabase[userId] = {
    "id": userId,
    "email": givenEmail,
    "password": hashedPassword,
  }

  res.cookie("user_id", userId);
  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: undefined,
  };

  return res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const {email: givenEmail = '', password: givenPassword = ''} = req.body;

  if (givenEmail === '' || givenPassword === '') {
    return res.status(400).send('Email and/or password cannot be blank');
  } 
  
  const user = findUserByEmail(givenEmail);
  
  if (!user) {
    return res.status(403).send('User cannot be found');
  } 
  
  if (!bcrypt.compareSync(givenPassword, user.password)) {
    return res.status(403).send('Password is incorrect');
  }  
  
  res.cookie('user_id', user.id);
  return res.redirect('/urls');

  // if (givenEmail && givenPassword) {
  //   const user = findUserByEmail(givenEmail);

  //   if (user) {
  //     if (bcrypt.compareSync(givenPassword, user.password)) {
  //       res.cookie('user_id', user.id);
  //       return res.redirect('/urls');
  //     }

  //     return res.status(403).send('The email and password combination is incorrect');
  //   }

  //   return res.status(403).send('User cannot be found');
  // }

  // return res.status(400).send('Email and/or password cannot be blank');
});

app.post("/logout", (req, res) => {
  
  res.clearCookie('user_id');
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
