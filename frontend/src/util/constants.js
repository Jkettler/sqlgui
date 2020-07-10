const LOCAL_SERVER_URL = "http://localhost:9000/api/";
const REMOTE_SERVER_URL =
  "http://ec2-13-58-227-8.us-east-2.compute.amazonaws.com/api/";

export const SERVER_URL =
  process.env.NODE_ENV === "development" ? LOCAL_SERVER_URL : REMOTE_SERVER_URL;
