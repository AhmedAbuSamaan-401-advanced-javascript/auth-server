'use strict';

const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const mongoose = require('mongoose');

const SECRET = process.env.SECRET || 'Ahmed1997';
const Users = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {type: String, require:true, enum: ['user','writer','editor','administrator']},
});

const user = ['read'];
const writer = ['read', 'create'];
const editor = ['read, create', 'update' ];
const administrator = ['read, create', 'update', 'delete'];

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
  let capabilities;
  // expiresIn expiresIn: expressed in seconds or a string describing a time span / 15 min = 900000 ms
  // algorithm: object containing either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA
  // RS256	RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm
  // resoure https://www.npmjs.com/package/jsonwebtoken
  if (this.role === 'user'){
    capabilities = user;
  }else if (this.role === 'writer')
  {
    capabilities = writer;
  }else if( this.role === 'editor'){
    capabilities= editor;
  }else if (this.role === 'administrator'){
    capabilities=administrator;
  }
  let token = 
  jwt.sign({  role: this.role, id:this._id ,capabilities: capabilities ,expiresIn:  900000, algorithm:  'RS256' }, SECRET);  return token;
};

Users.statics.authenticateToken = async function(token){
  try {
    let tokenObject = await jwt.verify(token, SECRET);

    if (tokenObject.id) {
      return Promise.resolve(tokenObject);
    } else {
      return Promise.reject('User is not found!');
    }
  } catch (e) {
    return Promise.reject(e.message);
  }
};

Users.statics.list =  async function(){
  let results = await this.find({});
  return results;
};


module.exports = mongoose.model('users', Users);