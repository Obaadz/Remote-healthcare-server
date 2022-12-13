import express from "express";
import { pusher } from "../../index.js";
import { checkDeviceValidation, updateDevice } from "../../controllers/devices.js";

const devicesRoutes = express.Router();

// Update device data on the database and send it to client
devicesRoutes.put("/devices/update", async (request, response) => {
  const device = request.body;

  const isDeviceExist = await checkDeviceValidation(device.deviceId);
  const isDataToUpdateExist = checkDataToUpdateExist(device.dataToUpdate);

  if (!isDeviceExist || !isDataToUpdateExist) {
    failed();
    return;
  }

  console.log("DEVICE DATA TO UPDATE: ", device);
  const { isSuccess, errMessage } = await updateDevice(device);

  if (isSuccess) successed();
  else failed(errMessage);

  function successed() {
    sendDataToClient(device.deviceId, device.dataToUpdate)
      .then(() => {
        console.log("DATA HAS BEEN SENTED TO CLIENT");

        response.send({
          message: "update successed",
          isSuccess: true,
        });
      })
      .catch((err) => {
        console.log("ERROR ON SENDING DATA TO CLIENT: ", err.message);

        failed(
          `update successed but sending new data to client has been failed: ${err.message}`
        );
      });
  }

  function failed(errorMessage = "") {
    console.log(
      `update data failed: ${
        errorMessage ? errorMessage : "deviceId or dataToUpdate is missing"
      }`
    );

    response.send({
      message: `update failed: ${
        errorMessage ? errorMessage : "deviceId or data to be updated is incorrect"
      }`,
      isSuccess: false,
    });
  }

  function sendDataToClient(deviceId, dataToUpdate) {
    return pusher.trigger(`user-${deviceId}`, "user-data-changed", {
      message: "receiving new device data",
      ...dataToUpdate,
    });
  }

  function checkDataToUpdateExist(dataToUpdate = {}) {
    const { spo2, heartRate, temperature, fall } = dataToUpdate;

    if (spo2 || heartRate || temperature || typeof fall == "boolean") return true;

    return false;
  }
});

export default devicesRoutes;
