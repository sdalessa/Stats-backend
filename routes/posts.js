const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User")
//create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      //note 10
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("you can only update your own posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted");
    } else {
      res.status(403).json("you can only delete your own posts");
    } // note 11
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike post
router.put("/:id/likes", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Liked!");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Unliked!");
    }
    //note 12 about diff experience followers vs likes
  } catch (err) {
    res.status(500).json(err);
  }
});
//get post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get timeline posts (get all posts from a user and all those users whom the user is following)
router.get("/timeline/all/:id", async (req, res) => {  //id from the currentUser that we are querying
  try {
    //find the current user by looking at the req.body
    // console.log(req.params.id)
    const currentUser = await User.findOne({_id: req.params.id});
    // console.log(currentUser)
    // note 13
    const userPosts = await Post.find({ userId: currentUser._id }); 
    // console.log(req.body)
    // const userPost = await Post.findById(req.body.userId)
    // const onePost = await Post.find({userId: currentUser.following[0]})
    // console.log("onePost", onePost)
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    // console.log(friendPosts, "post")
    res.json(userPosts.concat(...friendPosts));
    // res.json(userPost)
    // res.json(friendPosts)
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;

//