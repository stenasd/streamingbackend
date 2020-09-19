//todo fix connection handshake thing on new queries
//data store for sessions
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
var bodyParser = require('body-parser');
const { time } = require('console');
const { promiseImpl } = require('ejs');

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

  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {

  db.users.findById(id, function (err, user) {

    if (err) { return cb(err); }
    cb(null, user);
  });
});
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/',
  function (req, res) {

    res.render('home', { user: req.user });
  });

app.get('/api/v', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})
app.get('/api/videodata', async (req, res) => {
  //gets 20 latest released movies or something
  res.send(await db.users.Getallmovies())

})

app.get('/api/login',
  function (req, res) {
    res.render('login');
  });
app.get("/api/uservideodata", async (req, res) => {
  if (typeof req.user !== 'undefined') {
    let user = await db.users.getuserfromid(req.user.id)
    console.log("USER " + JSON.stringify(user));
    if (user.moviedata) {
      //for each GetFromWhere
      let usermovie = replaceAllBackSlash(user.moviedata)

      usermovie = JSON.parse(usermovie)
      let completearr = { "movarr": [] }
      let unresolvedpromises = usermovie.movarr.map(async function (x) {

        let mov = await db.users.GetFromWhereName(x.id)

        let obj = { "name": mov.name, "time": x.time, "id": x.id }
        console.log("maplog" + JSON.stringify(obj));
        return obj
      })
      completearr.movarr = await Promise.all(unresolvedpromises)



      console.log("arrayprint" + completearr.movarr[0]);
      res.status(200).json(await completearr);
    }
  }
});
app.post("/api/uservideodata", async (req, res) => {
  //check if id and time and duration is a number then unshift to front and remove dupplicates and remove stuff thats over 10 movies
  //await old movie list
  if (typeof req.user !== 'undefined') {
    let user = await db.users.getuserfromid(req.user.id)

    if (user.moviedata != null) {
      let usermoviearray = replaceAllBackSlash(user.moviedata)
      usermoviearray = JSON.parse(usermoviearray)
      console.log("json = " + JSON.stringify(usermoviearray + " " + user.moviedata));
      db.users.updatemoviedata(user.id, db.users.jsonpostformater(req.body, usermoviearray))
    }
    else {
      console.log("innull");
      var idcheck = parseInt(req.body.id)
      var timecheck = parseInt(req.body.time)
      console.log("atinsert" + " " + idcheck);
      if (idcheck) {
        if (timecheck) {
          console.log("atinsert");
          db.users.insertmoviedata(user.id, { "movarr": [{ "id": req.body.id, "time": req.body.time }] })
        }
      }


    }
    res.status(200).json(req.body.time);
  }
});
app.post('/api/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });
app.get("/api/checkAuthentication", (req, res) => {
  console.log("checkauth");
  if (typeof req.user !== 'undefined') {

    res.status(200).json({
      authenticated: true,
    });
  }

});


app.get('/api/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });
app.get('/api/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {

    res.render('profile', { user: req.user });
  });
app.get('/api/video/:id?', async (req, res) => {

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
var con = mysql.createConnection({
  host: "localhost",
  user: "foo",
  password: "bar",
  database: "movie"
});

con.connect(function (err) {
  if (err) throw err;
  con.query("SELECT * FROM movies INNER JOIN readytostream ON readytostream.id = movies.id; ", function (err, result, fields) {
    if (err) throw err;
    console.log("stuff"+JSON.stringify(result));
  });
});
console.log("started")

function replaceAllBackSlash(targetStr) {
  var index = targetStr.indexOf("\\");
  while (index >= 0) {
    targetStr = targetStr.replace("\\", "");
    index = targetStr.indexOf("\\");
  }
  return targetStr;
}

app.listen(6969);

