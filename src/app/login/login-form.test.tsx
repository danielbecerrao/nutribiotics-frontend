import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  login: vi.fn(),
  replace: vi.fn(),
  setSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  login: mocks.login,
  redirectToRoleHome: (
    navigate: (path: string) => void,
    role: "admin" | "doctor" | "patient",
  ) => {
    const paths = {
      admin: "/admin",
      doctor: "/doctor/prescriptions",
      patient: "/patient/prescriptions",
    };

    navigate(paths[role]);
  },
  useAuth: () => ({
    setSession: mocks.setSession,
  }),
}));

const doctorUser = {
  createdAt: "2026-05-14T00:00:00.000Z",
  email: "doctor@example.com",
  id: "user-1",
  name: "Doctor User",
  role: "doctor",
};

describe("LoginForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates required credentials", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("stores the returned session and redirects to the role home", async () => {
    const user = userEvent.setup();
    const session = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: doctorUser,
    };

    mocks.login.mockResolvedValue(session);

    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "doctor@example.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith({
        email: "doctor@example.com",
        password: "secret",
      });
    });

    expect(mocks.setSession).toHaveBeenCalledWith(session);
    expect(mocks.replace).toHaveBeenCalledWith("/doctor/prescriptions");
  });

  it("loads the profile when the login response has only tokens", async () => {
    const user = userEvent.setup();
    const tokenResponse = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };

    mocks.login.mockResolvedValue(tokenResponse);
    mocks.getCurrentProfile.mockResolvedValue(doctorUser);

    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "doctor@example.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mocks.getCurrentProfile).toHaveBeenCalledWith("access-token");
    });

    expect(mocks.setSession).toHaveBeenCalledWith({
      ...tokenResponse,
      user: doctorUser,
    });
    expect(mocks.replace).toHaveBeenCalledWith("/doctor/prescriptions");
  });

  it("shows a credentials error when the request fails", async () => {
    const user = userEvent.setup();

    mocks.login.mockRejectedValue(new Error("Unauthorized"));

    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "doctor@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Invalid email or password."),
    ).toBeInTheDocument();
    expect(mocks.setSession).not.toHaveBeenCalled();
  });
});
