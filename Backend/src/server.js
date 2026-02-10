const express=require('express');
const dotenv=require('dotenv');
const cors = require('cors');

//Routes Import
const authRoutes=require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoute');
const tournamentRoutes = require('./routes/tournamentRoutes');
const clubRoutes = require('./routes/clubRoute');

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/players',playerRoutes);
app.use('/api/tournaments',tournamentRoutes);
app.use('/api/clubs', clubRoutes);
app.get('/',(req,res)=>{
    res.send('Welcome to Footstat API');
});

const PORT=process.env.PORT||5555;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});