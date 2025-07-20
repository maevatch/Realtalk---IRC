const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

const ChannelSchema= new Schema({
    name: {type: String, required: true, unique: true},
    date: {type: Date, default: Date.now},
    
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

 module.exports = mongoose.model('Channel', ChannelSchema);