if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const passportLocal = require('passport-local');
const mongoSanitize=require('express-mongo-sanitize');
const User = require('./models/user');
const helmet=require('helmet');
const MongoStore = require('connect-mongo');
//Require Routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
//Connect to mongo database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl)
    .then(() => console.log('Database connected!'))
    .catch(error => console.log('Database connect error!', error));
//Execute express
const app = express();
//Config express
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Config and use method
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize({
    replaceWith: '_'
}));
//Create new store
const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*3600
})
store.on('error',function(e){
    console.log("SESSION STORE ERROR!", e);
})
//Config and use express-session
const sessionConfig = {
    store,
    name: 'blah',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
//Config statics serve
app.use(express.static(path.join(__dirname, 'public')));
//Config flash
app.use(flash());
//Use helmet contentSecurePolicy
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://www.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com",
    "https://www.bootstrapcdn.com/",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/wizzardimages/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Config passport-local-mongoose
// Initializing Passport
app.use(passport.initialize());
// Starting the session
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Use middleware to set local key values to use in all templates
app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
//Use routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'tiendatt@gamil.com', username: 'dattt' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((error, req, res, next) => {
    const { statusCode = 500 } = error;
    if (!error.message) error.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode);
    res.render('error', { error });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!`);
});