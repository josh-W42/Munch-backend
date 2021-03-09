const router = require("express").Router();
const ctrl = require("../controllers");

// routes
router.get("/", ctrl.order.test);


// exports
module.exports = router;