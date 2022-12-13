import Devices from "../models/device.js";
import Doctors from "../models/doctor.js";
import Patients from "../models/patient.js";

export const insertPatient = async (patientData) => {
  const deviceObjectId = await Devices.exists({
    deviceId: patientData.deviceId,
  });

  const Patient = new Patients({
    username: patientData.username,
    password: patientData.password,
    age: patientData.age,
    gender: patientData.gender,
    phoneNumber: patientData.phoneNumber,
    device: deviceObjectId,
  });

  const [isSuccess, errMessage] = await Patient.save()
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getPatient = async (patientData) => {
  const deviceObjectId = await Devices.exists({
    deviceId: patientData.deviceId,
  });

  const [isSuccess, errMessage, data] = await Patients.findOne({
    device: deviceObjectId,
    password: patientData.password,
  })
    .select("-password -__v")
    .populate("device", "-_id")
    .then((patient) => {
      if (patient) return [true, "", { patient }];

      return [false, "password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};

export const searchPatientsByDeviceId = async (deviceId) => {
  const deviceObjectId = await Devices.find({
    deviceId: deviceId ? new RegExp(`^${deviceId}`) : deviceId,
  });

  const [isSuccess, errMessage, data] = await Patients.find({
    device: deviceObjectId,
  })
    .select("-password -__v")
    .populate("device", "-_id deviceId")
    .populate("doctorsRequests", "-_id email")
    .then((patients) => [true, "", { patients }])
    .catch((err) => [false, err.message, { patients: [] }]);

  return { isSuccess, errMessage, data };
};

// It return array of patients who don't already added by this doctor email
export const filterPatientsAlreadyAddedByDoctorEmail = async (
  patients,
  doctorEmail
) => {
  const doctorPatientsObjectIds = (await Doctors.findOne({ email: doctorEmail }))
    ?.patients;

  const [isSuccess, errMessage, data] = await Patients.find({
    _id: {
      $nin: doctorPatientsObjectIds,
      $in: patients,
    },
  })
    .select("-password -__v")
    .populate("device", "-_id deviceId")
    .populate("doctorsRequests", "-_id email")
    .then((filterdPatients) => [true, "", { patients: filterdPatients }])
    .catch((err) => [false, err.message, { patients: [] }]);

  return { isSuccess, errMessage, data };
};
