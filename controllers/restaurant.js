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
  res.json({ message: "Restaurants endpoint OK!" });
};

// Controller for Registering a new Restaurant.
const register = async (req, res) => {
  const { name, email, password, category } = req.body;

  // Ok so this is when do things like check if an email or name already exists
  try {
    // Find the category
    const foundCategory = await db.Category.findOne({ name: category });
    if (!foundCategory) throw new Error("Category Does Not Exist");

    // Create a new user.
    const newRestaurant = await db.Restaurant.create({
      name,
      email,
      password,
      profileUrl: "",
      coverUrl: "",
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

        // add the new username to autocomplete index
        Trie.addWord(name.toLowerCase(), "restaurant");

        // Then log the restaurant in.
        const payload = {
          id: createdRestaurant._id,
          email: createdRestaurant.email,
          name: createdRestaurant.name,
          type: "restaurant",
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
              message: "Restaurant Created",
            });
        });
      });
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'MongoError') {
      const needToChange = error.keyPattern;
      res.status(409).json({
        success: false,
        message: "Database Error",
        needToChange
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
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
      id: findRestaurant._id,
      email: findRestaurant.email,
      name: findRestaurant.name,
      type: "restaurant",
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
    const restaurant = await db.Restaurant.findOne({ _id }).select('-password -email');
    // If it doesn't exist, throw an error
    if (!restaurant) throw new Error("Restaurant Does Not Exist.");

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ success: false, message: "Restaurant Does Not Exist" });
  }
};

const privateInfo = async (req, res) => {
  const _id = req.params.id;
  // Find a user with that id
  try {
    // Only give private information to a logged in restaurant.
    const [type, token] = req.headers.authorization.split(' ');
    const payload = jwt.decode(token);
    // check if the restaurant is viewing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    const restaurant = await db.Restaurant.findOne({ _id }).select('-password');
    // If it doesn't exist, throw an error
    if (!restaurant) throw new Error("Restaurant Does Not Exist.");

    res.json({ success: true, restaurant });
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
};

// Get All Restaurant Info information
const all = async (req, res) => {
  // Find All Restaurants
  try {
    // If There Is A Search. Get Results From That.
    let results = [];
    if (req.query.search) {
      let query = req.query.search.toLowerCase();
      // First determine if the query matches anything.
      let results = Trie.findSuffixes(query);

      if (results === -1) throw new Error("No Search Found!");

      let promises = results.map( async result => {
        if (result.type === 'category') {
          const category = await db.Category.findOne({ name: result.word });
          const subResults = await db.Restaurant.find({ category: category._id }).select('-password -email');

          return { isGroup: true, name: category.name, results: subResults };
        } else if (result.type === 'restaurant') {
          const re = new RegExp(result.word, "i");
          const restaurant = await db.Restaurant.findOne({ "name" : { $regex : re } }).select('-password -email');

          return restaurant;
        }
      });

      results = await Promise.all(promises);
      res.json({ success: true, count: results.length, results });

    } else {
      results = await db.Restaurant.find({}).select('-password -email');
      res.json({ success: true, count: results.length, results });
    }
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

// Route to edit a Restaurant
const edit = async (req, res) => {
  const _id = req.params.id;
  try {
    // find the current restaurant
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    // check if the restaurant is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    const { name, email, oldPassword, newPassword, category } = req.body;

    const restaurant = await db.Restaurant.findOne({ _id });

    // if restaurant submitted an oldPassword and newPassword
    if (oldPassword && newPassword) {
      // compare old password
      const isValid = await bcrypt.compare(oldPassword, restaurant.password);
      if (!isValid) throw new Error("Old Password Inccorect");

      const isOldPassword = await bcrypt.compare(
        newPassword,
        restaurant.password
      );
      if (isOldPassword) throw new Error("New Password Cannot Be Old Password");

      // Salt and hash the password.
      bcrypt.genSalt(12, (error, salt) => {
        if (error) throw new Error("Salt Generation Failed");

        bcrypt.hash(newPassword, salt, async (error, hash) => {
          if (error) throw new Error("Hash Password Failure");

          // We can now save that new password.
          restaurant.password = hash;
          await restaurant.save();
        });
      });
    }

    // Find the category
    const foundCategory = await db.Category.findOne({ name: category });
    if (!foundCategory) throw new Error("Category Does Not Exist");

    let changedName = false;
    let oldName = restaurant.name;
    if (restaurant.name !== name) {
      changedName = true;
    }

    restaurant.name = name;
    restaurant.email = email;
    restaurant.category = [foundCategory];

    // Save the restaurant and the changes.
    await restaurant.save();

    if (changedUserName) {
      // remove from auto complete indexing
      Trie.deleteWord(oldName.toLowerCase());
      // add new user name
      Trie.addWord(restaurant.name.toLowerCase(), "restaurant");
    }

    res.json({ success: true, message: "Restaurant Edit Successful." });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That Restaurant To Do That",
      });
    } else if (error.name === "MongoError") {
      const needToChange = error.keyPattern;
      res.status(409).json({
        success: false,
        message: "DataBase Error",
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

// Change Profile Picture
const changeProfileImg = async (req, res) => {
  const _id = req.params.id;
  try {
    // find the current restaurant
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    // check if the restaurant is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    // get the restaurant
    const restaurant = await db.Restaurant.findOne({ _id });

    // First see if you can process the image.
    // Check if restaurant inputed an image.
    let profileUrl = restaurant.profileUrl;
    if (req.file) {
      let image = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(image);
        profileUrl = result.secure_url;
      } catch (error) {
        throw new Error("Could Not Upload To Cloudinary");
      }
    }

    restaurant.profileUrl = profileUrl;
    await restaurant.save();
    res.json({ success: true, message: "Profile Picture Successfuly Changed" });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That restaurant To Do That",
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
    // find the current restaurant
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    // check if the restaurant is editing only themselves
    if (payload.id !== _id) throw new Error("Forbidden");

    // get the restaurant
    const restaurant = await db.Restaurant.findOne({ _id });

    // First see if you can process the image.
    // Check if restaurant inputed an image.
    let coverUrl = restaurant.coverUrl;
    if (req.file) {
      let image = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(image);
        coverUrl = result.secure_url;
      } catch (error) {
        throw new Error("Could Not Upload To Cloudinary");
      }
    }

    restaurant.coverUrl = coverUrl;
    await restaurant.save();
    res.json({ success: true, message: "Cover Picture Successfuly Changed" });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As That restaurant To Do That",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Route to Delete a Restaurant
const remove = async (req, res) => {
  const _id = req.params.id;
  try {
    // Check that restaurant is deleting themselves
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    if (payload.id !== _id) throw new Error("Forbidden");

    // find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id });

    // remove from auto complete indexing
    Trie.deleteWord(restaurant.name.toLowerCase());

    await restaurant.delete();

    res.status(200).json({
      success: true,
      message: "Restaurant Deleted",
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Forbidden") {
      res.status(403).json({
        success: false,
        message: "You Must Be logged In As This Restaurant To Do That",
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Route to add to Menu Item
const addMenuItem = async (req, res) => {

  const _id = req.params.id;
  try {
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    if (payload.id !== _id) throw new Error("Not your menu")

    // find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id })
    const { name, description, imgUrl, price, itemType } = req.body

    restaurant.menu.push({
      name,
      description,
      imgUrl,
      price,
      type: itemType
    });

    await restaurant.save();
    res.json({ 
      success: true, 
      message: "Menu item added!", 
      menuCount: restaurant.menu.length, 
      results: restaurant})
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to add to the menu"
    })
  }
} 

// Route to delete a Menu Item
const deleteMenuItem = async (req, res) => {
  
  const _id = req.params.id;
  const menuItemId = req.params.itemid;

  try {
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    if (payload.id !== _id) throw new Error("Not your menu")

    // find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id })
    // deleting the menu item
    const item = restaurant.menu.pull(menuItemId)

    await restaurant.save();
    res.json({ 
      success: true, 
      message: "Menu item deleted!", 
      menuCount: restaurant.menu.length, 
      results: restaurant})
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to delete the menu item"
    })
  }
} 
// Route to edit a Menu Item
const editMenuItem = async (req, res) => {
  
  const _id = req.params.id;
  const menuItemId = req.params.itemid;

  try {
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    if (payload.id !== _id) throw new Error("Not your menu")

    // find the restaurant
    const restaurant = await db.Restaurant.findOne({ _id })
    // finding the menu item
    const item = restaurant.menu.id(menuItemId)

    if (req.body.name) item.name = req.body.name
    if (req.body.description) item.description = req.body.description
    if (req.body.imgUrl) item.imgUrl = req.body.imgUrl
    if (req.body.price) item.price = req.body.price
    if (req.body.itemType) item.type = req.body.itemType

    await restaurant.save();
    res.json({ 
      success: true, 
      message: "Menu item updated!", 
      menuCount: restaurant.menu.length, 
      results: restaurant})
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to update the menu item"
    })
  }
}

// Find A Restaurant by Category 
const byCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    // find all restaurants with that category id
    const results = await db.Restaurant.find({ category: categoryId }).select('-password -email');

    res.json({ success: true, results, count: results.length, message: "Sucessfully Searched" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        success: false,
        results: [],
        count: 0,
        message: "Could'nt Get All By That Category",
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
  remove,
  addMenuItem,
  edit,
  changeProfileImg,
  changeCoverImg,
  editMenuItem,
  deleteMenuItem,
  byCategory,
};
