const Post = require('../models/PostSchema');
const UploadPost = async (req, res) => {
    try {
      const { category, story,username } = req.body;
      const { userId } = req.params; // Access form data
      // const image = req.file.path; // Get the uploaded image's path
  
      const newPost = new Post({
        userId,
        username,
        category,
        story,
        // image, // Save the image path in the database
      });
  
      await newPost.save();
      res.status(201).json({ message: 'Post uploaded successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload post' });
    }
  };
  const Postfetch = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'comments', // Assuming comments is an array in the Post model
                populate: {
                    path: 'userId', // Populate userId in comments
                    select: 'username', // Select only the username field
                },
            });
        
        res.status(200).json(posts); // Send the posts as a JSON response
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};



// Function to post a comment
const postComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, commentText } = req.body;

  if (!userId || !commentText) {
    return res.status(400).json({ message: 'User ID and comment text are required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Create a new comment object
    const newComment = {
      userId,
      commentText,
      createdAt: Date.now(),
      replies: []  // Initialize replies as empty
    };

    // Push the new comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    // Populate the userId in the comments to get the full user details
    const populatedPost = await Post.findById(postId).populate('comments.userId'); // Populate userId

    // Send the populated comments in the response
    res.status(201).json({
      message: 'Comment added successfully',
      commentCount: populatedPost.comments.length,
      comments: populatedPost.comments // Send populated comments
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


const postLike = async (req, res) => {
  const { userId } = req.body; // Correctly access userId from req.body
  const postId = req.params.id; // Get postId from route params

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user already liked the post
    const existingLike = post.like.find((like) => like.userId.toString() === userId);

    if (existingLike) {
      // If the user already liked the post, remove the like
      post.like = post.like.filter((like) => like.userId.toString() !== userId);
      await post.save();
      return res.status(200).json({ message: 'Like removed', likeCount: post.like.length });
    }
    const newLike = {
      userId,
      createdAt: Date.now(),
    };

    post.like.push(newLike); // Push the new like into the array
    await post.save(); // Save the updated post

    res.status(201).json({ message: 'Like added successfully', likeCount: post.like.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};



const findPost = async (req, res) => {
  const { searchQuery } = req.body;

  // Ensure that the searchQuery is provided
  if (!searchQuery || searchQuery.trim() === '') {
    return res.status(400).json({ message: 'Search query cannot be empty' });
  }

  try {
    // Construct the regex pattern for each letter in the search query
    // For example, searchQuery "zoi" becomes: "z.*o.*i"
    const pattern = searchQuery.split('').join('.*');
    const regex = new RegExp(pattern, 'i'); // Case-insensitive search

    // First, try searching for posts that match the username field
    let posts = await Post.find({
      username: regex, // Searching in username
    });

    // If no posts are found in the username field, search in category
    if (posts.length === 0) {
      posts = await Post.find({
        category: regex, // Searching in category
      });
    }

    // Return an empty array if no posts are found after searching both fields
    if (posts.length === 0) {
      return res.status(200).json([]); // Returning an empty array for consistency
    }

    // Return the found posts
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'An error occurred while searching posts' });
  }
};


const recentPosts = async (req, res) => {
  try {
    // Calculate the date one week ago from now
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch posts created within the last week
    const recentPosts = await Post.find({ createdAt: { $gte: oneWeekAgo } }) // Adjust the field name if needed
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate('userId') // Populate the user details for the post
      .populate('comments.userId', 'username'); // Populate the userId inside comments with just the username

    res.status(200).json(recentPosts);
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({ message: 'Failed to fetch recent posts' });
  }
};


const UserPosts = async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters

  try {
    // Find posts that belong to the specific userId
    const posts = await Post.find({ userId }) // Filter by userId
      .populate({
        path: 'comments', // Assuming comments is an array in the Post model
        populate: {
          path: 'userId', // Populate userId in comments
          select: 'username', // Select only the username field
        },
      });

    res.status(200).json(posts); // Send the posts as a JSON response
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};



// Controller function to handle post deletion
const deletePost = async (req, res) => {
  const { postId } = req.params;
  
  try {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};



// Function to post a reply to a comment
const postReply = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, replyText } = req.body;

  if (!userId || !replyText) {
      return res.status(400).json({ message: 'User ID and reply text are required' });
  }

  try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      const newReply = {
          userId,
          replyText,
          createdAt: Date.now()
      };

      comment.replies.push(newReply);
      await post.save();

      res.status(201).json({ message: 'Reply added successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};




  module.exports = { UploadPost, Postfetch,  postComment, postLike,findPost,recentPosts,UserPosts,deletePost };

