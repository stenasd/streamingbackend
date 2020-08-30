
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const mysql = require('mysql');
var db = require('./db');
var express = require('express')
var fs = require('fs')
var path = require('path')
var app = express()
var fs = require('fs')
var path = require('path')

//api endpoint that sends all pahts and name to the client and then supply movie from folder based on path or id requested
passport.use(new Strategy(
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.pass != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));
passport.serializeUser(function (user, cb) {
  console.log("serlizelogs"+JSON.stringify(user))
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {

  db.users.findById(id, function (err, user) {
    console.log("deserlize"+JSON.stringify(user)+" "+id)
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/',
  function (req, res) {

    res.render('home', { user: req.user });
  });

app.get('/v', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})
//sends all video ids and name so frontend can creat a search or movie list
app.get('/videodata', async (req, res) =>{
  res.send(await db.users.Getallmovies())
  
})

app.get('/login',
  function (req, res) {
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
  
    res.render('profile', { user: req.user });
  });
//acctual video stream todo add parameters with path to the movie that the client want streamed
//http://expressjs.com/en/api.html#req.query
app.get('dbtest', async (req, res) => {

})
app.get('/video/:id?', require('connect-ensure-login').ensureLoggedIn(), async (req, res) => {
  const path = 'assets/' + await db.users.GetFromWhere(req.params.id)
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return
    }

    const chunksize = (end - start) + 1
    const file = fs.createReadStream(path, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})


app.listen(3000);
