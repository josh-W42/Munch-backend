const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.post.test);
router.get("/index", ctrl.post.postIndex);
router.post("/createPost/:rId/:uId", ctrl.post.createPost);
router.post("/addComment/:pId/:uId", ctrl.post.addNewComment);
router.get("/:id", ctrl.post.showPost)


module.exports = router;