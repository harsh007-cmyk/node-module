const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const userSchema=require("./UserSchema")
const mongoose=require("mongoose");
const {cleanupAndValidate}=require('./utils/AuthUtils');
app.set("view engine","ejs");




mongoose.set("strictQuery", false);
// const mongoURI = `mongodb+srv://harshpalathingal:123456@cluster0.f9qhsx9.mongodb.net/auth`; 
const mongoURI = `mongodb+srv://harshp:134679@cluster0.qfstkgu.mongodb.net/?retryWrites=true&w=majority`;           
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect to DB successfully");
  })
  .catch((err) => {
    console.log("Hellow");
    console.log("Failed to connect", err);
  });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/",(req,res)=>{
    res.send("Welcome to my app");
})

app.get("/login",(req,res)=>{
    res.render("Login");
})
app.get("/register",(req,res)=>{
    res.render("Register");
})
app.post("/login",async (req,res)=>{
    const {loginId,password}=req.body;
    if(typeof loginId!='String'||typeof password!='String'|| !loginId||!password)
    {
      return res.send({
        status:400,
        message:"Invalid Data"
      })
    }

    let userDb
    try{
      if(validator.isEmail(loginId)){
        userDb=await userSchema.findOne({email:loginId});
      }else{
        userDb=await userSchema.findOne({username:loginId});
      }
      console.log(userDb);
      if(!userDb){
        return res.send({
          status:40,
          message:"User not found, Please register first",
          error:err,
        })
      }else{
        return res.send({
          status:200,
          message:"User not found, Please register first",
        })
      }

    }catch(err){
      return res.send({
        status:400,
        message:"Internal server error, Please login aga"
      })
    }

})
app.post("/register",async(req,res)=>{
   const{name,username,password,email}=req.body;
   console.log((req.body));

   try{
    await cleanupAndValidate({name,username,password,email});
   }catch(err){
    return res.send({
        status:400,message:err,
    })
   }

   const hashedPassword=await bcrypt.hash(password,7);
   console.log(hashedPassword,"hashpass");

   let userExist;
   try{
    userExist=await userSchema.findOne({email});
   }
   catch(err){
    return res.send({
      status:400,
      message:"Internal server error, Please try again",
      error:err
    })
   }

   if(userExist){
    return res.send({
      status:400,
      message:"User already exists",
     
    })
   }

   let user=new userSchema({
    name:name,
    username:username,
    password:hashedPassword,
    email:email,
   })
   console.log(user);

   try{
    const usrDb=await user.save();
    console.log("User",usrDb);
    return res.send({
        status:200,
        message:"Registered successfully",
       
       })
   }catch(err){
    console.log(err);
        return res.send({
            status:400,
            message:"Internal Server Error, Please try again",
            error:err,
        })
   }

  
})

app.listen(8000,()=>{
    console.log("Listening on port 8000");
})
   
