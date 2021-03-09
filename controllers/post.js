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
    const posts = await db.Post.find({});
    res.json({ success: true, message:"All post", count: posts.length, results: posts });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Could not GET all posts!",
      count: 0,
      return: [],
    });
  }
};

// finding a speciic post **********************
const showPost = async (req, res) => {
  const _id = req.params.id;
  // showing a specific post
  try {
    const post = await db.Post.findOne({ _id });
    res.json({ success: true, message:"Single Post", count: 1, results: post});
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Post does not exist, sorry",
    });
  }
};

// finding all post related to an author **********************
const postIndexAuthor = async (req, res) => {
  const _id = req.params.id;

  try {
    const posts = await db.Post.find({ customer: _id });

    res.json({
      success: true,
      message: "Here are all posts by this user",
      count: posts.length,
      results: posts,
    });
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
    const posts = await db.Post.find({ restaurant: _id });
    res.json({
      success: true,
      message: "Here are all post related to this restaurant",
      count: posts.length,
      results: posts,
    });
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
  const { title, content, postImg } = req.body; // destructured post content
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
        content,
        postImg,
        customer: postUser,
        restaurant: postRestaurant,
      });
      res.json(newPost);
    } else {
      res.json({ message: "Please login to post" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Unable to create this post",
    });
  }
};

// updating post *********************
const updatePost = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const [type, token] = await req.headers.authorization.split(" ");
      const payload = await jwt.decode(token);
      const userId = payload.id;
      const postFound = await db.Post.findOne({ _id: req.params.id });

      if (userId === postFound.customer.toString()) {
        console.log("we have a match");
        if (req.body.title) postFound.title = req.body.title;
        if (req.body.content) postFound.content = req.body.content;
        if (req.body.postImg) postFound.postImg = req.body.postImg;
        await postFound.save();
        res.json({
          success: true,
          message: "Post has been updated",
          results: postFound,
        });
      } else {
        res.json({ message: "You do not have permission to update this post" });
      }
    } else {
      res.json({ message: "You must be logged in to update a post you own" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error - Unable to update this post",
    });
  }
};

// editing a comment *********************
const editComment = async (req, res) => {
  try {
    console.log("edit comment route");
    const [type, token] = await req.headers.authorization.split(" ");
    const payload = await jwt.decode(token);
    const userId = payload.id;

    const postFound = await db.Post.findOne({ _id: req.params.id }); // finding the post where the comment we are targeting lives
    const commentId = req.params.cid;
    const comment = postFound.comments.id(commentId); // finding the specific comment

    if (userId === comment.author.toString()) {
      // checking if the author of the comment is the same as the current user

      if (req.body.header) comment.header = req.body.header;
      if (req.body.content) comment.content = req.body.content;
      await postFound.save();

      res.json({
        success: true,
        message: "Comment has been updated",
        results: comment,
      });
    } else {
      res.json({
        success: false,
        message: "You do not have permission to edit this comment",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error - Unable to edit this comment",
    });
  }
};

// deleting a comment *********************
const deleteComment = async (req, res) => {
  try {
    console.log("delete comment route");
    const [type, token] = await req.headers.authorization.split(" ");
    const payload = await jwt.decode(token);
    const userId = payload.id;

    const postFound = await db.Post.findOne({ _id: req.params.id }); // finding the post where the comment we are targeting lives
    const commentId = req.params.cid;
    const comment = postFound.comments.id(commentId); // finding the specific comment

    if (userId === comment.author.toString()) {
      // checking if the author of the comment is the same as the current user

      postFound.comments.pull(commentId)
      await postFound.save();

      res.json({
        success: true,
        message: "Comment has been deleted",
        results: postFound,
      });
    } else {
      res.json({
        success: false,
        message: "You do not have permission to delete this comment",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error - Unable to edit this comment",
    });
  }
};

// deleting post *********************
const deletePost = async (req, res) => {
  console.log("You are trying to delete something");
  try {
    if (req.headers.authorization) {
      const [type, token] = await req.headers.authorization.split(" ");
      const payload = await jwt.decode(token);
      const userId = payload.id;
      const postFound = await db.Post.findOne({ _id: req.params.id });

      if (userId === postFound.customer.toString()) {
        await db.Post.deleteOne({ _id: postFound._id });
        res.json({ success: "true", message: "Post has been deleted" });
      } else {
        res.json({
          success: "false",
          message: "You do not have permission to delete this post",
        });
      }
    } else {
      res.json({
        success: "false",
        message: "You must be logged in to delete a post you own",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error - Unable to delete this post",
    });
  }
};

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
      res.json({ message: "Please login to comment" });
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
  showPost,
  postIndex,
  postIndexAuthor,
  postIndexRestaurant,
  createPost,
  updatePost,
  deletePost,
  addNewComment,
  editComment,
  deleteComment,
};
