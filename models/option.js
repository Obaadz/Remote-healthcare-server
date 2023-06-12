import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  enableHandling: Boolean,
  counter: { type: Number, default: 0 },
});

const Options = mongoose.model("Options", optionSchema);

export default Options;
