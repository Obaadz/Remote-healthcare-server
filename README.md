<h1>Remote healthcare system</h1>
<p>The backend server for my graduation project.</p>

<h2>The api endpoints for the production: </h2>
<table>
<thead>
  <tr>
    <th colspan="5">Production Endpoints</th>
  </tr>
</thead>
<tbody>
	<tr>
    <td>METHOD</td>
    <td>API Endpoint</td>
    <td>Description</td>
    <td>Request type<br>(body / query)</td>
    <td>Request body</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/devices/update" target="_blank">/v2/devices/update</a></td>
    <td>Update patient device data It also will send the data to client if client is online</td>
    <td>body</td>
    <td>deviceId,<br>dataToUpdate: {<br>fall,<br>heartRate,<br>spo2,<br>temperature<br>}</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/patients/signup" target="_blank">/v2/users/patients/signup</a></td>
    <td>Patients signup</td>
    <td>body</td>
    <td>username,<br>deviceId,<br>phoneNumber,<br>password",<br>gender,<br>age</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/patients/signin" target="_blank">/v2/users/patients/signin</a></td>
    <td>Patients signin by device id and password</td>
    <td>body</td>
    <td>deviceId,<br>password</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/patients/signin" target="_blank">/v2/users/patients/signin</a></td>
    <td>Patients signin by patient id</td>
    <td>query</td>
    <td>patientId</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/admins/signup" target="_blank">/v2/users/admins/signup</a></td>
    <td>Admin signup</td>
    <td>body</td>
    <td>username,<br>email,<br>role,<br>phoneNumber,<br>password",<br>gender,<br>age</td>
  </tr>
  <tr>
    <td>POST</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/admins/signin" target="_blank">/v2/users/admins/signin</a></td>
    <td>Admin signin by email and password</td>
    <td>body</td>
    <td>email,<br>password</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/admins/request_patient" target="_blank">/v2/users/admins/request_patient</a></td>
    <td>Admin send request to patient by admin email and patient device id</td>
    <td>body</td>
    <td rowspan="3">deviceId,<br>adminEmail</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/admins/request_patient/cancel" target="_blank">/v2/users/admins/request_patient/cancel</a></td>
    <td>Admin cancel request to patient by admin email and patient device id</td>
    <td>body</td>
  </tr>
  <tr>
    <td>GET</td>
    <td><a href="https://remote-healthcare-server.vercel.app/v2/users/patients" target="_blank">/v2/users/patients</a></td>
    <td>Patients search by device id only or device id and admin email</td>
    <td>query</td>
  </tr>
</tbody>
</table>
