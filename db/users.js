const mysql = require('mysql');
var connection = mysql.createConnection({
  host: "localhost",
  user: "foo",
  password: "bar",
  database: "movies"
});
var records = [
  { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [{ value: 'jack@example.com' }] }
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [{ value: 'jill@example.com' }] }
];
// if id is in database respond with userobject
exports.findById = function(id, cb) {
  process.nextTick(async function() {
    var idx = await GetIdWhere(id)
    console.log("findid"+idx+" ")
    if (idx) {
      cb(null, idx);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}
//if find atleast 1 in database return userobject
exports.findByUsername = function(username, cb) {
  process.nextTick(async function() {
        let a = await GetUsernameWhere(username)
        return cb(null, a);
 
  });
}

exports.GetFromWhere = function (whereat) {

  return new Promise(resolve => {
    if (!connection._connectCalled) {
      connection.connect();
    }
    connection.query("SELECT * FROM movies WHERE id = " + mysql.escape(whereat), function (err, result, fields) {
      //if (err) throw err;
      if (result[0] == undefined) {
        //resolve(".")
      }
      else {
        console.log("print" + result[0].path);
        resolve(result[0].path)
      }


    });

  });
}
exports.Getallmovies = function () {

  return new Promise(resolve => {
    if (!connection._connectCalled) {
      connection.connect();
    }
    connection.query("SELECT name,id FROM movies", function (err, result, fields) {
      //if (err) throw err;
      if (result[0] == undefined) {
        //resolve(".")
      }
      else {
        console.log("print" + result);
        resolve(result)
      }


    });

  });
}
exports.getallusers = function () {

  return new Promise(resolve => {
    if (!connection._connectCalled) {
      connection.connect();
    }
    connection.query("SELECT * FROM `users` ", function (err, result, fields) {
      console.log("asd"+result)
      if (result == undefined) {
        //resolve(".")
      }
      else {
        console.log("print" + result);
        resolve(result)
      }


    });

  });
}
function GetIdWhere(whereat) {

  return new Promise(resolve => {
    if (!connection._connectCalled) {
      connection.connect();
    }
    connection.query("SELECT * FROM users WHERE id = " + mysql.escape(whereat), function (err, result, fields) {
      //if (err) throw err;
      if (result[0] == undefined) {
        //resolve(".")
      }
      else {
        resolve(result[0])
      }
    });
  });
}
function GetUsernameWhere(whereat) {

  return new Promise(resolve => {
    if (!connection._connectCalled) {
      connection.connect();
    }
    connection.query("SELECT * FROM users WHERE username = " + mysql.escape(whereat), function (err, result, fields) {
      //if (err) throw err;
      if (result[0] == undefined) {
        //resolve(".")
      }
      else {
        resolve(result[0])
      }
    });
  });
}