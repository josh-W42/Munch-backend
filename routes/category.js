const router = require("express").Router();
const ctrl = require("../controllers");

// routes
router.get("/all", ctrl.category.all);
router.get("/:id", ctrl.category.oneCat);

// exports
module.exports = router;