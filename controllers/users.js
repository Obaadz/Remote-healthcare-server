import Users from "../models/user.js";
import Devices from "../models/device.js";

// export const checkUserValidation = async (request, response) => {
//   const device = await Devices.findOne({ deviceId: request.query.deviceId });

//   const user = await Users.findOne({
//     device,
//     password: request.query.password,
//   })
//     .select("-password -__v")
//     .populate("device", "-deviceId -_id");

//   if (user)
//     response.send({
//       message: "user validation successed",
//       isUserValid: true,
//       data: { user },
//     });
//   else response.send({ message: "user validation failed", isUserValid: false });
// };

export const checkUserValidation = async (deviceId, password) => {
  const isDataValid = await Users.exists({
    password,
    "device.deviceId": deviceId,
  });

  return isDataValid ? true : false;
};

export const getUserData = async (request, response) => {
  const isUserExist = await checkUserValidation(
    request.query.deviceId,
    request.query.password
  );

  if (!isUserExist) {
    response.send({ message: "user validation failed", isSuccess: false });
    return;
  }

  const device = await Devices.findOne({ deviceId: request.query.deviceId });

  const user = await Users.findOne({
    device,
    password: request.query.password,
  })
    .select("-password -__v")
    .populate("device", "-_id");

  response.send({
    message: "user validation successed",
    isSuccess: true,
    data: { user },
  });
};

export const insertUser = async (request, response) => {
  const responseBody = {
    message: "user inserting successed",
    isSuccess: true,
  };

  const device = await Devices.findOne({ deviceId: request.body.deviceId });

  const user = new Users({
    username: request.body.username,
    gender: request.body.gender,
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
