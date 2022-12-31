const validator=require("validator");
const cleanupAndValidate=({name,password,email,username})=>{
    return new Promise((resolve,reject)=>{
        if(typeof email!="string")reject("invalid Emial");
        if(typeof name!="string")reject("invalid name");
        if(typeof password!="string")reject("Invalid Password");
        if(typeof username!="string")reject("invalid username");
        if(!email||!password||!username)reject('invalid Data');
        if(!validator.isEmail(email))reject("Invalid Email Format");
        if(username.length<3)reject("Username too short");
        if(username.length>50)reject("Username too short");
        if(password.length<5)reject("Username too short");
        if(password.length>200)reject("Username too short");
        resolve();
    })
}

module.exports={cleanupAndValidate};