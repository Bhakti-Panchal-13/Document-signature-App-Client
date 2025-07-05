import axios from 'axios';

const API = axios.create({
  baseURL: 'https://document-signature-app-server-hb3x.onrender.com/api', // 
  withCredentials: true, // ✅ Send cookies with each request
});

export default API;
