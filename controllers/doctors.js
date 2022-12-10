import Doctors from "../models/doctors.js";

export const insertDoctor = async (doctorData) => {
  const Doctor = new Doctors({
    username: doctorData.username,
    password: doctorData.password,
    age: doctorData.age,
    email: doctorData.email,
    gender: doctorData.gender,
    phoneNumber: doctorData.phoneNumber,
  });

  const [isSuccess, errMessage] = await Doctor.save()
    .then(() => [true, ""])
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage };
};

export const getDoctor = async (doctorData) => {
  const [isSuccess, errMessage, data] = await Doctors.findOne({
    email: doctorData.email,
    password: doctorData.password,
  })
    .select("-password -__v")
    .then((doctor) => {
      if (doctor) return [true, "", { doctor }];

      return [false, "email or password is incorrect"];
    })
    .catch((err) => [false, err.message]);

  return { isSuccess, errMessage, data };
};
