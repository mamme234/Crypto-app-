const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =======================
   ENV CHECK (IMPORTANT)
======================= */
console.log("🚀 Starting backend...");
console.log("MONGO_URI =", process.env.MONGO_URI);

/* =======================
   SAFETY CHECK
======================= */
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in Render environment variables");
  process.exit(1);
}

/* =======================
   CONNECT MONGODB
======================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

/* =======================
   USER MODEL
======================= */
const User = mongoose.model("User", {
  tgId: String,
  username: String,
  photo: String,
  usdt: { type: Number, default: 0 }
});

/* =======================
   WITHDRAW MODEL
======================= */
const Withdraw = mongoose.model("Withdraw", {
  tgId: String,
  username: String,
  amount: Number,
  status: { type: String, default: "pending" }
});

/* =======================
   CREATE / LOGIN USER
======================= */
app.post("/user", async (req, res) => {
  const { tgId, username, photo } = req.body;

  try {
    let user = await User.findOne({ tgId });

    if (!user) {
      user = await User.create({ tgId, username, photo });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   ADD USDT (GAME REWARD)
======================= */
app.post("/add-usdt", async (req, res) => {
  const { tgId, amount } = req.body;

  try {
    await User.updateOne(
      { tgId },
      { $inc: { usdt: amount } }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   WITHDRAW REQUEST
======================= */
app.post("/withdraw", async (req, res) => {
  const { tgId, amount } = req.body;

  try {
    const user = await User.findOne({ tgId });

    if (!user) {
      return res.json({ error: "User not found" });
    }

    if (user.usdt < amount) {
      return res.json({ error: "Not enough balance" });
    }

    await Withdraw.create({
      tgId,
      username: user.username,
      amount
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   GET WITHDRAW REQUESTS (ADMIN)
======================= */
app.get("/withdraws", async (req, res) => {
  try {
    const data = await Withdraw.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   APPROVE WITHDRAW
======================= */
app.post("/approve", async (req, res) => {
  try {
    const w = await Withdraw.findById(req.body.id);

    if (!w) {
      return res.json({ error: "Not found" });
    }

    w.status = "approved";
    await w.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("🚀 Car USDT Backend Running");
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
