const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
  author: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  header: String,
  content: String,
  date: Date,
});

const postSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    restaraunt: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Restaraunt" },
    ],
    customer: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    postImg: [String],
    totalSpent: Number,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
