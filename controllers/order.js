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
  res.json({success:"true", message: 'Orders test'})
};

const createOrder = async (req, res) => {
  try {
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);

    const userId = payload.id
    const restaurantId = req.params.id;

    const items = []
    const total = 0

    const restaurant = await db.Restaurant.findOne({ _id: restaurantId })
    const user = await db.User.findOne({ _id: userId})

    for (let i = 0; i < req.body.items.length; i++) {
      let orderedItem = await restaurant.menu.id(req.body.items[i])
      total += orderedItem.price
      items.push(orderedItem)
    }

    const userOrder = await db.Order.create({
      status: 'In Progress',
      customers: user,
      restaurant: restaurant,
      products: items,
      orderTotal: total,
      Date: new Date(), 
    })
    res.json({ 
      success: true, 
      message: "Your order is successfully in progress, thank you!", 
      results: userOrder})
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to process this order"
    })
  }
} 

module.exports = {
    test,
    createOrder
  };