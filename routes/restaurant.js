const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.restaurant.test);
router.get("/all", ctrl.restaurant.all);
router.get("/:id", ctrl.restaurant.profile);
router.post("/register", ctrl.restaurant.register);
router.post("/login", ctrl.restaurant.login);

router.post("/:id/addMenuItem", passport.authenticate('jwt', { session: false }), ctrl.restaurant.addMenuItem)

router.put(
  "/:id/edit",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.edit
);
router.put(
  "/:id/profileImg",
  passport.authenticate("jwt", { session: false }),
  uploads.single('profileImg'),
  ctrl.restaurant.changeProfileImg
);
router.put(
  "/:id/coverImg",
  passport.authenticate("jwt", { session: false }),
  uploads.single('coverImg'),
  ctrl.restaurant.changeCoverImg
);
router.delete(
  "/:id/delete",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.remove
);


module.exports = router;
