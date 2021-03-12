require("dotenv").config();
const mongoose = require("mongoose");

// Better Practice to hid the mongo url
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/munchDev';
const configOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose
  .connect(url, configOptions)
  .then(() => console.log("MongoDB successfully connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = {
  User: require("./user"),
  Restaurant: require("./restaurant"),
  Category: require('./category'),
  Post: require("./post"),
  Order: require("./order")
};
