import axios from "axios";
import { SERVER_URL } from "./constants";

const authClient = axios.create({
  baseURL: SERVER_URL,
});

export default {
  auth: {
    userLogin(payload, callback) {
      return authClient
        .post("/auth/login/", payload, { withCredentials: true })
        .then((res) => callback(res.data));
    },
    userRegister(payload, callback) {
      return authClient
        .post("/auth/register/", payload, { withCredentials: true })
        .then((res) => callback(res.data));
    },
    userLogout(jwt) {
      return authClient.post(
        "/auth/logout/",
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
    },
    currentUser(jwt) {
      return authClient.get("/user/current/", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
    },
    refreshToken(callback, interval) {
      return authClient
        .post(
          "/auth/refresh-token/",
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          callback(res.data);
          return res;
        })
        .catch((e) => {
          if (interval) clearInterval(interval);
        });
    },
  },
};
