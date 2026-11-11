import type { APIResponse, User } from "../../types.ts";

export interface RegisterDataReq {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
}

export interface LoginDataReq {
  email: string;
  password: string;
}

// Form type — keeps rePassword (the zod schema validates the confirm
// field); only { password, newPassword } ever leaves the browser.
export interface ChangePasswordReq {
  password: string;
  newPassword: string;
  rePassword: string;
}

// Request type for the API call — the backend rejects rePassword.
export interface ChangePasswordRequest {
  password: string;
  newPassword: string;
}

export interface AuthResponseData {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

// Change-password returns a NEW token and NO user — only these keys.
export interface ChangePasswordResponseData {
  token: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthResponse extends APIResponse {
  data: AuthResponseData;
}

export interface ChangePasswordResponse extends APIResponse {
  data: ChangePasswordResponseData;
}
