const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  onlineStatus: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  dailyRequestCount: {
    type: Number,
    default: 0
  },
  lastRequestDate: {
    type: Date,
    default: null
  },
  age: {
    type: Number,
    default: 18
  },
  qualification: {
    type: String,
    default: 'Independent'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
