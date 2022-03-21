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
  b6UTxQ: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "aJ48lW"
  },
  i3BoGr: {
    longUrl: "https://www.thisiscolossal.com/2014/03/absurdly-expressive-dog-portraits-by-elke-vogelsang/",
    userId: "abcdef"
  }
}; // object.entries >>> [[b6UTxQ, {longUrl: lhl, userId: aJ48lW}], ...]

const userDatabase = {  
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "1234"
  },
};

const generateRandomString = () => Math.random().toString(36).slice(2,8);
const findUserById = (userId) => userDatabase[userId] || null;
const findUserByEmail = (email) => Object.values(userDatabase).find(user => user?.email === email);
const findUrlsForUserId = (userId) => {
  const arrOfUrlEntries = Object.entries(urlDatabase); 

  return arrOfUrlEntries.reduce((acc, [shortUrl, urlObj]) => {
    if (urlObj.userId === userId) {
      return {...acc, [shortUrl]: urlObj };
    } else {
      return acc;
    }
  }, {});
};

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
    return res.status(400).send('Oops, did you forget something? Feilds cannot be blank');
  }

  if(findUserByEmail(givenEmail)) {
    return res.status(400).send('Hmm, looks like you\'ve done this before, the email already exists');
  }

  const hashedPassword = bcrypt.hashSync(givenPassword, 10);
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
    return res.status(400).send('Oops, did you forget something? Feilds cannot be blank');
  } 
  
  const user = findUserByEmail(givenEmail);
  
  if (!user) {
    return res.status(403).send('Hmm, are you sure you did that right? User cannot be found');
  } 
  
  if (!bcrypt.compareSync(givenPassword, user.password)) {
    return res.status(403).send('OOps, did you forget something? Password is incorrect');
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

app.get("/logout", (req, res) => {  
  res.clearCookie('user_id');
  return res.redirect('/tinyapp');
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = findUserById(userId);
  
  if (user) {
    const templateVars = { 
      urls: findUrlsForUserId(userId),
      user,
    };
    
    return res.render("urls_index", templateVars);
  }
  
  return res.status(403).send('You need to login first, silly.');
  // return res.status(302).redirect('/tinyapp');
});

app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = findUserById(userId);

  if (!user) {
    return res.status(403).send('You need to login first, silly.');
  } 

  const shortUrl = generateRandomString();
  
  urlDatabase[shortUrl] = {
    longUrl: req.body.longUrl,
    userId
  };

  return res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const user = findUserById(req.cookies.user_id);

  if (!user) {
    return res.status(403).send('You need to login first, silly.');
  } 

  const templateVars = {
    user,
  };

  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortUrl/edit", (req, res) => {
  const { shortUrl } = req.params;
  const userId = req.cookies.user_id;
  const user = findUserById(userId);
  
  if (user) {
    return res.redirect(`/urls/${shortUrl}`);
  } 

  return res.status(403).send('You need to login first, silly.');
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const userId = req.cookies.user_id;
  const user = findUserById(userId);

  if (user) {
    const { shortUrl } = req.params;
    const urlObj = urlDatabase[shortUrl];
    
    if (urlObj) {
      if (urlObj.userId === userId) {
        delete urlDatabase[shortUrl];
  
        return res.redirect("/urls");
      }

      return res.status(403).send('Not yours, no touchy.');
    }

    return res.status(404).send('We looked  hard, but we could not find shortUrl in database.');
  }

  return res.status(401).send('You need to login first, silly.');
});

app.get("/urls/:shortUrl", (req, res) => {
  const userId = req.cookies.user_id;
  const user = findUserById(userId);

  const { shortUrl } = req.params;
  const urlObj = urlDatabase[shortUrl];

  if (urlObj){
      const templateVars = { 
        shortUrl, 
        longUrl: urlObj.longUrl,
        user,
      };

      return res.render("urls_show", templateVars);
    
  }
  
  return res.status(404).send('Hmmm.... can\'t seem to find that one');
});

app.post("/urls/:shortUrl", (req, res) => {
  const userId = req.cookies.user_id;
  const user = findUserById(userId);

  if (user) {
    const { shortUrl } = req.params;
    const urlObj = urlDatabase[shortUrl];
    
    if (urlObj) {
      if (urlObj.userId === userId) {
        urlObj.longUrl = req.body.longUrl;
      
        return res.redirect(`/urls/${shortUrl}`);
      }

      return res.status(403).send('Not yours, no touchy.');
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

  res.status(404).send('Could not find shortUrl in database');
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase)
});

app.get("/tinyapp", (req, res) => {
  const user = findUserById(req.cookies.user_id);

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
