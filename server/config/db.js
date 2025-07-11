const mongoose = require('mongoose')
const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('connected to mongodb atlas')
    }catch(err){
        console.log('MongoDB connection error: ', err)
        process.exit(1)
    }
}

module.exports = connectDB;