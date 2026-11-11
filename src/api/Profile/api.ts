import type { ProfileResponse, User } from "../../types.ts";
import { api } from "../client.ts";

// Raw shape the API actually returns: the user is nested one level
// deeper ({ data: { user: {...} } }).
interface RawProfileResponse {
  success: boolean;
  message: string;
  data: { user: User };
}
// ================= Profile =================
// GET /users/profile-data — your profile page
export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<RawProfileResponse>("/users/profile-data");
  // Unwrap so every caller gets a plain User.
  return { success: data.success, message: data.message, data: data.data.user };
}
