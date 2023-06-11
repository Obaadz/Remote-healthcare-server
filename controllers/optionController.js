import { pusher } from "../index.js";
import Options from "../models/option.js";

export default class OptionController {
  static async insert(req, res) {
    try {
      Options.insertMany({ enableHandling: true });
      res.send("new option has been added");
    } catch (err) {
      res.send(`error while inserting option: ${err.message}`);
    }
  }

  static async update(req, res) {
    const enableHandling = req.body.enableHandling;

    Options.updateOne(
      { _id: "648657d2a21fda2fbcbda47b" },
      {
        enableHandling,
      }
    );

    await pusher
      .trigger("handling", "handling-changed", {
        enableHandling,
      })
      .then(() => {
        console.log("SENT TO CLIENT");
      })
      .catch((err) => {
        console.log(err.message);
      });

    res.send("done");
  }

  static async get(req, res) {
    const { enableHandling } = await Options.findOne({ _id: "648657d2a21fda2fbcbda47b" });
    res.send({
      enableHandling,
    });
  }
}
