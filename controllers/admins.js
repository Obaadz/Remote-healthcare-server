import Admins from "../models/admin.js";
import Patients from "../models/patient.js";
import { getDeviceByDeviceId } from "./devices.js";

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

export const getPatientAdminsByDeviceId = async (deviceId) => {
  const patientDevice = await getDeviceByDeviceId(deviceId);
  const patient = await Patients.exists({ device: patientDevice._id });

  const adminsForPatient = await Admins.find({ patients: { $in: [patient._id] } }).select(
    "-password -__v -player_id -patients"
  );

  return { adminsForPatient, patientObjId: patient._id };
};

export const addEmergencyToAllAdmins = async (deviceId) => {
  const { adminsForPatient, patientObjId } = await getPatientAdminsByDeviceId(deviceId);

  const [isSuccess, errMessage] = await Admins.updateMany(
    { _id: { $in: adminsForPatient } },
    { $push: { emergencies: patientObjId } }
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
    .then((admin) => [true, "", { admin }])
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
