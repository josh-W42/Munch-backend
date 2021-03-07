const mongoose = require("mongoose");
const { Schema } = mongoose;

const menuSchema = new mongoose.Schema({
  name: String,
  description: String,
  imgUrl: String,
  price: Number,
  type: String,
});

const restarauntSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    location: null,
    imgUrl: {
      type: String,
    },
    // embedded
    menu: [menuSchema],
  },
  {
    timestamps: true,
  }
);

const Restaraunt = mongoose.model("Restaraunt", restarauntSchema);

module.exports = Restaraunt;