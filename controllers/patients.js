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

export const getPatient = async (patientData) => {
  const patientDevice = await getDeviceByDeviceId(patientData.deviceId);

  const [isSuccess, errMessage, data] = await Patients.findOne({
    device: patientDevice._id,
    password: patientData.password,
  })
    .select("-password -__v -reports")
    .populate("device", "-_id")
    .then((patient) => {
      if (patient) return [true, "", { patient }];

      return [false, "password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const searchPatientsByDeviceId = async (deviceId) => {
  const patientsDevices = await Devices.find({
    deviceId: deviceId ? new RegExp(`^${deviceId}`) : deviceId,
  });

  const [isSuccess, errMessage, data] = await Patients.find({
    device: patientsDevices,
  })
    .select("-password -__v -adminsRequests")
    .populate("device", "-_id deviceId")
    .then((patients) => [true, "", { patients }])
    .catch((err) => [false, err.message, { patients: [] }]);

  return { isSuccess, errMessage, data };
};

// It return array of patients who don't already added by this admin email
// It also add 'IsRequestedAlready' boolean variable, to patients who already has been requested by this admin email
export const filterPatientsAlreadyAddedByAdminEmail = async (patients, adminEmail) => {
  const adminPatientsObjectIds = (await Admins.findOne({ email: adminEmail }))?.patients;

  const [isSuccess, errMessage, data] = await Patients.find({
    _id: {
      $nin: adminPatientsObjectIds,
      $in: patients,
    },
  })
    .select("-password -__v")
    .populate("device", "-_id deviceId")
    .populate("adminsRequests", "-_id email")
    .lean()
    .then((filterdPatients) => {
      const filteredPatientsWithIsRequestedAlready = filterdPatients.map((patient) => {
        patient.isRequestedAlready = patient.adminsRequests.some(
          (admin) => admin.email == adminEmail
        );

        // remove the admins requests (emails) so it will not be send with response...
        delete patient.adminsRequests;

        return patient;
      });

      return [true, "", { patients: filteredPatientsWithIsRequestedAlready }];
    })
    .catch((err) => [false, err.message, { patients: [] }]);

  return { isSuccess, errMessage, data };
};
