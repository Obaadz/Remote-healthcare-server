import express from "express";
import { pusher } from "../../index.js";
import {
  checkDeviceValidation,
  updateDevice,
  getDeviceData,
} from "../../controllers/devices.js";
import OneSignal from "@onesignal/node-onesignal";

const devicesRoutes = express.Router();

// const configuration = OneSignal.createConfiguration({
//   userKey: "ZjQxMWY4OWQtNGM0NC00MWJjLWI1YjgtODgxM2YxOTY3YTRm",
//   appKey: "YzUzZGFjYzEtOTk2My00ZWMxLWEwZDItOTNmY2ZlOGU3MWI3",
// });

let configuration = OneSignal.createConfiguration({
  userKey: "ZjQxMWY4OWQtNGM0NC00MWJjLWI1YjgtODgxM2YxOTY3YTRm",
  appKey: "YzUzZGFjYzEtOTk2My00ZWMxLWEwZDItOTNmY2ZlOGU3MWI3",
});

const client = new OneSignal.DefaultApi(configuration);

// Update device data on the database and send it to client
devicesRoutes.put("/devices/update", async (request, response) => {
  const device = request.body;
  // const notifaction = new OneSignal.Notification();

  // notifaction.app_id = "fe711cfd-661b-452b-9d63-9e9d4cf56e44";
  // notifaction.contents = { en: "Your device has been updated ya wala" };
  // notifaction.headings = { en: "Device Updated ya wala" };

  const app = (await client.getApps())[0];
  const notifaction = new OneSignal.Notification({
    contents: {
      en: "Your device has been updated ya wala",
    },
    headings: {
      en: "Device Updated ya wala",
    },
  });

  client
    .createNotification(notifaction)
    .then((response) => {
      console.log("Notification Created Success:", response);
    })
    .catch((err) => {
      console.log("Notification Created Failed: ", err);
    });

  const oldDeviceData = await getDeviceData(device.deviceId);
  const isDataToUpdateExist = handleDataToUpdate(device.dataToUpdate, oldDeviceData);

  if (!oldDeviceData || !isDataToUpdateExist) {
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
      temperature: dataToUpdate.temperature
        ? dataToUpdate?.temperature?.toString()
        : null,
    });
  }

  function handleDataToUpdate(dataToUpdate = {}, oldDeviceData) {
    if (
      dataToUpdate.heartRate &&
      (dataToUpdate.heartRate < 60 || dataToUpdate.heartRate > 115)
    )
      dataToUpdate.heartRate = oldDeviceData.heartRate || null;
    if (dataToUpdate.spo2 && (dataToUpdate.spo2 < 90 || dataToUpdate.spo2 > 100))
      dataToUpdate.spo2 = oldDeviceData.spo2 || null;
    if (
      dataToUpdate.temperature &&
      (dataToUpdate.temperature < 35 || dataToUpdate.temperature > 40)
    )
      dataToUpdate.temperature = oldDeviceData.temperature || null;
    if (
      dataToUpdate.spo2 ||
      dataToUpdate.heartRate ||
      dataToUpdate.temperature ||
      typeof dataToUpdate.fall == "boolean"
    )
      return true;

    return false;
  }
});

export default devicesRoutes;
