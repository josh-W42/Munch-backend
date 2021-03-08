// imports
require("dotenv").config();
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// Data base
const db = require("../models");

// basic test
const test = async (req, res) => {
  res.json({ message: "Restaurants endpoint OK!" });
};

// Controller for Registering a new Restaurant.
const register = async (req, res) => {
  const { name, email, password, category } = req.body;

  // Ok so this is when do things like check if an email or name already exists
  try {
    const restaurants = await db.Restaurant.find({ email });
    if (restaurants.length > 0) throw new Error("Email already exists");

    // Find the category
    const foundCategory = await db.Category.findOne({ name: category });
    if (!foundCategory) throw new Error("Category Does Not Exist");

    // Create a new user.
    const newRestaurant = await db.Restaurant.create({
      name,
      email,
      password,
      imgUrl: "",
      menu: [],
      category: [foundCategory],
    });

    // Salt and hash the password.
    bcrypt.genSalt(12, (error, salt) => {
      if (error) throw new Error("Salt Generation Failed");

      bcrypt.hash(newRestaurant.password, salt, async (error, hash) => {
        if (error) throw new Error("Hash Password Failure");

        newRestaurant.password = hash;
        const createdRestaurant = await newRestaurant.save();
        res
          .status(201)
          .json({
            success: true,
            restaurant: createdRestaurant,
            message: "Restaurant Created",
          });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller for logging in.
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First find Restaurant.
    const findRestaurant = await db.Restaurant.findOne({ email });
    if (!findRestaurant) throw new Error("Restaurant not found.");

    // Second compare the Restaurant password/
    const isValid = await bcrypt.compare(password, findRestaurant.password);
    if (!isValid) throw new Error("Incorrect Password");

    // If the password is valid, then we send off the json web token payload
    const payload = {
      id: findRestaurant.id,
      email: findRestaurant.email,
      name: findRestaurant.name,
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
      if (error) throw new Error("Session has ended, please log in again");

      // This verify method expires in 60 seconds if there is no response after attempting to verify the token
      const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });

      res.json({ success: true, token: `Bearer ${token}`, RestaurantData: legit });
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Profile information
const profile = async (req, res) => {
  const _id = req.params.id;
  // Find a user with that id
  try {
    const restaurant = await db.Restaurant.findOne({ _id });
    // If it doesn't exist, throw an error
    if (!restaurant) throw new Error("Restaurant Does Not Exist.");
    // Remove password.
    restaurant.password = "";
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ success: false, message: "Restaurant Does Not Exist" });
  }
};

// Get All Restaurant Info information
const all = async (req, res) => {
  // Find All with that id
  try {
    let restaurants = await db.Restaurant.find({}).select('-password');
    res.json({ success: true, count: restaurants.length, results: restaurants });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        success: false,
        message: "Couldn't GET all restaurants.",
        count: 0,
        results: [],
      });
  }
};

// export all route functions
module.exports = {
  test,
  register,
  login,
  profile,
  all,
};
