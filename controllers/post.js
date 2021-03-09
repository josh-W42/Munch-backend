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
  // How to structure and decode a token from authorization
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(" ");
    const payload = jwt.decode(token);
    res.json({ authorized: true, payload });
  } else {
    res.json({ authorized: false });
  }
};

// finding all post ******************
const postIndex = async (req, res) => {
  try {
    const allPost = await db.Post.find({});
    res.json(allPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Could not GET all posts!",
      count: 0,
      results: [],
    });
  }
};

// finding a speciic post **********************
const showPost = async (req, res) => {
  const _id = req.params.id;
  // showing a specific post
  try {
    const post = await db.Post.findOne({ _id });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Post does not exist",
    });
  }
};

// finding all post related to an author **********************
const postIndexAuthor = async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await db.Post.find({ customer: _id });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Can't find any post related to that user",
    });
  }
};

// finding all post related to an restaurant **********************
const postIndexRestaurant = async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await db.Post.find({ restaurant: _id });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Can't find any post related to that restaurant",
    });
  }
};

// creating post *********************
const createPost = async (req, res) => {
  const { title, body, postImg } = req.body; // destructured post content
  try {
    if (req.headers.authorization) {
      const [type, token] = await req.headers.authorization.split(" ");
      const payload = await jwt.decode(token);
      const userId = payload.id;
      const restaurantId = req.params.id;

      const postUser = await db.User.findOne({ _id: userId });
      if (!postUser) throw new Error("User Does Not Exist.");
      const postRestaurant = await db.Restaurant.findOne({ _id: restaurantId });
      if (!postRestaurant) throw new Error("Restaurant Does Not Exist.");

      //create new post, no comments yet
      const newPost = await db.Post.create({
        title,
        body,
        postImg,
        customer: postUser,
        restaurant: postRestaurant,
      });
      res.json(newPost);
    } else {
      res.json({ message: 'Please login to post' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to create this post",
    });
  }
};

// deleting post *********************
const deletePost = async (req, res) => {
    console.log('You are trying to delete something')
    try {
        if(req.headers.authorization) {
            const [type, token] = await req.headers.authorization.split(" ");
            const payload = await jwt.decode(token);
            const userId = payload.id
            const postFound = await db.Post.findOne({_id: req.params.id})

            if (userId === postFound.customer.toString()) {
                console.log('we have a match')
                await db.Post.deleteOne({ _id: postFound._id})
                res.json({message: 'Post has been deleted'})

            } else {
                res.json({ message: "You do not have permission to delete this post"})
            }
        } else {
            res.json({ message: "You must be logged in to delete a post you own"})
        }
    } catch(error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Error - Unable to delete this post"
        })
    }
}
// adding a new comment *******************
const addNewComment = async (req, res) => {
  const { header, content } = req.body; // destructured comment content

  try {
    if (req.headers.authorization) {
      const [type, token] = await req.headers.authorization.split(" ");
      const payload = await jwt.decode(token);
      const authorId = payload.id;
      const commentAuthor = await db.User.find({ _id: authorId });
      const postId = req.params.id;

      const foundPost = await db.Post.findOne({ _id: postId });
      if (!foundPost) throw new Error("Sorry this post doesn't exist");

      foundPost.comments.push({
        author: commentAuthor,
        header,
        content,
        date: new Date(),
      });

      await foundPost.save();
      res.json(foundPost);
    } else {
        res.json({message: 'Please login to comment'})
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to add this comment",
    });
  }
};

// export all route functions
module.exports = {
  test,
  postIndex,
  postIndexAuthor,
  postIndexRestaurant,
  createPost,
  addNewComment,
  showPost,
  deletePost,
};
