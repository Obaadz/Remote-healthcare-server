import { pusher, signalClient } from "../index.js";
import { updateDevice, getDeviceData } from "../services/devices.js";
import { addEmergencyToAllAdmins } from "../services/admins.js";

export default class DeviceController {
  static async update(req, res) {
    const device = req.body;

    const oldDeviceData = await getDeviceData(device.deviceId);
    const isDataToUpdateExist = handleDataToUpdate(device.dataToUpdate, oldDeviceData);

    if (!oldDeviceData || !isDataToUpdateExist) {
      failed();
      return;
    }

    if (device.dataToUpdate.fall)
      try {
        await addEmergencyToAllAdmins(device.deviceId);

        console.log("SENDING NOTIFACTION...");

        const res = await signalClient.createNotification({
          headings: {
            en: "Patient is in danger",
          },
          contents: { en: "There is a patient in danger!" },
          included_segments: ["Subscribed Users"],
        });
      } catch (e) {
        console.log("ERROR ON SENDING NOTIFICATION", e.message);
      }

    console.log("DEVICE DATA: ", device);
    const { isSuccess, errMessage } = await updateDevice(device);

    if (isSuccess) successed();
    else failed(errMessage);

    function successed() {
      sendDataToClient(device.deviceId, device.dataToUpdate)
        .then(() => {
          console.log("DATA HAS BEEN SENTED TO CLIENT");

          res.send({
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

      res.send({
        message: `update failed: ${
          errorMessage ? errorMessage : "deviceId or data to be updated is incorrect"
        }`,
        isSuccess: false,
      });
    }

    function sendDataToClient(deviceId, dataToUpdate) {
      if (
        !dataToUpdate.heartRateValid ||
        !dataToUpdate.SPO2Valid ||
        dataToUpdate.heartRateValid === 0 ||
        dataToUpdate.SPO2Valid === 0
      ) {
        dataToUpdate.spo2 = -999;
        dataToUpdate.heartRate = -999;
        dataToUpdate.temperature = "-999";
      }

      return pusher.trigger(`user-${deviceId}`, "user-data-changed", {
        message: "receiving new device data",
        heartRate: dataToUpdate.heartRate,
        spo2: dataToUpdate.spo2,
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

      if (!dataToUpdate.lat) {
        dataToUpdate.lat = oldDeviceData.lat || 0;
        dataToUpdate.lng = oldDeviceData.lng || 0;
      }
      if (
        dataToUpdate.spo2 ||
        dataToUpdate.heartRate ||
        dataToUpdate.temperature ||
        typeof dataToUpdate.fall == "boolean"
      )
        return true;

      return false;
    }
  }
}
