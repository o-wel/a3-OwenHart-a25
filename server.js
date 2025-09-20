const express = require( "express" ),
    app = express()
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');

const uri = `mongodb+srv://${process.env.USR}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=a3-OwenHart`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let collection = null;
let userData = null

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect(err => {
            console.log(err);
            client.close();
        });
        // Send a ping to confirm a successful connection
        await client.db("a3-db").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        userData = client.db("a3-db").collection("users");
    } catch (e) {
        console.error(e);
    }
}

// setting up passport
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

const authUser = async (username, password, done) => {
    const user = await userData.findOne({username: username, password: password});

    if (!user) {
        return done(null, false, { message: 'Could not find user with this password' });
    } else {
        collection = client.db("a3-db").collection(username);

        return done(null, user);
    }
}

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/loginpage');
    }
}

const alreadyLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/wishlist');
    }
    next()
}

passport.use(new LocalStrategy(authUser));

passport.serializeUser((user, done) => {
    console.log("serializing user:", user)
    done(null, user)
})
passport.deserializeUser((user, done) => {
    console.log("deserializing user:", user)
    done(null, user)
})

// middleware and ejs
app.use(express.json())
app.use(express.static("public"))

app.set("view engine", "ejs");
app.set('views', './public/views');

// frontend
app.get('/', (req, res) => {
    res.redirect(`/loginpage`);
})

app.get("/loginpage", alreadyLoggedIn, (req, res) => {
    res.render("index", {loggedIn: false});
})

app.get("/wishlist", checkAuth, (req, res) => {
    res.render("index", {loggedIn: true});
})

// backend
app.post('/login', passport.authenticate('local', {
    successRedirect: '/wishlist',
}))

app.post('/createAccount', async (req, res) => {
    const checkUser = await userData.findOne({username: req.body.username});

    if(checkUser){
        res.json({status: 'error', message: 'Username already exists'});
    } else {
        await userData.insertOne({username: req.body.username, password: req.body.password});

        await client.db("a3-db").createCollection(req.body.username)

        res.json({status: 'ok', message: 'Account created successfully', url: '/loginpage'});
    }
})

app.delete('/logout', (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/loginpage');
    });
    console.log('logged out');
})

app.get("/appdata", async (req, res) => {
    if(collection !== null){
        const data = await collection.find({}).toArray();
        res.json(data);
    }
})

app.post( '/submit', async (req,res) => {
    console.log(req.body)
    const result = await collection.insertMany( req.body )
    res.json( result )
})

app.post('/update', async (req,res) => {
    const updated = await collection.updateOne(
        {_id: new ObjectId(req.body.id)},
        {$set: {name: req.body.name, review: req.body.review, price: req.body.price}}
    )
    res.json(updated)
})

app.post('/remove', async (req,res) => {
    const removed = await collection.deleteOne({_id: new ObjectId(req.body._id)})
    res.json(removed)
})

run().catch(console.dir);

app.listen(process.env.PORT || 3000)