## A3-OwenHart: Game Wishlist App

My Render: 

This is project A3 for CS 4241 Computer Webware. This web application allows users to create an account, log in, and keep track of their own game wishlist. The goal of this application
is to create a simple two-tier web app to let users keep track of games in a list. The main challenge with this project was implementing user authentication and learning how to use
passport.js for authentication. I chose local authentication because it seemed easier than github, and because I was a little confused on the definition of Oauth. I used the bootstrap CSS
framework for its nice documentation and because I had never used it before. I did not modify the framework, but I did have a few custom CSS rules that I modified from assignment 2 that still fit in with
the project and framework. The express middleware packages I used were:
- express: the main web server framework
- mongodb: the package to connect to a mongodb client
- passport: an authentication middleware used to verify users
- passport-local: the local strategy for passport authentication, as in, setting up passport with mongoDB
- express-session: used to manage user sessions with passport to maintain login

You can create an account or log in with the account:
- Username: admin
- Password: 1234
  
(very secure, I know)

## Technical Achievements
- **Tech Achievement 1**: While I did not use third-party OAuth, as I was a little confused on the definition of OAuth, I did set up the passport js which was a little confusing and
time consuming, so I feel like it should count for something, only a few points.
- **Tech Achievement 2**: I achieved 100% in all four lighthouse tests on both site pages. See README-Images for screenshots.

### Design/Evaluation Achievements
- None
