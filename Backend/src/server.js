const express=require('express');
const dotenv=require('dotenv');
const authRoutes=require('./routes/authRoutes');
const platerRoutes = require('./routes/playerRoute');
dotenv.config();

const app=express();
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api',platerRoutes)

app.get('/',(req,res)=>{
    res.send('Welcome to Footstat API');
});

const PORT=process.env.PORT||5555;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});