const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const userSchema=require("./UserSchema")
const mongoose=require("mongoose");
const {cleanupAndValidate}=require('./utils/AuthUtils');
app.set("view engine","ejs");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);

const isAuth = require("./middleware");


mongoose.set("strictQuery", false);
const mongoURI = `mongodb+srv://harshp:134679@cluster0.qfstkgu.mongodb.net/project-new`;           
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

const store = new mongoDBSession({
  uri: mongoURI,
  collection: "sessions",
});

console.log("1");

app.use(
  session({
    secret: "hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

console.log("2");


app.get("/",(req,res)=>{
    res.send("Welcome to my app");
})

console.log('3');
app.get("/login",(req,res)=>{
    res.render("Login");
})
app.get("/register",(req,res)=>{
    res.render("Register");
})
app.post("/login",async (req,res)=>{
    const {loginId,password}=req.body;
    console.log(loginId,password,"psslgnin");
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
          status:400,
          message:"User not found, Please register first",
          error:err,
        })
      }

      const isMatch=await bcrypt.compare(password,userDb.password);

      if(!isMatch){
        return res.send({
          status:400,
          message:"Invaid Password",
          date:req.body,
        })
      }
    

      req.session.isAuth=true;
      req.session.user={
        username:userDb.username,
        email:userDb.email,
        userId:userDb._id,
      }
      res.redirect("/dashboard");    
    }catch(err){
      return res.send({
        status:400,
        message:"Internal server error, Please login again"
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

  

   let user=new userSchema({
    name:name,
    username:username,
    password:hashedPassword,
    email:email,
   })
   console.log(user);

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

   try{
    const usrDb=await user.save();
    console.log("User",usrDb);
    return res.redirect('/login');
   }catch(err){
    console.log(err);
        return res.send({
            status:400,
            message:"Internal Server Error, Please try again",
            error:err,
        })
   }

  
})

app.get("/home", isAuth, (req, res) => {
  if (req.session.isAuth) {
    return res.send({
      message: "This is your home page",
    });
  } else {
    return res.send({
      message: "Please Logged in again",
    });
  }
});

app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;

    res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  console.log(req.session.user.username);
  const username = req.session.user.username;
  const Schema = mongoose.Schema;
  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const SesisonModel = mongoose.model("session", sessionSchema);

  try {
    const sessionDb = await SesisonModel.deleteMany({
      "session.user.username": username,
    });
    console.log(sessionDb);
    return res.send({
      status: 200,
      message: "Logged out from all devices",
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Logout from all devices failed",
      error: err,
    });
  }
});

app.get("/dashboard", isAuth, (req, res) => {
  return res.render("profile");
});



app.listen(8000,()=>{
    console.log("Listening on port 8000");
})
   
