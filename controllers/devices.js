import { pusher } from "../index.js";
import Devices from "../models/device.js";

export const updateFields = async (request, response) => {
  console.log(request.body);

  const isDeviceNotExist = !(await checkDeviceValidation(request.body.deviceId)),
    isDataToUpdateNotExist = !(
      request.body.dataToUpdate.spo2 || request.body.dataToUpdate.heartRate
    );

  if (isDeviceNotExist || isDataToUpdateNotExist) {
    failed();
    return;
  }

  await Devices.updateOne({ deviceId: request.body.deviceId }, request.body.dataToUpdate)
    .then(() => successed())
    .catch((err) => failed(err.message));

  function successed() {
    pusher
      .trigger(`user-${request.body.deviceId}`, "user-data-changed", {
        message: "receiving new device data",
        ...request.body.dataToUpdate,
      })
      .then(() => {
        console.log("DATA SENTED TO MOBILE APP");

        response.send({
          message: "update successed",
          isSuccess: true,
        });
      })
      .catch((err) => {
        console.log("ERROR ON PUSHER: ", err.message);

        response.send({
          message: `update successed but send new data to client has been failed: ${err.message}`,
          isSuccess: false,
        });
      });
  }

  function failed(errorMessage) {
    response.send({
      message: `update failed: ${
        errorMessage ? errorMessage : "deviceId or data to be updated is incorrect"
      }`,
      isSuccess: false,
    });
  }
};

export const updateDevice = async (deviceData) => {
  const [isSuccess, errMessage] = await Devices.updateOne(
    { deviceId: deviceData.deviceId },
    { ...deviceData.dataToUpdate, updatedAt: Date.now() }
  )
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getDeviceData = async (deviceId) => {
  const deviceData = await Devices.findOne({
    deviceId,
  });

  return deviceData;
};

// Utils functions for devices collection:
export const checkDeviceValidation = async (deviceId) => {
  const isDataValid = await Devices.exists({
    deviceId,
  });

  return isDataValid ? true : false;
};

export const getDeviceByDeviceId = async (deviceId) => {
  const device = await Devices.findOne({ deviceId });

  return device;
};
