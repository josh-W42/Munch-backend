const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.post.test);
router.get("/index", ctrl.post.postIndex);
router.get("/index/author/:id", ctrl.post.postIndexAuthor);
router.get("/index/restaurant/:id", ctrl.post.postIndexRestaurant);
router.post("/createPost/:rId/", ctrl.post.createPost);
router.post("/addComment/:pId/", ctrl.post.addNewComment);
router.get("/:id", ctrl.post.showPost)


module.exports = router;