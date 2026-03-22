import axios from "axios";
import * as SecureStore from "expo-secure-store";
const BASE = process.env.EXPO_PUBLIC_API_URL || "https://tarpay.onrender.com";
const http = axios.create({ baseURL: BASE, timeout: 15000 });
http.interceptors.request.use(async (cfg) => {
  try { const tok = await SecureStore.getItemAsync("tarpay_token"); if(tok) cfg.headers.Authorization=`Bearer ${tok}`; } catch {}
  return cfg;
});
export const authAPI = { register:(d)=>http.post("/api/auth/register",d), login:(d)=>http.post("/api/auth/login",d) };
export const txAPI   = { validate:(id)=>http.get(`/api/transactions/validate/${id}`), send:(d)=>http.post("/api/transactions/send",d), cancel:(id)=>http.post(`/api/transactions/${id}/cancel`), history:(p)=>http.get("/api/transactions/history",{params:p}), detail:(id)=>http.get(`/api/transactions/${id}`) };
export const disputeAPI = { raise:(d)=>http.post("/api/disputes/raise",d), myList:()=>http.get("/api/disputes/my") };
export const userAPI    = { me:()=>http.get("/api/users/me"), dash:()=>http.get("/api/users/dashboard"), notifs:()=>http.get("/api/users/notifications"), read:()=>http.put("/api/users/notifications/read") };
