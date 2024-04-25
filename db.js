const mongoose = require("mongoose");
const mongoURI = (`${process.env.MONGODB_KEY}`)

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connected to Mongo Successfully")
    })
}

module.exports = connectToMongo;