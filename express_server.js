const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  findUrlsForUserId,
  findUserByEmail,
  findUserById,
  generateRandomString
} = require('./helpers');

const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
}));

const urlDatabase = {
  b6UTxQ: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "aJ48lW"
  },
  i3BoGr: {
    longUrl: "https://www.thisiscolossal.com/2014/03/absurdly-expressive-dog-portraits-by-elke-vogelsang/",
    userId: "abcdef"
  },
}; 

const userDatabase = {  
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "1234"
  },
};

app.get("/", (req, res) => {
  return res.send("Hello! Welcome to TinyApp :)");
});

app.get("/register", (req, res) => {
  const user = findUserById(req.session.userId, userDatabase);
  
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
    return res.status(400).send('Oops, did you forget something? Fields cannot be blank');
  }

  if(findUserByEmail(givenEmail, userDatabase)) {
    return res.status(400).send('Hmm, looks like you\'ve done this before, the email already exists');
  }

  const hashedPassword = bcrypt.hashSync(givenPassword, 10);
  const userId = generateRandomString();
  
  userDatabase[userId] = {
    "id": userId,
    "email": givenEmail,
    "password": hashedPassword,
  }

  req.session.userId = userId;
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
    return res.status(400).send('Oops, did you forget something? Fields cannot be blank');
  }
  
  const user = findUserByEmail(givenEmail, userDatabase);
  
  if (!user) {
    return res.status(403).send('Hmm, are you sure you did that right? User cannot be found');
  } 
  
  if (!bcrypt.compareSync(givenPassword, user.password)) {
    return res.status(403).send('Oops, did you forget something? Something is incorrect');
  }  
  
  req.session.userId = user.id;
  return res.redirect('/urls');
});

app.get("/logout", (req, res) => {  
  req.session = null;
  return res.redirect('/tinyapp');
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  const user = findUserById(userId, userDatabase);
  
  if (user) {
    const templateVars = { 
      urls: findUrlsForUserId(userId, urlDatabase),
      user,
    };
    
    return res.render("urls_index", templateVars);
  }
  
  return res.status(403).send('You need to login first, silly.');
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);

  if (!user) {
    return res.status(403).send('You need to login first, silly.');
  } 

  const shortUrl = generateRandomString();
  
  urlDatabase[shortUrl] = {
    longUrl: req.body.longUrl,
    userId,
  };

  return res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/new", (req, res) => {
  const user = findUserById(req.session.userId, userDatabase);

  if (!user) {
    return res.status(403).send('You need to login first, silly.');
  } 

  const templateVars = {
    user,
  };

  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortUrl/edit", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);
  
  if (user) {
    const { shortUrl } = req.params;
    const urlObj = urlDatabase[shortUrl];

    if (urlObj) {
      if (urlObj.userId === userId) {
        return res.redirect(`/urls/${shortUrl}`);
      }

      return res.status(403).send('Not yours. No, looky, no touchy.');
    }
    return res.redirect(`/urls/${shortUrl}`);
  } 

  return res.status(403).send('You need to login first, silly.');
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);

  if (user) {
    const { shortUrl } = req.params;
    const urlObj = urlDatabase[shortUrl];
    
    if (urlObj) {
      if (urlObj.userId === userId) {
        delete urlDatabase[shortUrl];
  
        return res.redirect("/urls");
      }

      return res.status(403).send('Not yours. No looky, no touchy.');
    }

    return res.status(404).send('We looked  hard, but we could not find shortUrl in database.');
  }

  return res.status(401).send('You need to login first, silly.');
});

app.get("/urls/:shortUrl", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);

  const { shortUrl } = req.params;
  const urlObj = urlDatabase[shortUrl];

  if (!user) {
    return res.status(403).send('You need to login first, silly.');
  } 

  if (!urlObj){
    return res.status(404).send('Hmmm.... can\'t seem to find that one');
  }

  if (urlObj.userId !== userId) {
    return res.status(403).send('Not yours, no touchy.');
  }

  const templateVars = { 
    shortUrl, 
    longUrl: urlObj.longUrl,
    user,
  };

  return res.render("urls_show", templateVars);
  
});

app.post("/urls/:shortUrl", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);

  if (user) {
    const { shortUrl } = req.params;
    const urlObj = urlDatabase[shortUrl];
    
    if (urlObj) {
      if (urlObj.userId === userId) {
        urlObj.longUrl = req.body.longUrl;
      
        return res.redirect('/urls');
      }

      return res.status(403).send('Not yours. No looky, no touchy.');
    }

    return res.status(404).send('We looked  hard, but we could not find shortUrl in database.');
  }

  return res.status(401).send('You need to login first, silly.');
});

app.get("/u/:shortUrl", (req, res) => {
  const urlObj = urlDatabase[req.params.shortUrl];
  
  if (urlObj) {
    const longUrl = urlObj.longUrl;
    
    return res.redirect(longUrl);
  }

  res.status(404).send('Hmmm.... can\'t seem to find that one');
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase)
});

app.get("/tinyapp", (req, res) => {
  const userId = req.session.userId;
  const user = findUserById(userId, userDatabase);

  if (user) {

    return res.redirect("/urls");
  } 

  const templateVars = {
    user: undefined,
  };

  return res.render('home', templateVars);
});

app.listen(PORT, () => {
  return console.log(`Tiny app listening on port ${PORT} 👂!`);
});
