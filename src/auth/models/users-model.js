'use strict';

const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const mongoose = require('mongoose');

const SECRET = process.env.SECRET || 'Ahmed1997';
const Users = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});


Users.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

Users.statics.basicAuth = function (auth) { 
  let password = { username: auth.user };
  return this.findOne(password)
    .then(user => {
      return user.passwordComparator(auth.pass);
    })
    .catch(console.error);
};

Users.methods.passwordComparator = function (pass) {
  return bcrypt.compare(pass, this.password)
    .then(valid => {
      return valid ? this : null;
    });
};
Users.methods.tokenGenerator = function () {
  let token = jwt.sign({ id: this._id }, SECRET);
  return token;
};

Users.statics.list =  async function(){
  let results = await this.find({});
  return results;
};

Users.statics.authenticateToken = async function(token){
  try {
    let tokenObject = await jwt.verify(token, SECRET);

    if (tokenObject.username) {
      return Promise.resolve(tokenObject);
    } else {
      return Promise.reject('User is not found!');
    }
  } catch (e) {
    return Promise.reject(e.message);
  }
};

module.exports = mongoose.model('users', Users);