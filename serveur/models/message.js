const mongoose = require('mongoose');
const validator = require('validator');;

const { Schema } = mongoose;

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null // null si c’est un message privé
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null si c’est un message public
  }
});
module.exports= mongoose.model('Message', MessageSchema);
