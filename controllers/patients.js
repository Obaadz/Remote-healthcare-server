import Devices from "../models/device.js";
import Admins from "../models/admin.js";
import Patients from "../models/patient.js";
import { getDeviceByDeviceId } from "./devices.js";

export const insertPatient = async (patientData) => {
  const patientDevice = await getDeviceByDeviceId(patientData.deviceId);

  const Patient = new Patients({
    username: patientData.username,
    password: patientData.password,
    age: patientData.age,
    gender: patientData.gender,
    phoneNumber: patientData.phoneNumber,
    device: patientDevice._id,
  });

  const [isSuccess, errMessage] = await Patient.save()
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getPatientByDeviceIdAndPassword = async (deviceId, password) => {
  const patientDevice = await getDeviceByDeviceId(deviceId);

  const [isSuccess, errMessage, data] = await Patients.findOne({
    device: patientDevice._id,
    password,
  })
    .select("-password -__v -reports")
    .populate("device", "-_id -updatedAt")
    .populate("adminsRequests", "-_id -__v -password -patients")
    .then((patient) => {
      if (patient) return [true, "", { patient }];

      return [false, "password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const getPatientByPatientId = async (patientId) => {
  const patient = await Patients.findOne({
    _id: patientId,
  })
    .select("-password -__v -reports")
    .populate("device", "-_id -updatedAt")
    .populate("adminsRequests", "-_id -__v -password -patients");

  if (!patient) {
    throw new Error("patient not found");
  }

  return { patient };
};

export const searchPatientsByDeviceId = async (deviceId) => {
  const patientsDevices = await Devices.find({
    deviceId: deviceId ? new RegExp(`^${deviceId}`) : deviceId,
  });

  const patients = await Patients.find({
    device: patientsDevices,
  })
    .select("-password -__v -adminsRequests")
    .populate("device", "-_id deviceId");

  if (!patients || !patients.length) {
    return { patients: [] };
  }

  return { patients };
};

// It return array of patients who don't already added by this admin email
export const filterPatientsAlreadyAddedByAdminEmail = async (patients, adminEmail) => {
  const adminPatientsObjectIds = (await Admins.findOne({ email: adminEmail }))?.patients;

  const filterdPatients = await Patients.find({
    _id: {
      $nin: adminPatientsObjectIds,
      $in: patients,
    },
  })
    .select("-password -__v")
    .populate("device", "-_id deviceId")
    .populate("adminsRequests", "-_id email")
    .lean();

  if (!filterdPatients || !filterdPatients.length) {
    return { patients: [] };
  }

  const filteredPatientsWithIsRequestedAlready = addIsRequestedAlreadyProperty(
    filterdPatients,
    adminEmail
  );

  return { patients: filteredPatientsWithIsRequestedAlready };
};

// Utils functions for patients:

// Add 'IsRequestedAlready' boolean variable, to patients who already has been requested by this admin email
const addIsRequestedAlreadyProperty = (patients, adminEmail) => {
  return patients.map((patient) => {
    patient.isRequestedAlready = patient.adminsRequests.some(
      (admin) => admin.email == adminEmail
    );

    // remove the admins requests (emails) so it will not be send with response...
    delete patient.adminsRequests;

    return patient;
  });
};
