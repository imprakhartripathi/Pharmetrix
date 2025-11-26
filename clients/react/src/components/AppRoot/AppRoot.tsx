import { Outlet } from "react-router-dom";
import GlobalSessionManager from "../SessionManager/GlobalSessionManager";

export default function AppRoot() {
  return (
    <>
      <GlobalSessionManager />
      <Outlet />
    </>
  );
}
