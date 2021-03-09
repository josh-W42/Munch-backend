const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.restaurant.test);
router.get("/all", ctrl.restaurant.all);
router.get("/:id", ctrl.restaurant.profile);
router.post("/register", ctrl.restaurant.register);
router.post("/login", ctrl.restaurant.login);
router.put(
  "/:id/edit",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.edit
);
router.delete(
  "/:id/delete",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.remove
);

module.exports = router;
