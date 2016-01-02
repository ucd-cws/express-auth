# express-auth

A ready to go authentication and authorization middleware solution for ExpressJS.
At it's core, express-auth is a wrapper around [Google Identity Toolkit](https://developers.google.com/identity/toolkit/?hl=en) and [node-acl](https://github.com/OptimalBits/node_acl).  Backed by MongoDB and leveraging
[nodemailer](https://github.com/nodemailer/nodemailer) for email support (email verification and password reset).


## Setup Overview

```JavaScript
var express = require('express');
var auth = require('express-auth');
var app = express();

MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {

  auth.init({
    db : db,
    app : app,
    config : {
      // ...  see below
    }
  });

});
```
## Config

#### installRequiredMiddleware : [Boolean]

The ExpressJS cookie parser and body parser middleware are required to run express-auth.  If you
already add these middleware components to your app, you don't need to worry about this flag.
Setting this flag to true is the equivalent of adding the following code:

```JavaScript
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
```

#### host : [String]

Required!  Example: **http://localhost:8000/**.  This host is required for gitkit
and signInWidget config.

#### path : [String]

Defaults to **/auth**, this path is prefixed to all endpoints defined by express-auth.

#### usersCollection : [String]

Defaults to **users**, name of the MongoDB collection where users accounts should be stored.

#### aclPrefix : [String]

Defaults to **acl**, prefix for the MongoDB collections used by node-acl.

#### gitkit : [Object]

Define the setup for Google Identity Toolkit (GIT).  GIT setup documentation is
provided by google [here](https://developers.google.com/identity/toolkit/web/quickstart/nodejs).
You will need a google account and key are acquired via the [Google Developer Console](https://console.developers.google.com/).

```JavaScript
// most of this information is provided when you create the service account
// in the google developer console
{
  "clientId": "",
  "projectId": "app-name",
  "serviceAccountEmail": "",
  "serviceAccountPrivateKeyFile": "full/path/to/pem/file.pem",
  "cookieName": "gtoken" // name of cookie for idk
}
```

#### signInWidget : [Object]

Define the setup for GIT sign in widget.  Widget setup documentation is
provided by google [here](https://developers.google.com/identity/toolkit/web/setup-frontend).

```JavaScript
{
   "signInSuccessUrl": "/",
   "signOutUrl": "/",
   "apiKey": "", // create this is google developer console
   "siteName": "this site",
   "signInOptions": ["password","google","aol"] // how users can login
}
```

#### protected : [Object]

Define the endpoints that require login or can only be accessed by admins.  These
endpoints are (currently) assumed to be REST JSON endpoints.  So failure responses will
be of the form:

```JSON
{
  "error" : true,
  "message" : "..."
}
```

Endpoints that require login should have value 'login' while endpoints that can
only be accessed by the admin should have value 'admin'.

Example:

```JSON
{
  "/api/getStuff" : "login",
  "/api/admin/doStuff" : "admin"
}  
```

## Endpoints

#### /auth/isLoggedIn

Returns:
```
{loggedIn : Boolean}
```

#### /auth/getUserInfo

Returns user object

#### /auth/express-auth.js

Returns the current server configuration and user information.  This returns JavaScript code not JSON
and should be added as a script tag in your app.  Will inject the ExpressAuth
namespace describing the configuration for several of the web components.

## Users Collection Schema

Users will be inserted into the users collection schema.  ExpressAuth will separate the gitkit
data and your application data.  The user object will look like the following:

```JavaScript
{
  "gitkit" : {
    "user_id" : "",
    "email" : "",
    "verified" : false, // has the email address been verified
    "display_name" : "",
    "photo_url" : "",
    // ...
  },
  "token" : {
    "uuid" : "",
    "expires" : new Date()
  },
  "app" : {
    // you are free to store any user application data here
  }
}
```
