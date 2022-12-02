import Users from "../models/user.js";
import Devices from "../models/device.js";

export const checkUserValidation = async (request, response) => {
  const isUserValid = (await Users.exists({
    username: request.query.username,
    password: request.query.password,
  }))
    ? true
    : false;

  if (isUserValid)
    response.send({ message: "user validation successed", isSuccess });
  else response.send({ message: "user validation failed", isSuccess });
};

export const insertUser = async (request, response) => {
  const responseBody = {
    message: "user inserting successed",
    isSuccess: true,
  };

  const device = await Devices.findOne({ deviceId: request.body.deviceId });

  const user = new Users({
    username: request.body.username,
    device: device,
    password: request.body.password,
  });

  await user.save().catch((err) => {
    responseBody.message = `user inserting failed: ${err.message}`;
    responseBody.isSuccess = false;

    console.log(err.message);
  });

  if (responseBody.isSuccess) response.status(201).send(responseBody);
  else response.send(responseBody);
};
