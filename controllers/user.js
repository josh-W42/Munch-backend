// imports
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { Trie } = require('../seed');

// Data base
const db = require("../models");

// Cloudinary
const cloudinary = require('cloudinary');

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
    // Create a new user.
    const newUser = await db.User.create({
      userName,
      email,
      password,
      firstName,
      lastName,
      profileUrl:
        "https://res.cloudinary.com/dom5vocai/image/upload/v1615610157/profile-image-placeholder_sbz3vl.png",
      coverUrl: "",
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

        // add the new username to autocomplete index
        Trie.addWord(userName.toLowerCase(), "user");

        // Then log the user in.
        const payload = {
          id: createdUser._id,
          email: createdUser.email,
          userName: createdUser.userName,
          type: "user",
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
          if (error) throw new Error("Session has ended, please log in again");

          // This verify method expires in 60 seconds if there is no response after attempting to verify the token
          const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });

          res
            .status(201)
            .json({
              success: true,
              token: `Bearer ${token}`,
              data: legit,
              message: "User Created",
            });
        });
      });
    });
  } catch (error) {
    console.error(error);
    if (error.name === "MongoError") {
      const needToChange = error.keyPattern;
      res.status(409).json({
        success: false,
        message: "Database Error",
        needToChange,
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
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
      id: findUser._id,
      email: findUser.email,
      userName: findUser.userName,
      type: "user",
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
      if (error) throw new Error("Session has ended, please log in again");

      // This verify method expires in 60 seconds if there is no response after attempting to verify the token
      const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });

      res.json({ success: true, token: `Bearer ${token}`, data: legit });
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Profile information
const publicInfo = async (req, res) => {
  const _id = req.params.id;
  // Find a user with that id
  try {
    const user = await db.User.findOne({ _id }).select('-password -email -firstName -lastName');
    // If it doesn't exist, throw an error
    if (!user) throw new Error("User Does Not Exist.");

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "User Does Not Exist" });
  }
};

const privateInfo = async (req, res) => {
  const _id = req.params.id;
  try {
    // Only give private information to a logged in user.
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    // check if the user is viewing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    // If yes, retreive and send
    const user = await db.User.findOne({ _id }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That User To Do That.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// Get All user Info information
const all = async (req, res) => {
  // Find All with that id
  try {
    let users = await db.User.find({}).select('-password -email -firstName -lastName');
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

// Route to edit a User
const edit = async (req, res) => {
  const _id = req.params.id;
  try {
    // find the current user
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    // check if the user is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    const { userName, email, oldPassword, newPassword, firstName, lastName } = req.body;

    const user = await db.User.findOne({ _id });

    // if user submitted an oldPassword and newPassword
    if (oldPassword && newPassword) {
      // compare old password
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) throw new Error("Old Password Inccorect");

      const isOldPassword = await bcrypt.compare(newPassword, user.password);
      if (isOldPassword) throw new Error("New Password Cannot Be Old Password");

      // Salt and hash the password.
      bcrypt.genSalt(12, (error, salt) => {
        if (error) throw new Error("Salt Generation Failed");

        bcrypt.hash(newPassword, salt, async (error, hash) => {
          if (error) throw new Error("Hash Password Failure");

          // We can now save that new password.
          user.password = hash;
          await user.save();
        }); 
      });
    };

    let changedUserName = false;
    let oldUserName = user.userName;
    if (user.userName !== userName) {
      changedUserName = true;
    }

    user.userName = userName;
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;

    // Save the user and the changes.
    await user.save();

    if (changedUserName) {
      // remove from auto complete indexing
      Trie.deleteWord(oldUserName.toLowerCase());
      // add new user name
      Trie.addWord(user.userName.toLowerCase(), "user");
    }

    res.json({ success: true, message: "User Edit Successful." });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That User To Do That",
      });
    } else if (error.name === 'MongoError') {
      const needToChange = error.keyPattern;
      res.status(409).json({
        success: false,
        message: "DataBase Error",
        needToChange
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// Change Profile Picture
const changeProfileImg = async (req, res) => {
  const _id = req.params.id;
  try {
    // find the current user
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    // check if the user is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    // get the user
    const user = await db.User.findOne({ _id });

    // First see if you can process the image.
    // Check if user inputed an image.
    let profileUrl = user.profile;
    if (req.file) {
      let image = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(image);
        profileUrl = result.secure_url;
      } catch (error) {
        throw new Error("Could Not Upload To Cloudinary");
      }
    }

    user.profileUrl = profileUrl;
    await user.save();
    res.json({ success: true, message: "Profile Picture Successfuly Changed" });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That User To Do That",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Change Cover Photo
const changeCoverImg = async (req, res) => {
  const _id = req.params.id;
  try {
    // find the current user
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    // check if the user is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    // get the user
    const user = await db.User.findOne({ _id });

    // First see if you can process the image.
    // Check if user inputed an image.
    let coverUrl = user.coverUrl;
    if (req.file) {
      let image = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(image);
        coverUrl = result.secure_url;
      } catch (error) {
        throw new Error("Could Not Upload To Cloudinary");
      }
    }

    user.coverUrl = coverUrl;
    await user.save();
    res.json({ success: true, message: "Cover Picture Successfuly Changed" });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That User To Do That",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Route to Delete a User
const remove = async (req, res) => {
  // id of user to delete
  const _id = req.params.id;
  try {
    // find the current user
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    // check if user is deleting only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    const user = await db.User.findOne({ _id });
    
    // remove from auto complete indexing
    Trie.deleteWord(user.userName.toLowerCase());

    // then delete from db
    await user.delete();

    res.status(200).json({
      success: true,
      message: "User Deleted",
    });


  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That User To Do That",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Add a favorite restaurant via put
const addFavorite = async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    // First, get the userId
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    const userId = payload.id;

    const user = await db.User.findOne({ _id: userId });
    
    // Then find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id: restaurantId});
    if (!restaurant) throw new Error('No Restaurant Found');
    
    // Check if already favorited
    if (user.favorites.includes(restaurant._id)) throw new Error("Already Favorited This Restaurant");

    // Add a user favorite
    user.favorites.push(restaurant);
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

const removeFavorite = async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    // First, get the userId
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    const userId = payload.id

    const user = await db.User.findOne({ _id: userId });

    // Then find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id: restaurantId});
    if (!restaurant) throw new Error('No Restaurant Found');

    // Check if already unfavorited
    if (!user.favorites.includes(restaurant._id)) throw new Error("Restaurant Not Favorited");

    // Add a user favorite
    user.favorites.pull(restaurant);
    await user.save();

    res.json({ success: true, message: 'Restaurant Removed From Favorites' });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }  
}

// Route To Follow Someone Else
const follow = async (req, res) => {
  const otherId = req.params.otherId;
  try {
    // find "viewing" user
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    const viewer = await db.User.findOne({ _id: payload.id });
    
    // find the "other" user
    const otherUser = await db.User.findOne({ _id: otherId });
    if (!otherUser) throw new Error(`The User You're attempting To Follow Does Not Exist.`);
    
    // Check the follow status
    if (viewer.following.includes(otherUser._id)) throw new Error(`You're Already Following That User.`);
    
    // Viewer now follows otherUser
    viewer.following.push(otherUser._id);
    await viewer.save();

    // OtherUser now has a follower
    otherUser.followers.push(viewer._id);
    await otherUser.save();


    res.json({
      success: true,
      message: "Successfully Followed User"
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Route To unfollow Someone Else
const unFollow = async (req, res) => {
  const otherId = req.params.otherId;
  try {
    // find "viewing" user
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    const viewer = await db.User.findOne({ _id: payload.id });
    
    // find the "other" user
    const otherUser = await db.User.findOne({ _id: otherId });
    if (!otherUser) throw new Error(`The User You're attempting To Unfollow Does Not Exist.`);
    
    // Check the follow status
    if (!viewer.following.includes(otherUser._id)) throw new Error(`You're Not Following That User.`);
    
    // Viewer now doesn't follow otherUser
    viewer.following.pull(otherUser._id);
    await viewer.save();

    // OtherUser now doesn't have a follower
    otherUser.followers.pull(viewer._id);
    await otherUser.save();

    res.json({
      success: true,
      message: "Successfully Unfollowed User"
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// export all route functions
module.exports = {
  test,
  register,
  login,
  publicInfo,
  privateInfo,
  all,
  edit,
  remove,
  addFavorite,
  removeFavorite,
  changeProfileImg,
  changeCoverImg,
  follow,
  unFollow,
};
