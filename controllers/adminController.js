import { checkDeviceValidation } from "../services/devices.js";
import {
  getAdminByEmailAndPassword,
  insertAdmin,
  addPatientToAdminByAdminEmail,
  sendRequestToPatientByAdminEmail,
  cancelRequestToPatientByAdminEmail,
  getAdminById,
  getAdminPatientsById,
  cancelPatientFromAdminByDeviceId,
  cancelPatientFromAdminByPhoneNumber,
  getAdminByIdNoPatients,
  deleteAdminById,
} from "../services/admins.js";
import { pusher } from "../index.js";
import { deleteAdminRequestInPatientByAdminId } from "../services/patients.js";

export default class AdminController {
  static async signup(req, res) {
    const admin = req.body;

    const goodPhoneNumber = isNumericString(admin.phoneNumber || "0");

    if (!goodPhoneNumber) {
      failed("bad phone number...");
      return;
    }

    const goodAge = isGoodAge(Number(admin.age));

    if (!goodAge) {
      failed("wrong age...");
      return;
    }

    const { isSuccess, errMessage } = await insertAdmin(admin);

    if (isSuccess) successed();
    else failed(errMessage);

    function successed() {
      res.status(201).send({
        message: "admin signup successed",
        isSuccess: true,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `admin signup failed: ${
          errMessage.includes("duplicate") ? "admin already registerd" : errMessage
        }`,
        isSuccess: false,
      });
    }
  }

  static async signin(req, res) {
    const admin = req.body;

    const { isSuccess, errMessage, data } = await getAdminByEmailAndPassword(
      admin.email,
      admin.password
    );

    if (isSuccess) successed(data);
    else failed(errMessage);

    function successed(data) {
      res.send({
        message: "admin signin successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `admin signin failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async requestSend(req, res) {
    const requestData = req.body;

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

        res.send({
          message: "admin request has been sent to patient successed",
          isSuccess: true,
        });
      });
    }

    function failed(errMessage = "") {
      res.send({
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
  }

  static async requestCancel(req, res) {
    const requestData = req.body;

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
        res.send({
          message: "admin request has been cancel from patient successed",
          isSuccess: true,
        });
      });
    }

    function failed(errMessage = "") {
      res.send({
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
  }

  static async requestAccept(req, res) {
    const requestData = req.body;

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
        res.send({
          message: "admin has been added to patient successed",
          isSuccess: true,
        });
      });
    }

    function failed(errMessage = "") {
      res.send({
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
  }

  static async cancelPatientFromAdminList(req, res) {
    console.log(req.body);

    const { isSuccess, errMessage } = req.body.deviceId
      ? await cancelPatientFromAdminByDeviceId(req.body.deviceId, req.body.adminEmail)
      : await cancelPatientFromAdminByPhoneNumber(
          req.body.phoneNumber,
          req.body.adminEmail
        );

    if (isSuccess) {
      successed();
    } else failed(errMessage);

    function successed() {
      res.send({
        message: "patient has been removed from admin list successed",
        isSuccess: true,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `patient removed from admin list failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async getOneById(req, res) {
    const { id } = req.query;
    const { includePatients } = req.query;

    console.log("ID :", id);
    console.log("IncludePatients :", includePatients);
    const { isSuccess, errMessage, data } = includePatients
      ? await getAdminById(id, includePatients == 1)
      : await getAdminByIdNoPatients(id);

    if (isSuccess) successed(data);
    else failed(errMessage);
    console.log("DATA :", data);
    function successed(data) {
      res.send({
        message: "admin search successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `admin search failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async getPatientsByAdminId(req, res) {
    const { id } = req.query;

    const { isSuccess, errMessage, data } = await getAdminPatientsById(id);

    if (isSuccess) successed(data);
    else failed(errMessage);

    function successed(data) {
      res.send({
        message: "admin search successed",
        isSuccess: true,
        data,
      });
    }

    function failed(errMessage = "") {
      res.send({
        message: `admin search failed: ${errMessage}`,
        isSuccess: false,
      });
    }
  }

  static async deleteOneById(req, res) {
    const adminId = req.body.id;

    try {
      const {
        isSuccess: isDeleteAdminForAllPatientsSuccess,
        errMessage: errMessageForDeleteAdminForAllPatients,
      } = await deleteAdminRequestInPatientByAdminId(adminId);

      const { isSuccess: isDeleteAdminSuccess, errMessage: errMessageForDeleteAdmin } =
        await deleteAdminById(adminId);

      if (!isDeleteAdminSuccess) throw new Error(errMessageForDeleteAdmin);

      res.send({ isSuccess: true, message: "OK" });
    } catch (err) {
      res.send({ isSuccess: false, message: err.message | "error occured..." });
    }
  }
}

function isNumericString(input) {
  const regex = /^\d+$/;
  return regex.test(input);
}

function isGoodAge(age) {
  return Number.isInteger(age) && age > 0 && age < 100;
}
