import { EmptyState } from "@/components/ui";

export default function PatientPrescriptionsPage() {
  return (
    <EmptyState
      message="Available prescriptions will appear in this workspace."
      title="No prescriptions"
    />
  );
}
