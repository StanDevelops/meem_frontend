import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

const AuthAPI = {
  loginUser: (loginRequest) =>
    axios.post(`${BASE_URL}/login`, loginRequest, {
      withCredentials: true,
    }),
};

export default AuthAPI;
