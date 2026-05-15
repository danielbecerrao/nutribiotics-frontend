import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedShell } from "./authenticated-shell";

const mocks = vi.hoisted(() => ({
  clearSession: vi.fn(),
  pathname: "/doctor/prescriptions",
  replace: vi.fn(),
  toggleTheme: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth", () => ({
  loginPath: "/login",
  useAuth: () => ({
    clearSession: mocks.clearSession,
    user: {
      email: "doctor@example.com",
      name: "Doctor User",
      role: "doctor",
    },
  }),
}));

vi.mock("@/lib/theme", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: mocks.toggleTheme,
  }),
}));

describe("AuthenticatedShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/doctor/prescriptions";
  });

  it("shows the authenticated user and active role navigation", () => {
    render(
      <AuthenticatedShell
        navItems={[{ href: "/doctor/prescriptions", label: "Prescriptions" }]}
        title="Doctor workspace"
      >
        <p>Content</p>
      </AuthenticatedShell>,
    );

    expect(screen.getByText("Doctor User")).toBeInTheDocument();
    expect(screen.getByText("doctor@example.com")).toBeInTheDocument();
    expect(screen.getByText("Doctor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Prescriptions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("clears the local session and redirects to login on logout", async () => {
    const user = userEvent.setup();

    render(
      <AuthenticatedShell
        navItems={[{ href: "/doctor/prescriptions", label: "Prescriptions" }]}
        title="Doctor workspace"
      >
        <p>Content</p>
      </AuthenticatedShell>,
    );

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
