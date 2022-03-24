# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

Main page where you can register as a new user or login if you have an account.
!["TinyApp Home page"](https://github.com/azulverdosa/tinyapp/blob/013e962244944fa5e53fcf8c76330ece586c0a4e/docs/tinyapp_page.png?raw=true)

If it's your first time at TinyApp, you'll need to register to keep going.
!["TinyApp Registragtion page"](https://github.com/azulverdosa/tinyapp/blob/013e962244944fa5e53fcf8c76330ece586c0a4e/docs/register_page.png?raw=true)

If you have an account, when you login you'll see all the short URLS you've created and when you created them. If you like you can edit them, delete them or create more.
!["URL Index page"](https://github.com/azulverdosa/tinyapp/blob/013e962244944fa5e53fcf8c76330ece586c0a4e/docs/myUrls_page.png?raw=true)

If you do want to edit something, this is the page you'll do it at.
!["Short URL page"](https://github.com/azulverdosa/tinyapp/blob/013e962244944fa5e53fcf8c76330ece586c0a4e/docs/shortUrl_page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- mocha - for testing
- chai - for testing


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Go to localhost:8080 on your browser and enjoy!

## Getting Started
#### Register/Login
Users must be logged in to create new links, view them, and edit them.

Just click Register on the top left at the home page, put in your email and password, and you're good to go.

#### Create New Links
There are a few easy button options to get started, either click 'Create New' in the navigation bar at the top left or at the bottom left of your URLs main list page.

Then simply enter the long URL you want to shorten.

#### Edit or Delete Short Links
Also from your URLs main list, you can delete any link you want, and access the original long URL to edit it if needed. The short URL will stay the same.

#### Use Your Short Link
The path to use any short link is /u/:shortLink. This will redirect you to the long URL.

You can also reach this by clicking the short URL from your URLS main list page or from the edit page.