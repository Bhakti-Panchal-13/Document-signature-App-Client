import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api', // 
  withCredentials: true, // ✅ Send cookies with each request
});

export default API;