"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawRedirect = (formData.get("redirectTo") as string) || "/dashboard";
  // Protect against open redirect attacks
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // If user is admin and rawRedirect was not explicitly set to a custom path, route directly to /admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" && (!formData.get("redirectTo") || rawRedirect === "/dashboard")) {
      redirect("/admin");
    }
  }

  redirect(redirectTo);
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = registerSchema.safeParse({ fullName, email, password });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  let signUpError = null;

  // Attempt standard public signup
  const { data: signUpData, error: normalSignUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (normalSignUpError) {
    // If rate limited by Supabase default email provider (e.g., 3 emails/hour on free tier),
    // fallback gracefully to admin-confirmed signup so merchants can onboard instantly without blocks
    if (
      normalSignUpError.message?.toLowerCase().includes("rate limit") ||
      (normalSignUpError as any).code === "over_email_send_rate_limit"
    ) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminSupabase = createAdminClient();
        const { data: adminUser, error: adminErr } = await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

        if (adminErr) {
          return { error: adminErr.message };
        }

        // Auto sign-in the created user
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          // Created successfully, redirect to login if auto-login fails
          redirect("/login?registered=true");
        }

        redirect("/dashboard/new-store");
      } catch (adminFallbackErr: any) {
        if (adminFallbackErr?.digest?.includes("NEXT_REDIRECT")) throw adminFallbackErr;
        return { error: normalSignUpError.message };
      }
    } else {
      return { error: normalSignUpError.message };
    }
  }

  redirect("/dashboard/new-store");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const validated = z.string().email().safeParse(email);
  if (!validated.success) {
    return { error: "Please enter a valid email address." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validated = resetPasswordSchema.safeParse({
    password,
    confirmPassword,
  });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
