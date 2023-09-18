const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const app = express();

// Users in mongoDB
const UserSchema = new mongoose.Schema( {
    firstName : String ,
    lastName : String , 
    email : String
});

// Posts in mongoDB
const PostSchema = new mongoose.Schema( {
    title: String,
    author: String,
    date: { type: Date, default: Date.now }, // Use Date data type with default value
    content: String
});

// create a model for users 
const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

const users = new Set();
const posts = new Set();

app.use(express.json()); // connect to the mongoose 
app.get('/', (req, res) => {
    res.send(`Hello & welcome!`);
    users.add(req.query.name);
});

app.post("/hello/:user_name" , (req,res) => {
    res.send(`Hello ${req.params.user_name}`);
    console.log("trying post method ")
    users.add(req.params.user_name);
})
 
app.post('/users', async (req, res) => {

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email : req.body.email
    });
    await user.save();
    
    res.send(user);
  });

//get all users 
app.get('/users', async (req, res) => {
    const allUser = await User.find();
    res.json(allUser);
});

// get user by email
app.get('/user/:email', async (req, res) => {
    const thisUser = await User.find({ email: req.params.email });
    res.json(thisUser);
});

//Create Post & saving to DB 
app.post('/posts' , async (req, res) => {
    const post = new Post( {
        title: req.body.title,
        author: req.body.author,
        date: new Date(),   // time value 
        content: req.body.content
    });

    await post.save();
   
    res.send(post);
});

//Get all posts & sorted by Date
app.get('/posts/', async (req, res) => {
    try {
        let query = {};
       
        if ( req.query.author != null) {
            query = req.query.author;
        }

        const sortedPosts = await Post.find(query).sort({ date: -1 }); // Sort by 'date' field in descending order
        res.json(sortedPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log("error");
    }
});

//Get post by Author
app.get('/posts/user=:author', async (req, res) => {
    try {
    const userPosts = await Post.find({author : req.params.author});
    console.log("Get post by Author/Email");
    console.log(userPosts)
    res.json(userPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// /posts?autor=tomer
// /posts/:id
// /forums/:forum_id/threads/:thread_id

//Get a post by ID
app.get('/posts/:id', async (req, res) => {
    const post = await Post.find({_id:req.params.id});
    console.log(post);
    res.json(post);
});

//Get post by title
app.get('/posts/title/:title', async (req, res) => {
    const postByTitle = await Post.find({ title : req.params.title });
    console.log(postByTitle);
    res.json(postByTitle);
});

//Delete a post
app.delete('/posts/:post_id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndRemove(req.params.post_id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted', deletedPost });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
});

//failed attempt by almog
//let address = process.env.MONGO_URI ?? 'localhost';

// Connect to MongoDB using the service name defined in Docker Compose
const mongoDBURL = process.env.MONGO_URL || 'mongodb://mongodb-container:27017/users_db';

mongoose.connect(mongoDBURL);

// mongoose.connect(`mongodb://mongodb-container:27017/users_db`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// async function main() {
//     console.log("Connecting to DB");
//     await mongoose.connect('mongodb://localhost:27017/users_db')
//     console.log("Connected to DB");
//     app.listen(3000, () => console.log('servers is up & listen from post ' + port));
// }

// main().catch(err => console.error(err));


