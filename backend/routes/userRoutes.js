const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    res.send('User route working');
});

router.post('/login', async (req, res) =>{
    const {googleId, name, email}= req.body;

    try{
        let user=await User.findOne({googleId: googleId});
        if (!user){
            user= new User({googleId, name, email});
            await user.save();
            console.log('user created:',user);
        }
        res.status(200).send('User logged in');
    }catch(error){
        console.error('error logging in',error);
        res.status(500).send('Server error');
    }
})

module.exports = router;
