import axios from "axios";
import { SERVER_URL, PROD_SERVER_URL } from "./constants";

const queryClient = axios.create({
  baseURL: PROD_SERVER_URL,
});

export default {
  query: {
    execute(payload) {
      return queryClient.post("/query/", payload);
    },
    sync(payload, jwt) {
      return queryClient.post("/user/queries/sync/", payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
    },
    delete(payload, jwt) {
      return queryClient.delete("/user/queries/delete/", {
        data: payload,
        headers: { Authorization: `Bearer ${jwt}` },
      });
    },
  },
};
