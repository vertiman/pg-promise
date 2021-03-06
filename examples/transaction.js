///////////////////////////////////////////////
// This is to show a complete test application;
///////////////////////////////////////////////

var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);
// See also: https://github.com/vitaly-t/pg-promise#initialization-options

// Database connection details;
var cn = {
    host: 'localhost', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'myDatabase',
    user: 'myUser',
    password: 'myPassword'
};
// You can check for all default values in:
// https://github.com/brianc/node-postgres/blob/master/lib/defaults.js

var db = pgp(cn); // database instance;

db.tx(function (t) {
    // t = this;
    return this.batch([
        t.one("insert into users(name) values($1) returning id", "John"),
        t.one("insert into events(code) values($1) returning id", 123)
    ]);
})
    .spread(function (user, event) {
        console.log(user.id); // print new user id;
        console.log(event.id); // print new event id;
    }, function (reason) {
        console.log(reason); // print error;
    })
    .done(function () {
        // If we do not close the connection pool when exiting the application,
        // it may take 30 seconds (poolIdleTimeout) before the process terminates,
        // waiting for the connection to expire in the pool.

        // But if you normally just kill the process, then it doesn't matter.

        pgp.end(); // closing the connection pool, to exit immediately.

        // See also:
        // https://github.com/vitaly-t/pg-promise#library-de-initialization

        // NOTE: The default ES6 Promise doesn't have methods `.spread` and `.done`,
        // but they are available within Bluebird library used here as an example.
    });
