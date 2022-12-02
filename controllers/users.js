import Users from "../models/user.js";
import Devices from "../models/device.js";

export const checkUserValidation = async (request, response) => {
  const isUserValid = (await Users.exists({
    username: request.query.username,
    password: request.query.password,
  }))
    ? true
    : false;

  if (isUserValid) response.send({ message: "user validation successed" });
  else response.send({ message: "user validation failed" });
};

export const insertUser = async (request, response) => {
  let isSuccess = true;

  const device = await Devices.findOne({ deviceId: request.body.deviceId });

  const user = new Users({
    username: request.body.username,
    device: device,
    password: request.body.password,
  });

  await user.save().catch((err) => {
    isSuccess = false;
    console.log(err.message);
  });

  if (isSuccess)
    response.status(201).send({ message: "user inserting successed" });
  else response.send({ message: "user inserting failed" });
};
