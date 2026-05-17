const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 CONNECT DB
mongoose.connect(process.env.MONGO_URI);

// 👤 USER MODEL
const User = mongoose.model("User", {
  tgId: String,
  username: String,
  photo: String,
  usdt: { type: Number, default: 0 }
});

// 💸 WITHDRAW MODEL
const Withdraw = mongoose.model("Withdraw", {
  tgId: String,
  username: String,
  amount: Number,
  status: { type: String, default: "pending" }
});


// 👤 CREATE / LOGIN USER
app.post("/user", async (req, res) => {
  const { tgId, username, photo } = req.body;

  let user = await User.findOne({ tgId });

  if (!user) {
    user = await User.create({ tgId, username, photo });
  }

  res.json(user);
});


// 💰 ADD USDT (game reward)
app.post("/add-usdt", async (req, res) => {
  const { tgId, amount } = req.body;

  await User.updateOne(
    { tgId },
    { $inc: { usdt: amount } }
  );

  res.json({ success: true });
});


// 💸 WITHDRAW REQUEST
app.post("/withdraw", async (req, res) => {
  const { tgId, amount } = req.body;

  const user = await User.findOne({ tgId });

  if (!user || user.usdt < amount) {
    return res.json({ error: "Not enough balance" });
  }

  await Withdraw.create({
    tgId,
    username: user.username,
    amount
  });

  res.json({ success: true });
});


// 📊 GET WITHDRAW REQUESTS (ADMIN)
app.get("/withdraws", async (req, res) => {
  const data = await Withdraw.find();
  res.json(data);
});


// ✅ APPROVE WITHDRAW (ADMIN)
app.post("/approve", async (req, res) => {
  const w = await Withdraw.findById(req.body.id);

  if (w) {
    w.status = "approved";
    await w.save();
  }

  res.json({ success: true });
});

app.listen(3000, () => console.log("🚀 Server starting...");
console.log("MONGO_URI =", process.env.MONGO_URI);
