// userRoute.js
const express = require('express');
const router = express();
const session = require('express-session');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use(session({ secret: 'process.env.SESSION_SECRET' ,cookie: { maxAge: 600000 }}));

router.get('/', auth.checkLogin, userController.loadIndex);
router.get('/login', auth.checkLogout, userController.loadlogin);
router.post('/login', userController.login);
router.get('/call', auth.checkLogin, userController.loadCall);
router.get('/register', auth.checkLogout, userController.loadRegister);
router.post('/register', userController.register);
router.get('/logout',auth.checkLogin,userController.logout);
module.exports = router;
