const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");
const multer = require("multer");
const uploads = multer({ dest: "./uploads" });

router.get("/test", ctrl.restaurant.test);
router.get("/all", ctrl.restaurant.all);
router.get("/all/:categoryId", ctrl.restaurant.byCategory);
router.get("/:id/public", ctrl.restaurant.publicInfo);
router.get(
  "/:id/private",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.privateInfo
);

router.post("/register", ctrl.restaurant.register);
router.post("/login", ctrl.restaurant.login);
router.post(
  "/:id/addMenuItem",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.addMenuItem
);
router.put(
  "/:id/:itemid/editMenuItem",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.editMenuItem
);

router.put(
  "/:id/edit",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.edit
);
router.put(
  "/:id/profileImg",
  passport.authenticate("jwt", { session: false }),
  uploads.single("profileImg"),
  ctrl.restaurant.changeProfileImg
);
router.put(
  "/:id/coverImg",
  passport.authenticate("jwt", { session: false }),
  uploads.single("coverImg"),
  ctrl.restaurant.changeCoverImg
);

router.delete(
  "/:id/delete",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.remove
);
router.delete(
  "/:id/:itemid/delete",
  passport.authenticate("jwt", { session: false }),
  ctrl.restaurant.deleteMenuItem
);

module.exports = router;
