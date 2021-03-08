const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.retaurant.test);
router.get("/all", ctrl.retaurant.all);
router.get("/:id", ctrl.retaurant.profile);
router.post("/register", ctrl.retaurant.register);
router.post("/login", ctrl.retaurant.login);

module.exports = router;
