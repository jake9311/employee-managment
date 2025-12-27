const mongoose=require("mongoose");

const UserSchema= new mongoose.Schema({
    googleId: {type:String, required:true, unique: true},
    name:String,
    email:String,
    orgId: {type: String, required: true},
    role: {type: String , enum:['owner', 'admin', 'user'], default: 'user'}

});

UserSchema.index({orgId:1});

module.exports=mongoose.model("User", UserSchema);