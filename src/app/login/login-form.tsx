"use client";

import { Button, Input } from "@/components/ui";
import {
  getCurrentProfile,
  login,
  redirectToRoleHome,
  useAuth,
} from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  form?: string;
  password?: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateLoginForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      });
      const user =
        response.user ?? (await getCurrentProfile(response.accessToken));
      const session: AuthSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user,
      };

      setSession(session);
      redirectToRoleHome((path) => router.replace(path), user.role);
    } catch {
      setErrors({ form: "Invalid email or password." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-md border border-border bg-surface p-5 shadow-sm"
      noValidate
      onSubmit={handleSubmit}
    >
      {errors.form ? (
        <p
          className="rounded-md border border-danger/25 bg-danger-soft px-3 py-2 text-sm font-medium text-danger-strong"
          role="alert"
        >
          {errors.form}
        </p>
      ) : null}

      <Input
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email}
        label="Email"
        name="email"
        onChange={(event) => updateValue("email", event.target.value)}
        placeholder="name@example.com"
        type="email"
        value={values.email}
      />

      <Input
        autoComplete="current-password"
        disabled={isSubmitting}
        error={errors.password}
        label="Password"
        name="password"
        onChange={(event) => updateValue("password", event.target.value)}
        placeholder="Enter your password"
        type="password"
        value={values.password}
      />

      <Button fullWidth isLoading={isSubmitting} type="submit">
        Sign in
      </Button>
    </form>
  );
}

function validateLoginForm(values: LoginFormValues) {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}
