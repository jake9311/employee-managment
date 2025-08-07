const express= require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv').config();
const {checkSickDayApprovals} = require('./controllers/guardController');
const { sendEmail } = require('./utils/sendEmail');
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);






const uri= process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const guardRoutes = require('./routes/guardRoutes');

app.use('/api/users', userRoutes);
app.use('/api/guards', guardRoutes);

mongoose.connect(uri)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.listen(port,()=>{
    console.log("Server is running on port ", port);
    checkSickDayApprovals();
    // setInterval(checkSickDayApprovals, 24 * 60 * 60 * 1000);
    setInterval(checkSickDayApprovals,  60 * 1000);

})



// sendEmail('ymakoria@gmail.com', 'Test email', 'This is a test email');
