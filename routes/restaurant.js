const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.retaurant.test);
router.post("/register", ctrl.retaurant.register);
router.post("/login", ctrl.retaurant.login);
router.get("/:id", ctrl.retaurant.profile);

module.exports = router;
