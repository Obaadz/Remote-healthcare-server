import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  enableHandling: Boolean,
});

const Options = mongoose.model("Options", optionSchema);

export default Options;
