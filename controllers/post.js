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

// creating post
const createPost = async () => {

  const { title, body, postImg } = req.body;   // destructured post content
  // postImg is an array of pictures
  // totalSpent ? - might have to add sum of menuItem.price?

  // finding user and restaraunt being referenced
    const userId = req.params.uId
    const restarauntId = req.params.rId
  console.log(">>>>>>>>>>>>>>>>>> USER AND RESTARAUNT <<<<<<<<<<<<<<<<<<<");
  const postUser = await db.User.find({ _id: userId });
  const postRestaraunt = await db.Restaraunt.find({ _id: restarauntId });
  console.log("***********************************************************");

  //create new post, no comments yet
  const newPost = await db.Post.create({
    title,
    body,
    postImg,
    customer: postUser,
    restaraunt: postRestaraunt,
  });
  console.log(newPost);
};

const addNewComment = async () => {
  // finding author of comment
  // instead of linking an author to a user - we can make this an input field as well? 
  const authorId = req.params.authId;
  const commentAuthor = await db.User.find({ _id: authorId });

  const { header, content } = req.body;   // destructured comment content

  //find a post
  const postId = req.params.pId
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

  console.log(foundPost);
};

// export all route functions
module.exports = {
  test,
  createPost,
  addNewComment,
};
