

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const { checkSickDayApprovals } = require("./controllers/guardController");

const app = express();


const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

if (!uri) {
  console.error("MONGODB_URI is missing. Make sure backend/.env contains MONGODB_URI=...");
  process.exit(1);
}


app.use(cors({
  origin: true,       
  credentials: true
}));
app.use(express.json());


const saPath = path.join(__dirname, "secrets", "firebase-service-account.json");

if (!fs.existsSync(saPath)) {
  console.error(` Missing Firebase service account file at: ${saPath}`);
  process.exit(1);
}

const serviceAccount = require(saPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function attachUserFromBearer(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return next();

  try {
    const idToken = auth.slice("Bearer ".length);
    const decoded = await admin.auth().verifyIdToken(idToken);

    req.user = {
      googleId: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

app.use(attachUserFromBearer);

const userRoutes = require("./routes/userRoutes");
const guardRoutes = require("./routes/guardRoutes");

app.use("/api/users", userRoutes);
app.use("/api/guards", guardRoutes);

mongoose
  .connect(uri)
  .then(() => {
    const c = mongoose.connection;
    console.log("MongoDB connected:", { host: c.host, port: c.port, database: c.name });

    app.listen(port, () => {
      console.log("Server is running on port", port);
      cron.schedule("0 8 * * *", checkSickDayApprovals);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

