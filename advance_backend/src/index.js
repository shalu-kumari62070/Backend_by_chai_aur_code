// require('dotenv').config()
// or
import dotenv from "dotenv";
import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import express from "express";
import connectDB from "./db/index.js";
const app = express();


dotenv.config({
    path: './env'
})


connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MONGO db connection failed !!!", error)
})



// here we use effi ;()()
// ; semicolon isliye use karte hai kyu ki agar phele wale line me semicolon na laga ho to koi error na aaye
/*( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // database connect hogaya
        app.on("error", (error) => {
            console.log("ERROR", error)
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR", error)
        throw error;
    }
})()
    */
   
//ye tha first approach db ko connect karne ka 
