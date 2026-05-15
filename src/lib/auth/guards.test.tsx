import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth, RequireRole } from "./guards";
import type { AuthStatus, AuthUser } from "./types";

const mocks = vi.hoisted(() => ({
  auth: {
    status: "loading" as AuthStatus,
    user: null as AuthUser | null,
  },
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("./auth-context", () => ({
  useAuth: () => mocks.auth,
}));

function Fallback() {
  return <p>Fallback content</p>;
}

function ProtectedContent({ children = "Protected content" }: { children?: ReactNode }) {
  return <p>{children}</p>;
}

const doctorUser: AuthUser = {
  createdAt: "2026-05-14T00:00:00.000Z",
  email: "doctor@example.com",
  id: "user_1",
  name: "Doctor User",
  role: "doctor",
};

const adminUser: AuthUser = {
  ...doctorUser,
  email: "admin@example.com",
  id: "user_2",
  name: "Admin User",
  role: "admin",
};

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.status = "loading";
    mocks.auth.user = null;
  });

  it("redirects anonymous users to login and renders the fallback", async () => {
    mocks.auth.status = "anonymous";

    render(
      <RequireAuth fallback={<Fallback />}>
        <ProtectedContent />
      </RequireAuth>,
    );

    expect(screen.getByText("Fallback content")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login");
    });
  });

  it("renders children when the authenticated user has the allowed role", () => {
    mocks.auth.status = "authenticated";
    mocks.auth.user = adminUser;

    render(
      <RequireRole allowedRoles={["admin"]} fallback={<Fallback />}>
        <ProtectedContent />
      </RequireRole>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects authenticated users away from disallowed roles", async () => {
    mocks.auth.status = "authenticated";
    mocks.auth.user = doctorUser;

    render(
      <RequireRole allowedRoles={["admin"]} fallback={<Fallback />}>
        <ProtectedContent />
      </RequireRole>,
    );

    expect(screen.getByText("Fallback content")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/doctor/prescriptions");
    });
  });
});
