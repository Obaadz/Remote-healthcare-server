import Options from "../models/option.js";

export async function getOptions() {
  try {
    const options = await Options.findOne({ _id: "648657d2a21fda2fbcbda47b" });
    return { options, enableHandling: options.enableHandling };
  } catch (err) {
    return { options: {}, enableHandling: true };
  }
}

export async function increamentCounter() {
  try {
    await Options.updateOne(
      { _id: "648657d2a21fda2fbcbda47b" },
      { $inc: { counter: 1 } }
    );
  } catch (err) {
    console.log(err.message);
  }
}

export async function setCounterToZero() {
  try {
    await Options.updateOne({ _id: "648657d2a21fda2fbcbda47b" }, { counter: 0 });
  } catch (err) {
    console.log(err.message);
  }
}
