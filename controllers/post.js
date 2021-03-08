// imports
require("dotenv").config();

// Not too sure if we'll need bcrypt and jwt
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// Data base
const db = require("../models");

// basic test
const test = async (req, res) => {
  res.json({ message: "User endpoint OK!" });
};

// finding all post ******************
const postIndex = async (req, res) => {
  const allPost = await db.Post.find({});
  res.json(allPost);
};

// finding a speciic post **********************
const showPost = async (req, res) => {
    const _id = req.params.id;
    const post = await db.Post.findOne({ _id })
    res.json(post)
    console.log(post)
}

// finding all post related to an author **********************
const postIndexAuthor = async (req, res) => {
    const _id = req.params.id;
    const post = await db.Post.find({ customer: _id })
    res.json(post)
    console.log(post)
}

// finding all post related to an restaurant **********************
const postIndexRestaurant = async (req, res) => {
    const _id = req.params.id;
    const post = await db.Post.find({ restaurant: _id })
    res.json(post)
    console.log(post)
}

// creating post *********************
const createPost = async (req, res) => {
  const { title, body, postImg } = req.body; // destructured post content
  // postImg is an array of pictures
  // totalSpent ? - might have to add sum of menuItem.price?

  // finding user and retaurant being referenced
  const userId = req.params.uId;
  const restaurantId = req.params.rId;
  console.log(">>>>>>>>>>>>>>>>>> USER AND retaurant <<<<<<<<<<<<<<<<<<<");
  const postUser = await db.User.findOne({ _id: userId });
  const postrestaurant = await db.Restaurant.findOne({ _id: restaurantId });
  console.log("***********************************************************");

  //create new post, no comments yet
  const newPost = await db.Post.create({
    title,
    body,
    postImg,
    customer: postUser,
    retaurant: postrestaurant,
  });
  res.json(newPost);
  console.log(newPost);
};

// adding a new comment *******************
const addNewComment = async (req, res) => {
    console.log('ADDING NEW COMMENT ROUTE')
  // finding author of comment
  // instead of linking an author to a user - we can make this an input field as well?
  const authorId = req.params.uId;
  const commentAuthor = await db.User.find({ _id: authorId });

  const { header, content } = req.body; // destructured comment content

  //find a post
  const postId = req.params.pId;
  const foundPost = await db.Post.findOne({ _id: postId });
  console.log(foundPost);
  //use mongooses push method on foundPost.comments
  foundPost.comments.push({
    author: commentAuthor,
    header,
    content,
    date: new Date(),
  });

  //save it - this takes time .save()
  await foundPost.save();

  res.json(foundPost);
  console.log(foundPost);
};


// export all route functions
module.exports = {
  test,
  postIndex,
  postIndexAuthor,
  postIndexRestaurant,
  createPost,
  addNewComment,
  showPost
};
