import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authAPI, userAPI } from "../services/api";
export const useAuth = create((set, get) => ({
  user:null, token:null, loading:false, ready:false, upiPin:null,
  login: async (upiId, password) => {
    set({loading:true});
    try { const {data}=await authAPI.login({upiId,password}); await SecureStore.setItemAsync("tarpay_token",data.token); set({user:data.user,token:data.token,loading:false}); return data.user; }
    catch(e){set({loading:false});throw e;}
  },
  register: async (form) => {
    set({loading:true});
    try{const{data}=await authAPI.register(form);set({loading:false});return data;}
    catch(e){set({loading:false});throw e;}
  },
  restore: async () => {
    try {
      const tok=await SecureStore.getItemAsync("tarpay_token");
      const pin=await SecureStore.getItemAsync("tarpay_pin");
      if(!tok){set({ready:true});return false;}
      const{data}=await userAPI.me();
      set({user:data.user,token:tok,upiPin:pin,ready:true});return true;
    } catch{set({ready:true});return false;}
  },
  setUpiPin: async (pin) => { await SecureStore.setItemAsync("tarpay_pin",pin); set({upiPin:pin}); },
  verifyPin: (pin) => get().upiPin===pin,
  refreshUser: async () => { try{const{data}=await userAPI.me();set({user:data.user});}catch{} },
  setUser: (u) => set({user:u}),
  logout: async () => { await SecureStore.deleteItemAsync("tarpay_token"); set({user:null,token:null,upiPin:null}); },
}));
