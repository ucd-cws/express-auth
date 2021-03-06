var authorization = require('./lib/models/authorization');
var authentication = require('./lib/controllers/authentication');
var account = require('./lib/controllers/account');
var gitkit = require('./lib/models/gitkit');
var middleware;

//var admin = require('./lib/controllers/admin');

var auth = {
  init : function(setup) {
    checkSetupErrors(setup);

    // see if we were passed a reference to a config file
    if( typeof setup.config === 'string' ) {
      setup.config = require(setup.config);
    }
    var config = setup.config;
    var app = setup.app;
    var db = setup.db;

    // you can turn this off via installRequiredMiddleware flag
    if( config.installRequiredMiddleware ) {
      var cookieParser = require('cookie-parser');
      app.use(cookieParser());

      var bodyParser = require('body-parser');
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
    }

    // set default path if not provided
    config.path = config.path || '/auth';

    config.usersCollection = db.collection(config.usersCollection || 'users');

    // setup google identity toolkit
    gitkit(setup);

    // setup mailer
    require('./lib/mailer')(setup.config);

    // add middleware to express
    middleware = require('./lib/auth-middleware')(setup);
    app.use(middleware);

    // init the authentication (gitkit)
    authentication(setup);

    // init the authorization (acl)
    authorization(setup, auth);
    account(setup);

    // init the admin functionality
    //admin();
  },
  middleware : middleware
};

function checkSetupErrors(setup) {
  if( !setup.app ) {
    throw('ExpressAuth setup requires express "app"');
  }
  if( !setup.db ) {
    throw('ExpressAuth setup requires MongoDB "db"');
  }
  if( !setup.config ) {
    throw('ExpressAuth setup requires "config"');
  }
}

module.exports = auth;
