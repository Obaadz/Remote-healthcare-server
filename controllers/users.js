import Users from "../models/user.js";
import Devices from "../models/device.js";

export const checkUserValidation = async (device, password) => {
  const isDataValid = await Users.exists({
    password,
    device,
  });

  return isDataValid ? true : false;
};

export const getUserData = async (request, response) => {
  const device = await Devices.exists({ deviceId: request.body.deviceId });

  const isUserExist = await checkUserValidation(device, request.body.password);

  if (!isUserExist) {
    failed();
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

  function failed(errorMessage) {
    response.send({
      message: `user validation failed: ${
        errorMessage ? errorMessage : "deviceId or password is incorrect"
      }`,
      isSuccess: false,
    });
  }
};

export const checkDeviceValidation = async (deviceId) => {
  const isDataValid = await Devices.exists({
    deviceId,
  });

  return isDataValid ? true : false;
};

export const insertUser = async (request, response) => {
  const isDeviceExist = await checkDeviceValidation(request.body.deviceId);

  if (!isDeviceExist) {
    response.send({
      message: "user inserting failed: deviceId is not exist",
      isSuccess: false,
    });

    return;
  }

  const device = await Devices.exists({ deviceId: request.body.deviceId });

  const user = new Users({
    username: request.body.username,
    gender: request.body.gender,
    device,
    password: request.body.password,
  });

  await user
    .save()
    .then(() => successed())
    .catch((err) => failed(err));

  function successed() {
    response.status(201).send({
      message: "user inserting successed",
      isSuccess: true,
    });
  }

  function failed(err) {
    response.send({
      message: `user inserting failed: ${
        err.message.includes("duplicate")
          ? "patient already registerd"
          : err.message
      }`,
      isSuccess: false,
    });
  }
};
