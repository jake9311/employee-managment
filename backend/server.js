require('dotenv').config();
const express= require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const {checkSickDayApprovals} = require('./controllers/guardController');







const uri= process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


function decodeJwtNoVerify(token) {
  try {
    const [, payloadB64] = token.split('.');
    const b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(Math.ceil(payloadB64.length / 4) * 4, '=');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch { return null; }
}

function attachUserFromBearer(req, _res, next) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length);
    const payload = decodeJwtNoVerify(token);
    const uid = payload?.user_id || payload?.sub;
    if (uid) req.user = { googleId: uid, email: payload?.email, name: payload?.name };
  }
  next();
}
app.use(attachUserFromBearer);








const userRoutes = require('./routes/userRoutes');
const guardRoutes = require('./routes/guardRoutes');

app.use('/api/users', userRoutes);
app.use('/api/guards', guardRoutes);
app.use('/api/users', require('./routes/userRoutes'));

mongoose.connect(uri)
.then(() => {
  const c = mongoose.connection;
  console.log('MongoDB connected:', {host: c.host, port: c.port, database: c.name});
})
.catch(err => console.log(err));

app.listen(port,()=>{
    console.log("Server is running on port ", port);
    checkSickDayApprovals();
    setInterval(checkSickDayApprovals, 24 * 60 * 60 * 1000);
    

})



// sendEmail('ymakoria@gmail.com', 'Test email', 'This is a test email');
