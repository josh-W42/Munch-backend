const router = require("express").Router();
const ctrl = require("../controllers");

// routes
router.get("/all", ctrl.category.all);

// exports
module.exports = router;