import { useAuth as useAuthContext } from "../../App";

export function useAuth() {
  return useAuthContext();
}