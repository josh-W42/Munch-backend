// imports
require('dotenv').config();
const passport = require('passport');
// For now we'll use bcrypt but ill do a scrypt example too
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Data base
const db = require("../models");

// basic test 
const test = async (req, res) => {
  res.json({ message: 'User endpoint OK!' });
}

// Controller for Registering a new User.
const register = async (req, res) => {
  const { userName, email, password, firstName, lastName } = req.body;

  // check if an email or username already exists
  try {
    const users = await db.User.find(
      {
        $or: [
          { email },
          { userName }
        ]
      }
    );

    // But What about mongo validation? we could use the unique: true
    if (users.length > 0) throw new Error('Username or Email already exists');

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
      if (error) throw new Error('Salt Generation Failed');

      bcrypt.hash(newUser.password, salt, async (error, hash) => {
        if (error) throw new Error('Hash Password Failure');

        newUser.password = hash;
        const createdUser = await newUser.save();
        res.status(201).json({ success: true, user: createdUser, message: 'User Created' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
}

// Controller for logging in.
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First find user.
    const findUser = await db.User.findOne({ email });
    if (!findUser) throw new Error('User not found.');

    // Second compare the user password/
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) throw new Error('Incorrect Password');

    // If the password is valid, then we send off the json web token payload
    const payload = {
      id: findUser.id,
      email: findUser.email,
      userName: findUser.userName
    }

    /* 
      OK so a note, in one hour the backend will basically log you out
      Now idk about you but depending on what you're building you'd want to change this.

      Pros:
        You're protecting your users data and you API.
        This is very useful for protecting sensitve information.

      Cons:
        If your user is active on the site and you reach the one hour mark, it'll log them out. Which can be a frustrating UX.
        Is there really any other cons other than a frustrating UX?

      Ultimately, it's up to you and your team at the end of the day.
    */
    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
      if (error) throw new Error('Session has ended, please log in again');
      
      // This verify method expires in 60 seconds if there is no response after attempting to verify the token
      const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });

      res.json({ success: true, token: `Bearer ${token}`, userData: legit });
    });
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message});
  }
}

// Get Profile information
const profile = async(req, res) => {
  const _id = req.params.id;
  // Find a user with that id
  try {
    const user = await db.User.findOne({ _id });
    // If it doesn't exist, throw an error
    if (!user) throw new Error("User Does Not Exist.");
    // Remove password.
    user.password = '';
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'User Does Not Exist' });
  }
}

// export all route functions
module.exports = {
  test, register, login, profile
}