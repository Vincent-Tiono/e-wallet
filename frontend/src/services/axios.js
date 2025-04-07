import axios from "axios";

// Create an axios instance with the proper baseURL to avoid duplication
const instance = axios.create({ 
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

// Log the configuration to help with debugging
console.log('Axios instance configured with baseURL:', instance.defaults.baseURL);

export default instance;
