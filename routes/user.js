const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.user.test);
router.post("/register", ctrl.user.register);
router.post("/login", ctrl.user.login);
router.get("/:id", ctrl.user.profile);

module.exports = router;
