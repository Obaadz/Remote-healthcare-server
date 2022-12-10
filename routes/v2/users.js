import express from "express";
import { checkDeviceValidation } from "../../controllers/devices.js";
import { getPatient, insertPatient } from "../../controllers/patients.js";

const patientsRoutes = express.Router();

patientsRoutes.post("/users/patients/signup", async (request, response) => {
  const patient = request.body;

  const isDeviceExist = await checkDeviceValidation(patient.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  const { isSuccess, errMessage } = await insertPatient(patient);

  if (isSuccess) successed();
  else failed(errMessage);

  function successed() {
    response.status(201).send({
      message: "patient signup successed",
      isSuccess: true,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `patient signup failed: ${
        errMessage.includes("duplicate")
          ? "patient already registerd"
          : errMessage
      }`,
      isSuccess: false,
    });
  }
});
patientsRoutes.post("/users/patients/signin", async (request, response) => {
  const patient = request.body;

  const isDeviceExist = await checkDeviceValidation(patient.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  const { isSuccess, errMessage, data } = await getPatient(patient);

  if (isSuccess) successed(data);
  else failed(errMessage);

  function successed(data) {
    response.send({
      message: "patient signin successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `patient signin failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

export { patientsRoutes };
