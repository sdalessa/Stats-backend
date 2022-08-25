const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    //generate pwd
    const salt = await bcrypt.genSalt(10);
    const hashedPsw = await bcrypt.hash(req.body.password, salt);
    // create newUser
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPsw,
    });
    //save user and return res
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("not found");
    //brypt to compare the entered and the actual pswds
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});
//ridiculous when I make it async it does not work
// router.get("/register",  (req, res)=> {
//     const user =  new User({
//         username: "John",
//         email: "john@gmail.vom",
//         password: "123456"
//     })
//      user.save()
//     res.send("oky doks")
// });
// router.get("/", (req,res)=>{
//     res.send("Hey it's auth route!")
// })
//REGISTER
//  router.get("/register", (req, res)=> {
//      const newUser = ({
//          username: "John",
//          email: "john@gmail.vom",
//          password: "123456"
//      })
//       User.create(newUser)
//      res.send("ok")
//  });
module.exports = router;
