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
var bodyParser = require('body-parser')

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
  / app.use(require('body-parser').urlencoded({ extended: true }));
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
  var asjson = {
    "movarr": [
      { "id": "55", "time": "55" },
    ]
  }
  if (typeof req.user !== 'undefined') {
    let user = await db.users.getuserfromid(1)
    console.log(JSON.stringify(user));
    if (user.moviedata != null) {

      let usermovie = replaceAllBackSlash(user.moviedata)
      console.log("checkifnull" + user)
      usermovie = JSON.parse(usermovie)
      console.log(usermovie.count)

      res.status(200).json(usermovie);
    }
    res.status(200).json(asjson);
  }
});
app.post("/api/uservideodata", async (req, res) => {
  //check if id and time and duration is a number then unshift to front and remove dupplicates and remove stuff thats over 10 movies
  console.log("postreq" + JSON.stringify(req.body.time))
  //await old movie list
  if (typeof req.user !== 'undefined') {
    let user = await db.users.getuserfromid(1)
    console.log(JSON.stringify(user));
    if (user.moviedata != null) {
      
      let usermoviearray = replaceAllBackSlash(user.moviedata)
      usermoviearray = JSON.parse(usermoviearray)
      //todo check req.body is number
      usermoviearray.movie.unshift(req.body)
      //if top is same id just update time/remove
      if (usermoviearray.movie[0].id == req.body.id) {
        usermoviearray.movie[0].time = req.body.time
        res.status(200)
      }
      let currentindex
      usermoviearray.forEach(userelement => {

        //if already on watch move to front and update to latest time
        if (userelement.id == req.body.id) {
          usermoviearray[currentindex].time=req.body.time
          usermoviearray.unshift(usermoviearray.splice(currentindex,1)[0])
          res.status(200)
        }
        

        currentindex++;
      });
       //unshift current req.body
      usermoviearray.unshift(req.body)
      user.moviedata=usermoviearray 
      db.users.insertmoviedata(user.id,user.moviedata)
      res.status(200)
      //todo if at end of movie ignore and remove from array
     
      



    }
    res.status(200).json(req.body.time);
  }
});
app.post('/api/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('http://172.20.0.1:3000/');
  });
app.get("/api/checkAuthentication", (req, res) => {

  if (typeof req.user !== 'undefined') {

    res.status(200).json({
      authenticated: true,
    });
  }

});


app.get('/api/logout',
  function (req, res) {
    req.logout();
    res.redirect('http://172.20.0.1:3000/');
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
  con.query("SELECT * FROM movies", function (err, result, fields) {
    if (err) throw err;

  });
});
console.log("started")
app.listen(6969);
function replaceAllBackSlash(targetStr) {
  var index = targetStr.indexOf("\\");
  while (index >= 0) {
    targetStr = targetStr.replace("\\", "");
    index = targetStr.indexOf("\\");
  }
  return targetStr;
}



let jarray = {
  "movie": [
    { "id": "1", "duration": "12", "time": "12" }
    , { "id": "2", "duration": "12", "time": "12" }
    , { "id": "3", "duration": "12", "time": "12" }
    , { "id": "4", "duration": "12", "time": "12" }
  ]
}
let a = jarray.movie

a.unshift({ "id": "44", "duration": "44", "time": "44" })
console.log(JSON.stringify(a));