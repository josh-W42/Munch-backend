require("dotenv").config();
// A passport strategy for authenticating with a JSON Web Token
// This allows to authenticate endpoints using a token

// As opposed to in our Sequelize app with auth,
// We'll be using the JSON Web Token Strategy as opposed to Local Strategy
const { Strategy, ExtractJwt } = require("passport-jwt");
const mongoose = require("mongoose");

const { User } = require("../models");

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
  // Add code here
  passport.use(
    new Strategy(options, async (jwt_payload, done) => {
      //  We want to find a use by an id that is inside the jwt_payload
      // When we get that use back, we check to see if the user is in database.
      try {
        const user = await User.findById(jwt_payload.id);
        // jwt_payload is an object that contains JWT info
        // done is callback that we use to return user or false.
        if (user) {
          return done(null, user);
        } else {
          throw new Error("User Not Found");
        }
      } catch (error) {
        console.error(error);
        return done(null, false);
      }
    })
  );
};
