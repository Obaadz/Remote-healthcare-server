import mongoose from "mongoose";
import Admins from "../models/admin.js";
import Patients from "../models/patient.js";
import { getDeviceByDeviceId } from "./devices.js";
import { getPatientByDeviceId, getPatientByPhoneNumber } from "./patients.js";

export const insertAdmin = async (adminData) => {
  const Admin = new Admins({
    username: adminData.username,
    password: adminData.password,
    role: adminData.role,
    age: adminData.age,
    email: adminData.email,
    gender: adminData.gender,
    phoneNumber: adminData.phoneNumber,
  });

  const [isSuccess, errMessage] = await Admin.save()
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getAdminByEmailAndPassword = async (email, password) => {
  const [isSuccess, errMessage, data] = await Admins.findOne({ email, password })
    .select("-password -__v -player_id")
    .populate("patients", "-_id -adminsRequests -password -device -__v")
    .then((admin) => {
      if (admin) return [true, "", { admin }];

      return [false, "email or password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const addPatientToAdminByAdminEmail = async (adminEmail, deviceId) => {
  const patientDevice = await getDeviceByDeviceId(deviceId);
  const patient = await Patients.exists({ device: patientDevice._id });

  const [isSuccess, errMessage] = await Admins.updateOne(
    { email: adminEmail },
    { $addToSet: { patients: patient._id } }
  )
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const sendRequestToPatientByAdminEmail = async (adminEmail, deviceId) => {
  const admin = await Admins.exists({ email: adminEmail });
  const patientDevice = await getDeviceByDeviceId(deviceId);

  const [isSuccess, errMessage, data] = await Patients.findOneAndUpdate(
    { device: patientDevice._id },
    { $addToSet: { adminsRequests: admin._id } },
    { new: true }
  )
    .then((patient) => [
      true,
      "",
      { adminsRequestsLength: patient.adminsRequests.length },
    ])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const cancelRequestToPatientByAdminEmail = async (adminEmail, deviceId) => {
  const admin = await Admins.exists({ email: adminEmail });
  const patientDevice = await getDeviceByDeviceId(deviceId);

  const [isSuccess, errMessage, data] = await Patients.findOneAndUpdate(
    { device: patientDevice._id },
    { $pull: { adminsRequests: admin._id } },
    { new: true }
  )
    .then((patient) => [
      true,
      "",
      { adminsRequestsLength: patient.adminsRequests.length },
    ])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const cancelPatientFromAdminByDeviceId = async (deviceId, adminEmail) => {
  const {
    data: { patient },
  } = await getPatientByDeviceId(deviceId);

  const [isSuccess, errMessage] = await Admins.findOneAndUpdate(
    { email: adminEmail },
    { $pull: { patients: patient._id } }
  )
    .then((patient) => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const cancelPatientFromAdminByPhoneNumber = async (phoneNumber, adminEmail) => {
  const {
    data: { patient },
  } = await getPatientByPhoneNumber(phoneNumber);

  const [isSuccess, errMessage] = await Admins.findOneAndUpdate(
    { email: adminEmail },
    { $pull: { patients: patient._id } }
  )
    .then((patient) => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getPatientAdminsByDeviceId = async (deviceId) => {
  const patientDevice = await getDeviceByDeviceId(deviceId);
  const patient = await Patients.findOne({ device: patientDevice._id }).populate(
    "device"
  );

  const adminsForPatient = await Admins.find({ patients: { $in: [patient._id] } }).select(
    "-password -__v -player_id -patients"
  );

  return { adminsForPatient, patient };
};

export const addEmergencyToAllAdmins = async (deviceId) => {
  const { adminsForPatient, patient } = await getPatientAdminsByDeviceId(deviceId);

  const [isSuccess, errMessage] = await Admins.updateMany(
    { _id: { $in: adminsForPatient } },
    { $push: { emergencies: { ...patient } } }
  )
    .then(() => [true, ""])
    .catch((err) => [false, "Error in adding emergency"]);

  return { isSuccess, errMessage };
};

export const getAdminById = async (id, includePatients = false) => {
  const [isSuccess, errMessage, data] = await Admins.findById(id)
    .select(`-password -__v -player_id ${includePatients ? "-emergencies" : "-patients"}`)
    .populate({
      path: includePatients ? "patients" : "emergencies",
      select: `${includePatients ? "" : "-reports"} -adminsRequests -password -__v`,
      populate: {
        path: "device",
        select: "-__v",
      },
    })
    .then((admin) => {
      console.log("getAdminById");
      console.log(admin.emergencies);

      return [true, "", { admin }];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const getAdminByIdNoPatients = async (id) => {
  const [isSuccess, errMessage, data] = await Admins.findById(id)
    .select(`-password -__v -player_id -patients`)
    .then((admin) => {
      console.log("getAdminByIdNoPatients");
      console.log("my emergencies is: ", admin.emergencies);

      return [true, "", { admin }];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const getAdminPatientsById = async (id) => {
  const [isSuccess, errMessage, data] = await Admins.findById(id)
    .select("-password -__v -player_id")
    .populate("patients", "-_id -adminsRequests -password -device -__v")
    .then((admin) => {
      if (admin) return [true, "", { admin }];

      return [false, "email or password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const deletePatientForAllAdmins = async (patientId) => {
  const { isSuccess, errMessage } = await Admins.updateMany(
    {},
    {
      $pull: { patients: patientId, emergencies: { _id: patientId } },
    }
  )
    .then(() => [true, ""])
    .catch((err) => [false, "patient already deleted in all admins"]);

  return { isSuccess, errMessage };
};

export const deleteAdminById = async (id) => {
  const [isSuccess, errMessage] = await Admins.deleteOne({ _id: id })
    .then(() => [true, ""])
    .catch((err) => [false, "admin already deleted"]);

  return { isSuccess, errMessage };
};
