const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// router.get("/", (req,res)=>{
//     res.send("Hey it's users route!")
// })

// router.get("/users", (req, res)=>{
//     res.send()
// })

//get user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //some properties dont need to be displayed... (following line of code not working though)
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json("You are now following this user");
      } else {
        res.status(403).json("Already following this user");
      }
    } catch (err) {res.status(500).json(err)}
  } else {
    res.status(403).json("you cannot follow yourself");
  }
});
//unfollow user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { following: req.params.id } });
          res.status(200).json("You are no longer following this user");
        } else {
          res.status(403).json("Already unfollowed this user");
        }
      } catch (err) {res.status(500).json(err)}
    } else {
      res.status(403).json("you cannot unfollow yourself");
    }
  });

//update user (via a userId)
router.put("/:id", async (req, res) => {
  //does req id match with the id param in previous line?
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //IMPORTANT: note 5
    //check password is valid
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        //update and hash the new password to update the user...
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body, //??
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Not authorized to update other's accounts");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Unauthorized");
  }
});

module.exports = router;
