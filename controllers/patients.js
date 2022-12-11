import Devices from "../models/device.js";
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
  const [isSuccess, errMessage, data] = await Patients.findOne({
    deviceId: patientData.deviceId,
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
