const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const LikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  category: { type: String, required: true },
  // image: { type: String, required: true },
  story: { type: String, required: true },
  comments: [CommentSchema],  // Array of comments
  like:[LikeSchema],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
