// Data base
const db = require("../models");

// basic test
const test = async (req, res) => {
  res.json({ success: true, message: "Category Route OK" });
};

// Get All Categories
const all = async (req, res) => {
  try {
    let categories = await db.Category.find({});
    res.json({ success: true, count: categories.length, results: categories });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        success: false,
        message: "Couldn't GET All Categories.",
        count: 0,
        results: [],
      });
  }
};

// export all route functions
module.exports = {
  test,
  all,
};
