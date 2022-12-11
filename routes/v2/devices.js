import express from "express";
import { pusher } from "../../index.js";
import {
  checkDeviceValidation,
  updateDevice,
} from "../../controllers/devices.js";

const devicesRoutes = express.Router();

/* NOTE:
  when the patient does not use the sensors on the device
  spo2 will be -999
  heartRate will be -999
  temperature will be 0
*/
// Update device data on the database and send it to client
devicesRoutes.put("/devices/update", async (request, response) => {
  const DISABLED_STATE = -999;
  const device = request.body;

  const isDeviceExist = await checkDeviceValidation(device.deviceId);
  const isDataToUpdateExist = checkDataToUpdateExist(device.dataToUpdate);

  if (!isDeviceExist || !isDataToUpdateExist) {
    failed();
    return;
  }

  handleTemperature();
  console.log("DEVICE AFTER HANDLE TEMPERATURE", device);
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
        errorMessage
          ? errorMessage
          : "deviceId or data to be updated is incorrect"
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

  function checkDataToUpdateExist(dataToUpdate) {
    const { spo2, heartRate, temperature } = dataToUpdate;

    if (spo2 || heartRate || temperature) return true;

    return false;
  }

  /*
   * It should change temperature to -999(DISABLED_STATE) if it equal 0
   * it should change temperature to fixed, for example: 37.257 will change to 37.25
   */
  function handleTemperature() {
    changeTemperatureIfEqualZero();
    changeTemperatureToFixed(2);
  }

  function changeTemperatureIfEqualZero() {
    if (device.dataToUpdate.temperature === 0)
      device.dataToUpdate.temperature = DISABLED_STATE;
  }

  function changeTemperatureToFixed(value) {
    device.dataToUpdate.temperature = Number(
      device.dataToUpdate.temperature.toFixed(value)
    );
  }
});

export default devicesRoutes;
