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

const oneCat = async (req, res) => {
  const _id = req.params.id
  try {
    let category = await db.Category.find({_id});
    res.json({ success: true, message:"Category found!", results: category });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        success: false,
        message: "Sorry, category doesn't exist.",
        count: 0,
        results: [],
      });
  }
};

// export all route functions
module.exports = {
  test,
  all,
  oneCat
};
