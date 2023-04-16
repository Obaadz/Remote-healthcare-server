import express from "express";
import { checkDeviceValidation } from "../../controllers/devices.js";
import {
  getAdminByEmailAndPassword,
  insertAdmin,
  addPatientToAdminByAdminEmail,
  sendRequestToPatientByAdminEmail,
  cancelRequestToPatientByAdminEmail,
  getPatientAdminsByDeviceId,
  getAdminById,
} from "../../controllers/admins.js";
import {
  getPatientByDeviceIdAndPassword,
  insertPatient,
  searchPatientsByDeviceId,
  filterPatientsAlreadyAddedByAdminEmail,
  getPatientByPatientId,
} from "../../controllers/patients.js";
import { pusher } from "../../index.js";

const patientsRoutes = express.Router();
const adminsRoutes = express.Router();

patientsRoutes.get("/test", async (request, response) => {
  const { adminsForPatient } = await getPatientAdminsByDeviceId("123456789011");
  console.log(adminsForPatient);
  response.send("test");
});

patientsRoutes.get("/users/patients/signin", async (request, response) => {
  const { patientId } = request.query;

  console.log(patientId);

  try {
    const data = await getPatientByPatientId(patientId);
    successed(data);
  } catch (err) {
    failed(err.message);
  }

  function successed(data) {
    response.send({
      message: "patient query successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `patient query failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

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
        errMessage.includes("duplicate") ? "patient already registerd" : errMessage
      }`,
      isSuccess: false,
    });
  }
});

patientsRoutes.post("/users/patients/signin", async (request, response) => {
  const patient = request.body;

  console.log(patient);

  const isDeviceExist = await checkDeviceValidation(patient.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  const { isSuccess, errMessage, data } = await getPatientByDeviceIdAndPassword(
    patient.deviceId,
    patient.password
  );

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

patientsRoutes.get("/users/patients", async (request, response) => {
  const { deviceId, adminEmail } = request.query;

  console.log(deviceId, adminEmail);

  try {
    let data = await searchPatientsByDeviceId(deviceId);

    if (adminEmail)
      data = await filterPatientsAlreadyAddedByAdminEmail(data.patients, adminEmail);

    successed(data);
  } catch (err) {
    failed(err.message);
  }

  function successed(data) {
    response.send({
      message: "patient search successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `patient search failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

adminsRoutes.post("/users/admins/signup", async (request, response) => {
  const admin = request.body;

  const { isSuccess, errMessage } = await insertAdmin(admin);

  if (isSuccess) successed();
  else failed(errMessage);

  function successed() {
    response.status(201).send({
      message: "admin signup successed",
      isSuccess: true,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin signup failed: ${
        errMessage.includes("duplicate") ? "admin already registerd" : errMessage
      }`,
      isSuccess: false,
    });
  }
});

adminsRoutes.post("/users/admins/signin", async (request, response) => {
  const admin = request.body;

  const { isSuccess, errMessage, data } = await getAdminByEmailAndPassword(
    admin.email,
    admin.password
  );

  if (isSuccess) successed(data);
  else failed(errMessage);

  function successed(data) {
    response.send({
      message: "admin signin successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin signin failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

adminsRoutes.put("/users/admins/request_patient", async (request, response) => {
  const requestData = request.body;

  const isDeviceExist = await checkDeviceValidation(requestData.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  console.log(requestData);

  const { isSuccess, errMessage, data } = await sendRequestToPatientByAdminEmail(
    requestData.adminEmail,
    requestData.deviceId
  );

  if (isSuccess) {
    successed(data);
  } else failed(errMessage);

  function successed(data) {
    sendDataToClient(requestData.deviceId, data.adminsRequestsLength).finally(() => {
      console.log("DATA HAS BEEN SENTED TO CLIENT");

      response.send({
        message: "admin request has been sent to patient successed",
        isSuccess: true,
      });
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin request to patient failed: ${errMessage}`,
      isSuccess: false,
    });
  }

  function sendDataToClient(deviceId, adminsRequestsLength) {
    return pusher.trigger(`user-${deviceId}`, "user-data-changed", {
      message: "receiving new length of adminsRequests",
      adminsRequestsLength,
    });
  }
});

adminsRoutes.put("/users/admins/request_patient/cancel", async (request, response) => {
  const requestData = request.body;

  const isDeviceExist = await checkDeviceValidation(requestData.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  console.log(requestData);

  const { isSuccess, errMessage, data } = await cancelRequestToPatientByAdminEmail(
    requestData.adminEmail,
    requestData.deviceId
  );

  if (isSuccess) {
    successed(data);
  } else failed(errMessage);

  function successed(data) {
    sendDataToClient(requestData.deviceId, data.adminsRequestsLength).finally(() => {
      response.send({
        message: "admin request has been cancel from patient successed",
        isSuccess: true,
      });
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin cancel request from patient failed: ${errMessage}`,
      isSuccess: false,
    });
  }

  function sendDataToClient(deviceId, adminsRequestsLength) {
    return pusher.trigger(`user-${deviceId}`, "user-data-changed", {
      message: "receiving new length of adminsRequests",
      adminsRequestsLength,
    });
  }
});
adminsRoutes.put("/users/admins/request_patient/accept", async (request, response) => {
  const requestData = request.body;

  const isDeviceExist = await checkDeviceValidation(requestData.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  console.log(requestData);

  const { data } = await cancelRequestToPatientByAdminEmail(
    requestData.adminEmail,
    requestData.deviceId
  );

  const { isSuccess, errMessage } = await addPatientToAdminByAdminEmail(
    requestData.adminEmail,
    requestData.deviceId
  );

  if (isSuccess) {
    successed(data);
  } else failed(errMessage);

  function successed(data) {
    sendDataToClient(requestData.deviceId, data.adminsRequestsLength).finally(() => {
      response.send({
        message: "admin has been added to patient successed",
        isSuccess: true,
      });
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin add to patient failed: ${errMessage}`,
      isSuccess: false,
    });
  }

  function sendDataToClient(deviceId, adminsRequestsLength) {
    return pusher.trigger(`user-${deviceId}`, "user-data-changed", {
      message: "receiving new length of adminsRequests",
      adminsRequestsLength,
    });
  }
});

adminsRoutes.get("/users/admins", async (request, response) => {
  const { id } = request.query;

  const { isSuccess, errMessage, data } = await getAdminById(id);

  if (isSuccess) successed(data);
  else failed(errMessage);

  function successed(data) {
    response.send({
      message: "admin search successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `admin search failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

export { patientsRoutes, adminsRoutes };
