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
const createPost = async()=> {
    // destructured post content
    const { title, body, postImg, } = req.body
    // postImg is an array of pictures
    // totalSpent ? - might have to add sum of menuItem.price?

    // finding user and restaraunt being referenced
   
    console.log('>>>>>>>>>>>>>>>>>> USER AND RESTARAUNT <<<<<<<<<<<<<<<<<<<')
    console.log(`User = ${req.params.uId}`)
    const postUser = await db.User.find({ _id : req.params.uId})
    console.log(`Restaraunt = ${req.params.rId}`)
    const postRestaraunt = await db.Restaraunt.find({ _id : req.params.rId})
    console.log('***********************************************************')

    //create new post, no comments yet
    const newPost = await db.Post.create({
      title,
      body,
      postImg,
      customer: postUser,
      restaraunt: postRestaraunt,
    })
    console.log(newPost)
  }