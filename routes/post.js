const router = require("express").Router();
const ctrl = require("../controllers");
const passport = require("passport");

router.get("/test", ctrl.post.test);
router.get("/index", ctrl.post.postIndex);
router.post("/createPost/:rId/:uId", ctrl.post.createPost);
router.post("/comment/:pId/uId", ctrl.post.addNewComment);

module.exports = router;