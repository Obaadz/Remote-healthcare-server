import Devices from "../models/device.js";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1519353",
  key: "17e704d4e34a2978834b",
  secret: "59ad5f82551a87b7678c",
  cluster: "eu",
  useTLS: true,
});

export const updateFields = async (request, response) => {
  const isDeviceNotExist = !(await checkDeviceValidation(
      request.body.deviceId
    )),
    isDataToUpdateNotExist = !(
      request.body.dataToUpdate.spo2 || request.body.dataToUpdate.healthrate
    );

  if (isDeviceNotExist || isDataToUpdateNotExist) {
    failed();
    return;
  }

  await Devices.updateOne(
    { deviceId: request.body.deviceId },
    request.body.dataToUpdate
  )
    .then(() => successed())
    .catch((err) => failed(err.message));

  function successed() {
    response.send({
      message: "update successed",
      isSuccess: true,
    });

    pusher.trigger(`user-${request.body.deviceId}`, "user-data-changed", {
      message: "receiving new device data",
      data: request.body.dataToUpdate,
    });
  }

  function failed(errorMessage) {
    response.send({
      message: `update failed: ${
        errorMessage
          ? errorMessage
          : "deviceId or data to be updated is incorrect"
      }`,
      isSuccess: false,
    });
  }
};

// Utils functions for devices collection:
export const checkDeviceValidation = async (deviceId) => {
  const isDataValid = await Devices.exists({
    deviceId,
  });

  return isDataValid ? true : false;
};