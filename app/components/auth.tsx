import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
import { useAccessStore } from "@/app/store";
import { GuardProvider } from "@authing/guard-react18";
import "@authing/guard-react18/dist/esm/guard.min.css";

import { LoginPage } from "@/app/components/authing";
export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  return (
    <>
      <LoginPage />
    </>
  );
}
