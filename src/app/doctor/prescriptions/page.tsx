import { EmptyState } from "@/components/ui";

export default function DoctorPrescriptionsPage() {
  return (
    <EmptyState
      message="Created prescriptions will appear in this workspace."
      title="No prescriptions"
    />
  );
}
