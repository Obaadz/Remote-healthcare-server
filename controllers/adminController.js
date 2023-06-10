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
} from "../services/admins.js";
import { pusher } from "../index.js";

export default class AdminController {
  static async signup(req, res) {
    const admin = req.body;

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
    const isDeviceExist = await checkDeviceValidation(req.body.deviceId);
    if (!isDeviceExist) {
      failed("deviceId is not exist");
      return;
    }

    console.log(req.body);

    const { isSuccess, errMessage } = await cancelPatientFromAdminByDeviceId(
      req.body.deviceId,
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

    const { isSuccess, errMessage, data } = await getAdminById(id, includePatients == 1);

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
}
