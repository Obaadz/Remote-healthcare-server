import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import v2Routes from "./routes/v2/index.js";
import "dotenv/config";
import Pusher from "pusher";

const PORT = process.env.PORT || 5000;

const app = express();
const bodyParser = {
  urlencoded: express.urlencoded({ limit: "30mb", extended: true }),
  json: express.json({ limit: "30mb" }),
};

app.use(bodyParser.urlencoded);
app.use(bodyParser.json);
app.use(cors());

app.use(v2Routes);

export const pusher = new Pusher({
  appId: "1519353",
  key: "17e704d4e34a2978834b",
  secret: "59ad5f82551a87b7678c",
  cluster: "eu",
  useTLS: true,
});

await mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.log("ERROR while connecting to the database");
  });

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

export default app;
