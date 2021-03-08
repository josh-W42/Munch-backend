require("dotenv").config();
const mongoose = require("mongoose");

// Better Practice to hid the mongo url
const { MONGO_URL } = process.env;
const configOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose
  .connect(MONGO_URL, configOptions)
  .then(() => console.log("MongoDB successfully connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = {
  User: require("./user"),
  Restaurant: require("./restaurant"),
  Category: require('./category'),
  Post: require('./post'),
};
