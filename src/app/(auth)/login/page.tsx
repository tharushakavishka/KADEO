import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Sign In | KADEO",
  description: "Sign in to manage your KADEO store and orders.",
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
