import axios from "axios";
import { SERVER_URL } from "./constants";

const queryClient = axios.create({
  baseURL: SERVER_URL,
});

export default {
  query: {
    execute(payload) {
      return queryClient.post("/api/query/", payload);
    },
    sync(payload, jwt) {
      return queryClient.post("/api/user_queries/sync/", payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
    },
    delete(payload, jwt) {
      return queryClient.delete("/api/user_queries/delete/", {
        data: payload,
        headers: { Authorization: `Bearer ${jwt}` },
      });
    },
  },
};
