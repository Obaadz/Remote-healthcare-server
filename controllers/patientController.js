import { checkDeviceValidation } from "../services/devices.js";
import { getPatientAdminsByDeviceId } from "../services/admins.js";
import {
  getPatientByDeviceIdAndPassword,
  insertPatient,
  searchPatientsByDeviceId,
  filterPatientsAlreadyAddedByAdminEmail,
  getPatientByPatientId,
  generateReportsForAllPatients,
} from "../services/patients.js";

export default class PatientController {
  static async generateReports(req, res) {
    console.log("generate reports...");

    await generateReportsForAllPatients();

    res.send("reports has been generated...");
  }

  static async getOneById(req, res) {
    const { patientId } = req.query;

    console.log(patientId);

    try {
      const data = await getPatientByPatientId(patientId);
      successed(data);
    } catch (err) {
      failed(err.message);
    }

    function successed(data) {
      res.send({
        message: "patient query successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `patient query failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async signup(req, res) {
    const patient = req.body;

    const goodPhoneNumber = isNumericString(patient.phoneNumber || "0");

    if(!goodPhoneNumber) {
      failed("bad phone number...");
      return;
    }

    if(Number.isInteger(patient.age) && patient.age > 0 && patient.age < 100) {
      failed("wrong age...");
      return;
    }

    const isDeviceExist = await checkDeviceValidation(patient.deviceId);
    if (!isDeviceExist) {
      failed("deviceId is not exist");
      return;
    }

    const { isSuccess, errMessage } = await insertPatient(patient);

    if (isSuccess) successed();
    else failed(errMessage);

    function successed() {
      res.status(201).send({
        message: "patient signup successed",
        isSuccess: true,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `patient signup failed: ${
          errMessage.includes("duplicate") ? "patient already registerd" : errMessage
        }`,
        isSuccess: false,
      });
    }
  }

  static async signin(req, res) {
    const patient = req.body;

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
      res.send({
        message: "patient signin successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `patient signin failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async searchByDeviceId(req, res) {
    const { deviceId, adminEmail } = req.query;

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
      res.send({
        message: "patient search successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `patient search failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async test(req, res) {
    const { adminsForPatient } = await getPatientAdminsByDeviceId("123456789011");

    console.log(adminsForPatient);

    res.send("test");
  }
}

function isNumericString(input) {
  const regex = /^\d+$/;
  return regex.test(input);
}