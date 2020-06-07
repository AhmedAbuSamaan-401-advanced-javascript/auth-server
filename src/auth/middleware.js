'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  try {
    let [authType, encodedString] = req.headers.authorization.split(/\s+/);
    switch (authType.toLowerCase()) {
    case 'basic':
      console.log('BASIC!!!!!!!!!!!!!!!!!!!');
      return _authBasic(encodedString);
    default:
      return _authError();
    }
  } catch (e) {
    return _authError();
  }

  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString, 'base64'); 
    let bufferString = base64Buffer.toString(); 
    let [username, password] = bufferString.split(':'); 
    let auth = [username, password];

    return User.authenticateBasic(auth).then((user) => {
      console.log('USER: ', user);
      _authenticate(user);
    });
  }

  function _authenticate(user) {
    if (user) {
      req.user = user;
      req.token = user.generateToken();
      console.log({ token: req.token });
      next();
    } else {
      console.log('no user!');
      _authError();
    }
  }

  function _authError() {
    next({
      status: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid User ID/Password',
    });
  }
};