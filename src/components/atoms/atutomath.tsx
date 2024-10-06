"use client"
import { atom } from "recoil";

interface AuthState {
  isAuthenticated: boolean;
  user: String;  // Replace `any` with the actual type of your user object if available
  token: String | null;
  role:String| null
}

export const authState = atom<AuthState>({
  key: "authState",
  default: {
    isAuthenticated: false,
    token: null,
	user:"",
	role:"Customer"
  },
});