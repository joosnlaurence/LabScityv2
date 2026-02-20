import type { Metadata } from "next";
import { loginAction } from "@/lib/actions/auth";
import { LSLoginForm } from "@/components/auth/ls-login-form";

export const metadata: Metadata = {
  title: "Login | LabScity",
  description: "Access your LabScity account.",
};

export default function LoginPage() {
  return <LSLoginForm loginAction={loginAction} />;
}
