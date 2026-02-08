import { Metadata } from "next";
import { signupAction } from "@/lib/actions/auth";
import { LSSignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account | LabScity",
  description: "Join the scientific community.",
};

export default function SignupPage() {
  return <LSSignupForm signupAction={signupAction} />;
}