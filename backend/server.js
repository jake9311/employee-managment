require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const { checkSickDayApprovals } = require('./controllers/guardController');

const app = express();

const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

if (!uri) {
  console.error('MONGO_URI is missing. Make sure backend/.env contains MONGO_URI=...');
  process.exit(1);
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use((err, req, res, next) => {
  console.error(' Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.use(express.json());

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim() !== '') {
  try{
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch(e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Ensure it is valid JSON.', e);
    process.exit(1);
  }
} else {
  const saPath = path.join(__dirname, 'secrets', 'firebase-service-account.json');

  if (!fs.existsSync(saPath)) {
    console.error(`Missing Firebase service account file at: ${saPath}
Set FIREBASE_SERVICE_ACCOUNT_JSON in production, or place the json file in backend/secrets for local dev.`);
    process.exit(1);
  }

  serviceAccount = require(saPath);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function attachUserFromBearer(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return next();

  try {
    const idToken = auth.slice('Bearer '.length);
    const decoded = await admin.auth().verifyIdToken(idToken);

    req.user = {
      googleId: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

app.use(attachUserFromBearer);
app.get("/health", (req, res) => res.send("OK"));


const userRoutes = require('./routes/userRoutes');
const guardRoutes = require('./routes/guardRoutes');

app.use('/api/users', userRoutes);
app.use('/api/guards', guardRoutes);

mongoose
  .connect(uri)
  .then(() => {
    const c = mongoose.connection;
    console.log('MongoDB connected:', {
      host: c.host,
      port: c.port,
      database: c.name,
    });

    app.listen(port, () => {
      console.log('Server is running on port', port);
    });
    cron.schedule(
      '* * * * *',
      async () => {
        console.log('Running sick day approval check...');
        try {
          await checkSickDayApprovals();
          console.log('Sick day check completed successfully');
        } catch (err) {
          console.error('Error running sick day check:', err);
        }
      },
      { timezone: 'Asia/Jerusalem' }
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
