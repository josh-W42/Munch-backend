// Imports
require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
require("./config/passport")(passport);

// App Set up
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // JSON parsing
app.use(cors()); // allow all CORS requests
app.use(passport.initialize());
app.use(express.static(path.resolve(__dirname, "clients", "build")));

// API Routes
app.get("/api/", (req, res) => {
  res.json({
    name: "Munch API",
    greeting: "Welcome to the Munch API",
    authors: "Andrew Bith, Nelson J Valerio, Joshua Wilson",
    message: "Hello from the Munch Team!",
  });
});

app.use("/api/users", routes.user);
app.use("/api/restaurants", routes.restaurant);

// Server
const server = app.listen(PORT, () =>
  console.log(`Server is running on PORT: ${PORT}`)
);

module.exports = server;
