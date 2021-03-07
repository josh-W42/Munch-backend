const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  favorites: [{type: mongoose.Schema.Types.RestarauntId, ref: 'Restaraunt'}],
  key: String (hashed),
  password: {
    type: String,
    minLength: 8,
    required: true,
  },
  followers: [{type: mongoose.Schema.Types.userId, ref: 'followers'}], // idk if this works
  following: [{type: mongoose.Schema.Types.usertId, ref: 'following'}], // idk if this works
  payments: {
    type:String // unknown for now
  }, 
  location: { type:String },
},
  { timestamps: true }
)

const User = mongoose.model('User', userSchema);

module.exports = User;