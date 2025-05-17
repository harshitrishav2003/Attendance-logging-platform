require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
let URI="mongodb+srv://harshitrishav987:hsVSQaWJ3Hkiucoy@cluster0.8nbzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Error: " + err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
