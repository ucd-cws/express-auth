var MongoClient = require('mongodb').MongoClient;
var authorization = require('../lib/models/authorization');

function connect(callback) {
  MongoClient.connect('mongodb://localhost:27017/expressAuthTest', function(err, db){
    if( err ) {
      return callback(err);
    }

    var setup = {
      db : db,
      usersCollection : db.collection('users')
    };

    authorization.init(setup);

    global.setup = setup;

    callback();
  });
}

function reset(callback) {
  global.setup.usersCollection.remove({}, callback);
}

module.exports = {
  connect : connect,
  reset : reset
};
