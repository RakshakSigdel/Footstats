const express=require('express');
const dotenv=require('dotenv');

//Routes Import
const authRoutes=require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoute');
const tournamentRoutes = require('./routes/tournamentRoutes');
const clubRoutes = require('./routes/clubRoute');
const requestRoutes = require('./routes/requestRoutes');

dotenv.config();

const app=express();
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/players',playerRoutes);
app.use('/api/tournaments',tournamentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/requests', requestRoutes);
app.get('/',(req,res)=>{
    res.send('Welcome to Footstat API');
});

const PORT=process.env.PORT||5555;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});