import axios from "axios";

export const client = axios.create({
  headers: {
    Authorization: "Bearer " + process.env.EXPO_PUBLIC_AUTHORIZATION_KEY,
  },
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
});
