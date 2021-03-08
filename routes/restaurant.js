const router = require('express').Router();
const ctrl = require('../controllers');
const passport = require('passport');


router.get('/test', ctrl.restaraunt.test);
router.post('/register', ctrl.restaraunt.register);
router.post('/login', ctrl.restaraunt.login);
router.get('/profile', passport.authenticate('jwt', { session: false }), ctrl.restaraunt.profile);

module.exports = router;