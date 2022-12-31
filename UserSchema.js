const mongoose=require("mongoose");
const schema=mongoose.Schema;

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
        type: String,
      }
    
})

module.exports=mongoose.model("user",userSchema);