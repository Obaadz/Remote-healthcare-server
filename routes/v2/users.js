import express from "express";
import PatientController from "../../controllers/patientController.js";
import AdminController from "../../controllers/adminController.js";

const patientsRoutes = express.Router();
const adminsRoutes = express.Router();

patientsRoutes.use("/users/patients/reports/generate", PatientController.generateReports);

patientsRoutes.get("/test", PatientController.test);

patientsRoutes.get("/users/patients/signin", PatientController.getOneById);

patientsRoutes.post("/users/patients/signup", PatientController.signup);

patientsRoutes.post("/users/patients/signin", PatientController.signin);

patientsRoutes.get("/users/patients", PatientController.searchByDeviceId);

adminsRoutes.post("/users/admins/signup", AdminController.signup);

adminsRoutes.post("/users/admins/signin", AdminController.signin);

adminsRoutes.put("/users/admins/request_patient", AdminController.requestSend);

adminsRoutes.put("/users/admins/request_patient/cancel", AdminController.requestCancel);
adminsRoutes.put(
  "/users/admins/cancel_patient",
  AdminController.cancelPatientFromAdminList
);

adminsRoutes.put("/users/admins/request_patient/accept", AdminController.requestAccept);

adminsRoutes.get("/users/admins", AdminController.getOneById);

adminsRoutes.get("/users/admins/patients", AdminController.getPatientsByAdminId);

export { patientsRoutes, adminsRoutes };
