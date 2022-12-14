import Users from "../models/user.js";
import Devices from "../models/device.js";
import { checkDeviceValidation } from "./devices.js";

export const checkUserValidation = async (device, password) => {
  const isDataValid = await Users.exists({
    device,
    password,
  });

  return isDataValid ? true : false;
};

export const getUserData = async (request, response) => {
  const device = await Devices.exists({ deviceId: request.body.deviceId });

  const isUserExist = await checkUserValidation(device, request.body.password);

  console.log(request.body);

  if (!isUserExist) {
    await failed();

    return;
  }

  await Users.findOne({
    device,
    password: request.body.password,
  })
    .select("-password -__v")
    .populate("device", "-_id")
    .then((user) => successed(user))
    .catch((err) => failed(err.message));

  function successed(user) {
    response.send({
      message: "user validation successed",
      isSuccess: true,
      data: { user },
    });
  }

  async function failed(errorMessage) {
    await response.send({
      message: `user validation failed: ${
        errorMessage ? errorMessage : "deviceId or password is incorrect"
      }`,
      isSuccess: false,
    });
  }
};

export const insertUser = async (request, response) => {
  const isDeviceExist = await checkDeviceValidation(request.body.deviceId);

  console.log(request.body);

  if (!isDeviceExist) {
    await failed("deviceId is not exist");

    return;
  }

  const device = await Devices.exists({ deviceId: request.body.deviceId });

  const user = new Users({
    username: request.body.username,
    gender: request.body.gender,
    phone_number: request.body.phone_number,
    device,
    password: request.body.password,
  });

  await user
    .save()
    .then(() => successed())
    .catch((err) => failed(err.message));

  function successed() {
    response.status(201).send({
      message: "user inserting successed",
      isSuccess: true,
    });
  }

  async function failed(errMessage) {
    await response.send({
      message: `user inserting failed: ${
        errMessage.includes("duplicate")
          ? "patient already registerd"
          : errMessage
      }`,
      isSuccess: false,
    });
  }
};
