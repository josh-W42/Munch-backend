// imports
require("dotenv").config();
const passport = require("passport");
// For now we'll use bcrypt but ill do a scrypt example too
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// Data base
const db = require("../models");

// basic test
const test = async (req, res) => {
  // How to structure and decode a token from authorization
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    res.json({ authenticated: true, payload });
  } else {
    res.json({ authenticated: false })
  }
};

// Controller for Registering a new User.
const register = async (req, res) => {
  const { userName, email, password, firstName, lastName } = req.body;

  // check if an email or username already exists
  try {
    const users = await db.User.find({
      $or: [{ email }, { userName }],
    });

    // But What about mongo validation? we could use the unique: true
    if (users.length > 0) throw new Error("Username or Email already exists");

    // Create a new user.
    const newUser = await db.User.create({
      userName,
      email,
      password,
      firstName,
      lastName,
      followers: [],
      following: [],
      favorites: [],
    });

    // Salt and hash the password.
    bcrypt.genSalt(12, (error, salt) => {
      if (error) throw new Error("Salt Generation Failed");

      bcrypt.hash(newUser.password, salt, async (error, hash) => {
        if (error) throw new Error("Hash Password Failure");

        newUser.password = hash;
        const createdUser = await newUser.save();
        res
          .status(201)
          .json({ success: true, user: createdUser, message: "User Created" });
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
    // First find user.
    const findUser = await db.User.findOne({ email });
    if (!findUser) throw new Error("User not found.");

    // Second compare the user password/
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) throw new Error("Incorrect Password");

    // If the password is valid, then we send off the json web token payload
    const payload = {
      id: findUser.id,
      email: findUser.email,
      userName: findUser.userName,
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
      if (error) throw new Error("Session has ended, please log in again");

      // This verify method expires in 60 seconds if there is no response after attempting to verify the token
      const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });

      res.json({ success: true, token: `Bearer ${token}`, userData: legit });
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
    const user = await db.User.findOne({ _id });
    // If it doesn't exist, throw an error
    if (!user) throw new Error("User Does Not Exist.");
    // Remove password.
    user.password = "";
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "User Does Not Exist" });
  }
};

// Get All user Info information
const all = async (req, res) => {
  // Find All with that id
  try {
    let users = await db.User.find({}).select('-password');
    res.json({ success: true, count: users.length, results: users });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        success: false,
        message: "Couldn't GET all users.",
        count: 0,
        results: [],
      });
  }
};

// Route to Delete a User
const remove = async (req, res) => {
  // id of user to delete
  const _id = req.params.id;
  try {
    // find the user
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    // check if user is deleting only themselves
    if (payload.id !== _id) throw new Error('Attempted To Delete Another User');

    await db.User.deleteOne({ _id });
    res.status(200).json({
      success: true,
      message: "User Deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a favorite restaurant via put
const addFavorite = async (req, res) => {
  const userId = req.params.userId;
  const restaurantId = req.params.restaurantId;
  try {
    // First find the user, then the restaurant
    const user = await db.User.findOne({ _id: userId });
    if (!user) throw new Error('No User Found');

    const restaurant = await db.Restaurant.findOne({ _id: restaurantId});
    if (!restaurant) throw new Error('No Restaurant Found');

    // Add a user favorite
    user.favorites = user.favorites.concat([restaurant]);
    await user.save();

    res.json({ success: true, message: 'Restaurant Saved To Favorites' });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// export all route functions
module.exports = {
  test,
  register,
  login,
  profile,
  all,
  remove,
  addFavorite,
};
