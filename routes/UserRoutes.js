
const express= require('express')
const router=express.Router();
const { signup, signin,forgetPassword,resetPassword, verifyOTP } = require('../controllers/userController');

router.post('/signup',signup);
router.post('/signin',signin);

router.post('/forget-password',forgetPassword);
router.post('/verify-otp',verifyOTP);
router.post('/reset-password',resetPassword);

module.exports=router;
