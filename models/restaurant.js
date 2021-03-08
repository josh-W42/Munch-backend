const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  imgUrl: String,
  price: Number,
  type: String,
});

const restaurantSchema = new mongoose.Schema(
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
    // location: null, null for now
    imgUrl: {
      type: String,
    },
    // embedded
    menu: [productSchema],
    // reference
    category: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}]
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
