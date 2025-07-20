// import { type } from './../node_modules/path-to-regexp/dist/index.d';

const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const UserSchema = new Schema({
    first_name : {type: String},
    last_name : {type: String},    
    username : {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]+$/,
        minlength: 3,
        maxlength: 10,
    },
    socketId: {type: String},   
    connectedChannels: {type: String}
});


module.exports = mongoose.model('User', UserSchema);

