const express = require('express');
const router = express.Router();
const uploadimage = require('../config/multerConfig'); // Import multer config
const { UploadPost, postComment, postLike, findPost,UserPosts,deletePost } = require('../controllers/postController');
const {Postfetch,recentPosts}=require('../controllers/postController');
const { forgetPassword } = require('../controllers/userController');
// Route to handle the image upload
router.post('/uploadpost/:userId', uploadimage.single('image'), UploadPost); // Use the upload middleware
router.get('/AllPosts', Postfetch);
router.post('/comments/:postId', postComment);
router.post('/like/:id', postLike);
router.post('/search', findPost);
router.get('/recentPosts', recentPosts);
router.get('/userpost/:userId', UserPosts);
router.post('/deletepost/:postId', deletePost);
router.post('/forget-password',forgetPassword)

module.exports = router;
