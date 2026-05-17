require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{

  res.send("Shadow Dream Backend Running");

});

app.get("/player", (req,res)=>{

  res.json({
    success:true,
    money:1000,
    reputation:5
  });

});

const PORT =
process.env.PORT || 5000;

app.listen(PORT, ()=>{

  console.log(
    "Server running on " + PORT
  );

});
