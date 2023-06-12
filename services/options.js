import Options from "../models/option.js";

export async function checkIfHandlingEnabled() {
  try {
    const { enableHandling } = await Options.findOne({ _id: "648657d2a21fda2fbcbda47b" });
    console.log("TEEEST", enableHandling);
    return enableHandling ? true : false;
  } catch (err) {
    return true;
  }
}
