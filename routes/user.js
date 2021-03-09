const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.user.test);
router.get("/all", ctrl.user.all);
router.get("/:id", ctrl.user.profile);
router.post("/register", ctrl.user.register);
router.post("/login", ctrl.user.login);
router.put("/addFavorite/:restaurantId", passport.authenticate('jwt', { session: false }), ctrl.user.addFavorite);
router.delete("/:id/delete", passport.authenticate('jwt', { session: false }), ctrl.user.remove);

module.exports = router;
