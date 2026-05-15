import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewPrescriptionForm } from "./new-prescription-form";

const mocks = vi.hoisted(() => ({
  createPrescription: vi.fn(),
  listPatients: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    tokens: {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    },
  }),
}));

vi.mock("@/lib/patients", () => ({
  listPatients: mocks.listPatients,
}));

vi.mock("@/lib/prescriptions", () => ({
  createPrescription: mocks.createPrescription,
}));

const patientsResponse = {
  data: [
    {
      birthDate: null,
      id: "patient_1",
      user: {
        createdAt: "2026-05-14T00:00:00.000Z",
        email: "patient@example.com",
        id: "user_1",
        name: "Patient One",
        role: "patient",
      },
      userId: "user_1",
    },
  ],
  limit: 20,
  page: 1,
  total: 1,
  totalPages: 1,
};

describe("NewPrescriptionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listPatients.mockResolvedValue(patientsResponse);
  });

  it("validates required patient and item name", async () => {
    const user = userEvent.setup();

    render(<NewPrescriptionForm />);
    await screen.findByLabelText("Patient");
    await user.click(screen.getByRole("button", { name: "Create prescription" }));

    expect(screen.getByText("Patient is required.")).toBeInTheDocument();
    expect(screen.getByText("Item name is required.")).toBeInTheDocument();
    expect(mocks.createPrescription).not.toHaveBeenCalled();
  });

  it("creates a prescription and redirects to the detail route", async () => {
    const user = userEvent.setup();

    mocks.createPrescription.mockResolvedValue({
      id: "prescription_1",
    });

    render(<NewPrescriptionForm />);
    await user.selectOptions(await screen.findByLabelText("Patient"), "patient_1");
    await user.type(screen.getByLabelText("Name"), "Vitamin D");
    await user.type(screen.getByLabelText("Dosage"), "1 daily");
    await user.type(screen.getByLabelText("Quantity"), "30");
    await user.type(screen.getByLabelText("Instructions"), "After breakfast");
    await user.type(screen.getByLabelText("Notes"), "Follow up");
    await user.click(screen.getByRole("button", { name: "Create prescription" }));

    await waitFor(() => {
      expect(mocks.createPrescription).toHaveBeenCalledWith("access-token", {
        patientId: "patient_1",
        notes: "Follow up",
        items: [
          {
            dosage: "1 daily",
            instructions: "After breakfast",
            name: "Vitamin D",
            quantity: 30,
          },
        ],
      });
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith("Prescription created.");
    expect(mocks.push).toHaveBeenCalledWith(
      "/doctor/prescriptions/prescription_1",
    );
  });
});
