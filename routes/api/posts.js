const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const {check, validationResult} = require('express-validator');

//@route  POST api/posts
//@desc   Create a post
//@access Public
router.post('/', [auth, [check("text", "Text is required").not().isEmpty()]], async(req, res) => {
    const errors = validationResult(req, res);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const user  = await User.findById(req.user.id).select("-password");

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();
        res.json(post);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
    
});

//@route  GET api/posts
//@desc   Get all posts
//@access Private

router.get("/", auth, async(req, res)=>{
    try{
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//@route  GET api/posts/:id
//@desc   Get post by ID
//@access Private

router.get("/:id", auth, async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id); //Looks for the post by its id provided by the URL
        if(!post){ //If the post is not found then return 404 message
            return res.status(404).json({msg:"Post not found"});
        }
        res.json(post);
    }catch(err){
        console.error(err.message);
        if(err.kind === "ObjectId"){ //Checks if it is not the same formatted ID and if so, return a 404 message
            return res.status(404).json({msg:"Post not found"});
        }
        res.status(500).send("Server Error");
    }
});

//@route  DELETE api/posts
//@desc   Delete a post
//@access Private

router.delete("/:id", auth, async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
          }
        
        if(post.user.toString() !== req.user.id){//Checks if the user is not the owner of the post and if so, 401 message
            return res.status(401).json({msg: "User not authorized"});
        }

        await post.remove();
        res.json({msg: "Post removed"});
    }catch(err){
        console.error(err.message);
        if(err.kind === "ObjectId"){
            return res.status(404).json({msg:"Post not found"});
        }
        res.status(500).send("Server Error");
    }
});

//@route  PUT api/posts/like/:id
//@desc   Like a post
//@access Private

router.put("/like/:id", auth, async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){ //Filter through the array and checks if there is already a like 
            return res.status(400).json({msg: "Post already liked"});
        }
        
        post.likes.unshift({user:req.user.id});

        await post.save();

        res.json(post.likes);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//@route  PUT api/posts/unlike/:id
//@desc   Unlike a post
//@access Private

router.put("/unlike/:id", auth, async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){ //Filter through the array and checks if there aren't any likes
            return res.status(400).json({msg: "Post has not yet been liked"});
        }
        
        const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id); //Looks for the index of the user with a like

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//@route  POST api/posts/comment/:id
//@desc   Comment on a post
//@access Private

router.post('/comment/:id', [auth, [check("text", "Text is required").not().isEmpty()]], async(req, res) => {
    const errors = validationResult(req, res);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const user  = await User.findById(req.user.id).select("-password");
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
    
});

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Delete a comment on a post
//@access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id); //Looks through all the comments in the array until its the same comment as the comment_id from the URL
        if(!comment){ //Checks if the comment exists
            return res.status(404).json({msg: "Comment does not exist"});
        }
        if(comment.user.toString() !== req.user.id){ //Checks if the user id from the comment matches the user
            return res.status(401).json({msg: "User not authorized"}); 
        }
        const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id); //Looks for the index of the user with a comment

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;