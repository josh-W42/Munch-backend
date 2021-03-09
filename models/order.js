const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema(
  {
    status: String,
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    products: [String],
    orderTotal: Number,
    Date: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
