const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 TRIO backend starting...");

if (!process.env.MONGO_URI) {
  console.log("❌ MONGO_URI missing");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("✅ MongoDB connected"))
  .catch(err=>{
    console.log("❌ DB error:", err.message);
    process.exit(1);
  });

/* ================= USER ================= */
const User = mongoose.model("User", {
  tgId: String,
  username: String,
  usdt: { type: Number, default: 0 }
});

/* ================= WITHDRAW ================= */
const Withdraw = mongoose.model("Withdraw", {
  tgId: String,
  username: String,
  amount: Number,
  status: { type: String, default: "pending" }
});

/* ================= LOGIN (Telegram) ================= */
app.post("/auth", async (req,res)=>{
  let { tgId, username } = req.body;

  let user = await User.findOne({ tgId });

  if(!user){
    user = await User.create({ tgId, username });
  }

  res.json(user);
});

/* ================= ADD USDT ================= */
app.post("/add-usdt", async (req,res)=>{
  let { tgId, amount } = req.body;

  await User.updateOne(
    { tgId },
    { $inc: { usdt: amount } }
  );

  res.json({ success:true });
});

/* ================= WITHDRAW REQUEST ================= */
app.post("/withdraw", async (req,res)=>{
  let { tgId, amount } = req.body;

  const user = await User.findOne({ tgId });

  if(!user) return res.json({ error:"User not found" });

  if(user.usdt < amount) return res.json({ error:"Not enough balance" });

  await Withdraw.create({
    tgId,
    username: user.username,
    amount
  });

  res.json({ success:true });
});

/* ================= ADMIN: GET WITHDRAWALS ================= */
app.get("/withdraws", async (req,res)=>{
  const data = await Withdraw.find().sort({_id:-1});
  res.json(data);
});

/* ================= ADMIN: APPROVE ================= */
app.post("/approve", async (req,res)=>{
  let w = await Withdraw.findById(req.body.id);

  if(!w) return res.json({ error:"Not found" });

  w.status = "approved";
  await w.save();

  res.json({ success:true });
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("🚀 TRIO backend running");
});
