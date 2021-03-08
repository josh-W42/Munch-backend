const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
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
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // idk if this works
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // idk if this works
    // payments: null, commenting these out for now
    // location: null,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
