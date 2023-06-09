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

export const getPatientByDeviceId = async (deviceId) => {
  const patientDevice = await getDeviceByDeviceId(deviceId);

  const [isSuccess, errMessage, data] = await Patients.findOne({
    device: patientDevice._id,
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
    .populate("adminsRequests", "-_id -__v -password -patients -player_id -emergencies ");

  if (!patient) {
    throw new Error("patient not found");
  }

  const patientAdmins = await Admins.find({
    patients: {
      $in: [patient._id],
    },
  }).select("-_id username role phoneNumber email");

  return { patient, patientAdmins };
};

/**
 * Searches for patients by device ID.
 *
 * @param {string} [deviceId] - The device ID to search for. If not provided, an empty array is returned.
 * @returns {Object} An object containing an array of patient documents. If no patients are found, an empty array is returned.
 */
export const searchPatientsByDeviceId = async (deviceId) => {
  const patientsDevices = await Devices.find({
    deviceId: deviceId ? new RegExp(`^${deviceId}`) : deviceId,
  });

  const patients = await Patients.find({
    device: patientsDevices,
  })
    .select("-password -__v -adminsRequests -reports")
    .populate("device", "-_id deviceId");

  if (!patients || !patients.length) {
    return { patients: [] };
  }

  return { patients };
};

/**
 * Filters an array of patients to exclude those that are already added by a specific admin.
 *
 * @param {Array} patients - The array of patient documents to filter.
 * @param {string} adminEmail - The email of the admin.
 * @returns {Object} An object containing an array of patient documents that are not already added by the admin.
 * If no patients are found, an empty array is returned.
 */
export const filterPatientsAlreadyAddedByAdminEmail = async (patients, adminEmail) => {
  const adminPatientsObjectIds = (await Admins.findOne({ email: adminEmail }))?.patients;

  const filterdPatients = await Patients.find({
    _id: {
      $nin: [...adminPatientsObjectIds],
      $in: [...patients],
    },
  })
    .select("-password -__v -reports")
    .populate("device", "-_id deviceId")
    .populate("adminsRequests", "-_id email")
    .lean();
  console.log(patients);
  console.log("FILTERD: ", filterdPatients);
  if (!filterdPatients || !filterdPatients.length) {
    return { patients: [] };
  }

  const filteredPatientsWithIsRequestedAlready = addIsRequestedAlreadyProperty(
    filterdPatients,
    adminEmail
  );

  return { patients: filteredPatientsWithIsRequestedAlready };
};

export const generateReportsForAllPatients = async () => {
  const patients = await Patients.find({}).populate(
    "device",
    "-_id heartRate spo2 temperature updatedAt"
  );

  for (const patient of patients) {
    const reportsLength = patient.reports.length;
    const isReportAlreadyGenerated =
      reportsLength > 0
        ? patient.reports[reportsLength - 1].createdAt.getTime() ==
          patient.device.updatedAt.getTime()
        : false;

    if (!isReportAlreadyGenerated)
      await patient.updateOne({
        $push: {
          reports: {
            spo2: patient.device.spo2,
            heartRate: patient.device.heartRate,
            temperature: patient.device.temperature,
            createdAt: new Date(patient.device.updatedAt),
          },
        },
      });
  }
};

// Utils functions for patients:

/**
 * Adds an `isRequestedAlready` property to each patient indicating whether the admin has already requested access to the patient's data.
 *
 * @param {Array} patients - The array of patient documents to add the property to.
 * @param {string} adminEmail - The email of the admin.
 * @returns {Array} The array of patient documents with the added `isRequestedAlready` property.
 */
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
