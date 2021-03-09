const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.post.test);
router.get("/index", ctrl.post.postIndex);
router.get("/:id", ctrl.post.showPost)
router.get("/index/author/:id", ctrl.post.postIndexAuthor);
router.get("/index/restaurant/:id", ctrl.post.postIndexRestaurant);

router.post("/createPost/:id/", passport.authenticate('jwt', { session: false }), ctrl.post.createPost);
router.post("/addComment/:id/", passport.authenticate('jwt', { session: false }), ctrl.post.addNewComment);

router.put("/:id/update", passport.authenticate('jwt', { session: false }), ctrl.post.updatePost);
router.put("/:id/:cid/edit", passport.authenticate('jwt', { session: false }), ctrl.post.editComment);

router.delete("/:id/delete", passport.authenticate('jwt', { session: false }), ctrl.post.deletePost)

module.exports = router;