import express from "express";
import { checkDeviceValidation } from "../../controllers/devices.js";
import {
  cancelRequestToPatientByDoctorEmail,
  getDoctor,
  insertDoctor,
  insertPatientToDoctor,
  sendRequestToPatientByDoctorEmail,
} from "../../controllers/doctors.js";
import {
  getPatient,
  insertPatient,
  searchPatientsByDeviceId,
  filterPatientsAlreadyAddedByDoctorEmail,
} from "../../controllers/patients.js";

const patientsRoutes = express.Router();
const doctorsRoutes = express.Router();

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

patientsRoutes.get("/users/patients", async (request, response) => {
  const query = request.query;

  console.log(query);

  const { isSuccess, errMessage, data } = await searchPatientsByDeviceId(query.deviceId);

  // If search is success then if there is a query with doctor email, filter(or remove) the patients already added with that email
  if (isSuccess) {
    if (query.doctorEmail) {
      const {
        isSuccess: isFilteredSuccess,
        errMessage,
        data: filterdData,
      } = await filterPatientsAlreadyAddedByDoctorEmail(data.patients, query.doctorEmail);

      if (isFilteredSuccess) successed(filterdData);
      else failed(errMessage);

      return;
    }

    successed(data);
  } else failed(errMessage);

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

doctorsRoutes.post("/users/doctors/signup", async (request, response) => {
  const doctor = request.body;

  const { isSuccess, errMessage } = await insertDoctor(doctor);

  if (isSuccess) successed();
  else failed(errMessage);

  function successed() {
    response.status(201).send({
      message: "doctor signup successed",
      isSuccess: true,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `doctor signup failed: ${
        errMessage.includes("duplicate") ? "doctor already registerd" : errMessage
      }`,
      isSuccess: false,
    });
  }
});
doctorsRoutes.post("/users/doctors/signin", async (request, response) => {
  const doctor = request.body;

  await insertPatientToDoctor({ deviceId: "123456789011" }, doctor);
  const { isSuccess, errMessage, data } = await getDoctor(doctor);
  if (isSuccess) successed(data);
  else failed(errMessage);

  function successed(data) {
    response.send({
      message: "doctor signin successed",
      isSuccess: true,
      data,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `doctor signin failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

doctorsRoutes.put("/users/doctors/request_patient", async (request, response) => {
  const requestData = request.body;

  const isDeviceExist = await checkDeviceValidation(requestData.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  console.log(requestData);

  const { isSuccess, errMessage } = await sendRequestToPatientByDoctorEmail(
    requestData.doctorEmail,
    requestData.deviceId
  );

  if (isSuccess) {
    successed();
  } else failed(errMessage);

  function successed() {
    response.send({
      message: "doctor request has been sent to patient successed",
      isSuccess: true,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `doctor request to patient failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});

doctorsRoutes.put("/users/doctors/request_patient/cancel", async (request, response) => {
  const requestData = request.body;

  const isDeviceExist = await checkDeviceValidation(requestData.deviceId);
  if (!isDeviceExist) {
    failed("deviceId is not exist");
    return;
  }

  console.log(requestData);

  const { isSuccess, errMessage } = await cancelRequestToPatientByDoctorEmail(
    requestData.doctorEmail,
    requestData.deviceId
  );

  if (isSuccess) {
    successed();
  } else failed(errMessage);

  function successed() {
    response.send({
      message: "doctor request has been cancel from patient successed",
      isSuccess: true,
    });
  }

  function failed(errMessage = "") {
    response.send({
      message: `doctor cancel request from patient failed: ${errMessage}`,
      isSuccess: false,
    });
  }
});
export { patientsRoutes, doctorsRoutes };
