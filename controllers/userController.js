
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
// const Chat=require('../models/')
const session = require('express-session');

const loadIndex=async(req,res)=>{
    try {
        const users = (await User.find({}, 'username')).map(user => user.username);
        res.render('index',{ username: req.session.user, users });
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadlogin= async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
const loadCall= async(req,res)=>{
    try {
        res.render('call')
    } catch (error) {
        console.log(error.message);
    }
}
const login=async (req,res)=>{
        try {
            const userData= await User.findOne({username:req.body.username});
            if(userData){
                const checkPass= await bcrypt.compare(req.body.password,userData.password)
                if(checkPass){
                    req.session.user=req.body.username;//
                    res.redirect('/');
                }
                else{
                    res.render('login',{message:'Password is Incorrect!'});
                }
            }
            else{
                res.render('login',{message:'Username is Incorrect!'})
            }
        } catch (error) {
            console.log(error.message);
        }
}
const loadRegister = async(req,res)=>{
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
};
const register= async(req,res)=>{
    try {
        const userData= await User.findOne({username:req.body.username});
        if(userData){
            res.render('register',{success:false,message:'Username is already exists!'})
        }
        else{
            const passwordHash= await bcrypt.hash(req.body.password,10);
            const users = new User({
                name: req.body.name,
                email: req.body.email,
                username:req.body.username,
                password: passwordHash
            })
            await users.save();
            res.render('register',{ success:true, message: 'Your Registration has beend Completed!' });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const logout = async(req, res) =>{
    try {
        req.session.destroy();
        return res.redirect('login');
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadIndex,
    loadlogin,
    loadRegister,
    login,
    register,
    logout,
    loadCall,
}