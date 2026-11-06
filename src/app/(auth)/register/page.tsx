import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Create Account | KADEO",
  description: "Start and manage your online store with ease on KADEO.",
};

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
