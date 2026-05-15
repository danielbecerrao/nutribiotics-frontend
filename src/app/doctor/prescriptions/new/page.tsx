import { NewPrescriptionForm } from "./new-prescription-form";

export default function NewPrescriptionPage() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          New prescription
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a prescription for a selected patient.
        </p>
      </div>
      <NewPrescriptionForm />
    </section>
  );
}
