const express = require('express');

const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const passport = require('passport');

const { Strategy } = require('passport-discord');

const path = require('path');

const ejs = require('ejs');

const { JsonDatabase } = require('wio.db');

const rateLimit = require('express-rate-limit');

const moment = require('moment');

const axios = require('axios');

const bot = require('./bot.js');

const config = require('./config.json');

const app = express();

const db = new JsonDatabase({

  databasePath: path.resolve(__dirname, 'db/database.json'),

});

app.set('view engine', 'ejs');

app.set('views', path.resolve(__dirname, 'web/views'));

app.use(express.static(path.resolve(__dirname, 'web/public')));

app.use('/assets', express.static('assets'));

app.set('json spaces', 1);

const store = new MongoDBStore({

  uri: 'mongodb+srv://a:a@sessions.8hk2com.mongodb.net/?retryWrites=true&w=majority',

  collection: 'mySessions'

});

app.use(

  session({

    secret: 'spicydevs', 

    resave: false,

    saveUninitialized: false,

    store: store

  })

); 

passport.serializeUser((user, done) => {

  done(null, user);

});

passport.deserializeUser((obj, done) => {

  done(null, obj);

});

const strategy = new Strategy(

  {

    clientID: process.env.CLIENT_ID,

    clientSecret: process.env.SECRET,

    callbackURL: `${process.env.URL}/callback`,

    scope: ['identify'],

  },

  (accessToken, refreshToken, profile, done) => {

    process.nextTick(() => done(null, profile));

  }

);

passport.use(strategy);

app.use(passport.initialize());

app.use(passport.session());

global.checkAuth = (req, res, next) => {

  if (req.isAuthenticated()) {

    return next();

  }

  req.session.backURL = req.originalUrl;

  res.redirect('/login');

};

app.get('/login', (req, res, next) => {

  req.session.backURL = req.headers.referer || '/';

  passport.authenticate('discord', { prompt: 'none' })(req, res, next);

});

app.get(

  '/callback',

  passport.authenticate('discord', { failureRedirect: '/error?statuscode=400&message=Failed+to+login+website' }),

  (req, res) => {

    res.redirect(req.session.backURL || '/');

  }

);

app.get('/', (req, res) => {

  res.render('main.ejs', {

    user: req.user,

    db,

    config

  });

});

app.get('/uptime', (req, res) => {

  res.render('uptime', {

    user: req.user,

    db,

    config,

  });

});

app.use((req, res, next) => {

  req.guild = bot.guilds.cache.get('1056551742239678574'); // replace GUILD_ID with your actual guild ID

  next();

});

app.get('/codes', async (req, res) => {

  if (!req.user) {

    return res.redirect('/login');

  }

  const role_id = '1063089366399991838'; // change this to the role ID you want to check for

  const member = await req.guild.members.fetch(req.user.id);

  if (!member.roles.cache.has(role_id)) {

    return res.redirect('/error');

  }

  res.render('codes.ejs', {

    user: req.user,

    db, config, bot

  });

});

app.get('/error', (req, res) => {

  res.status(403).send('Access Denied! You do not have the subscriber role to access this page. Join https://discord.gg/uoaio to get the required role.');

});

app.get('/dashboard', (req, res) => {

  const sd = Object.values(db.fetch('links'))

const sdev = sd.filter(x => x.link_owner == req.user.id)

  if (!req.user) return res.redirect('/login')

  const userID = req.user.id;

  const links = db.get('links');

  let userLinks = {};

  if (userID === '526015297887404042') {

    // If the user is the special user, show all links

    res.render('dashboard', { links, user: req.user,

    db, config, sdev });

  } else {

    if (links) {

      // Filter the links to only show the links that belong to the current user

      userLinks = Object.entries(links).reduce((acc, [id, link]) => {

        if (link.link_owner === userID) {

          acc[id] = link;

        }

        return acc;

      }, {});

    }

    // If the user is not the special user, show only their own links

    res.render('dashboard', { links: userLinks, user: req.user,

    db, config, sdev });

  }

});

app.get('/discord', (req, res) => {

  res.redirect(config.discord_server)

})

// database

// Uptimer

app.post('/uptime/link/add', (req, res) => {

  if (!req.user) return res.json({ "error": "Invalid discord id." })

  var sd = Object.values(db.fetch('links'))

  var lnkhas = sd.filter(x => x.link == req.body.link)

  if ((lnkhas == "") == false) {

    res.redirect('/dashboard')

  } else {

    const id = makeid(25)

    const now = moment().format("YYYY, MM, DD, HH:mm")

    var Data = {

      link_id: id,

      link_owner: req.user.id,

      link: req.body.link,

      link_when_added: now

    }

    db.set(`links.${id}`, Data)

    res.redirect('/dashboard?success=true')

  }

})

app.post('/uptime/link/delete/:ID', (req, res) => {

  try {

    const owner = db.fetch(`links.${req.params.ID}`).link_owner;

    if (req.user.id == owner) {

      db.delete(`links.${req.params.ID}`);

      res.redirect('/dashboard?success=true');

    } else {

      res.redirect('/dashboard?error=unauthorized');

    }

  } catch (err) {

    res.redirect('/dashboard?success=false&error=true');

  }

});

setInterval(() => {

  const links = db.get("links");

  if (!links) return;

  const lnks = Object.values(links).map(link => link.link);

  lnks.forEach(link => {

    const request = require('request');

    request(link, function(error, response, body) {

      // console.log('Pinged - ' + link)

    });

  });

}, 50000);

// Uptime robot webhook endpoint

app.post('/uptime/monitor', (req, res) => {

  const monitorID = req.body.monitorID;

  const status = req.body.alertType;

  const downtime = req.body.downtime;

  const monitor = db.fetch(`monitors.${monitorID}`);

  if (monitor) {

    if (status === 'down') {

      const now = moment().format('YYYY-MM-DD HH:mm:ss');

      monitor.lastDownTime = now;

      monitor.currentDowntime = downtime;

      db.set(`monitors.${monitorID}`, monitor);

    } else if (status === 'up') {

      const lastDownTime = moment(monitor.lastDownTime, 'YYYY-MM-DD HH:mm:ss');

      const downDuration = moment.duration(moment().diff(lastDownTime));

      monitor.downtime.push({

        startedAt: monitor.lastDownTime,

        duration: downDuration.asMinutes(),

      });

      monitor.lastDownTime = null;

      monitor.currentDowntime = null;

      db.set(`monitors.${monitorID}`, monitor);

    }

    res.sendStatus(200);

  } else {

    res.sendStatus(404);

  }

});

      

// Functions

const limiter = rateLimit({

windowMs: 60 * 1000,

max: 100,

});

app.use(limiter);

// Run the app

const port = ('8080');

app.listen(port, () => console.log(`Server started at port ${port}`));

// Helper function(s)

function makeid(length) {

var result = '';

var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var charactersLength = characters.length;

for (var i = 0; i < length; i++) {

result += characters.charAt(Math.floor(Math.random() * charactersLength));

}

return result;

};
