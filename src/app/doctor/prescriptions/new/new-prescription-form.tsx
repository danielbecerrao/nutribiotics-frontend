"use client";

import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { listPatients, type Patient } from "@/lib/patients";
import {
  createPrescription,
  type CreatePrescriptionItemInput,
} from "@/lib/prescriptions";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ItemDraft extends CreatePrescriptionItemInput {
  clientId: string;
  quantityText: string;
}

interface FormErrors {
  items?: Record<string, string>;
  patientId?: string;
}

const emptyItem = (): ItemDraft => ({
  clientId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  dosage: "",
  instructions: "",
  name: "",
  quantityText: "",
});

export function NewPrescriptionForm() {
  const router = useRouter();
  const { tokens } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tokens?.accessToken) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) {
          return null;
        }

        setIsLoadingPatients(true);
        setPatientsError(null);

        return listPatients(
          tokens.accessToken,
          {
            limit: 20,
            page: 1,
            q: patientSearch,
          },
          { signal: controller.signal },
        );
      })
      .then((response) => {
        if (!response) {
          return;
        }

        setPatients(response.data);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setPatientsError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load patients.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPatients(false);
        }
      });

    return () => controller.abort();
  }, [patientSearch, reloadKey, tokens?.accessToken]);

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        label: `${patient.user.name} (${patient.user.email})`,
        value: patient.id,
      })),
    [patients],
  );

  function updateItem(
    clientId: string,
    field: keyof Pick<
      ItemDraft,
      "dosage" | "instructions" | "name" | "quantityText"
    >,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item,
      ),
    );
    setErrors((current) => ({
      ...current,
      items: { ...current.items, [clientId]: "" },
    }));
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(clientId: string) {
    setItems((current) => current.filter((item) => item.clientId !== clientId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(selectedPatientId, items);

    if (validationErrors.patientId || Object.keys(validationErrors.items ?? {}).length) {
      setErrors(validationErrors);
      return;
    }

    if (!tokens?.accessToken) {
      toast.error("Session expired.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const prescription = await createPrescription(tokens.accessToken, {
        patientId: selectedPatientId,
        notes,
        items: toPrescriptionItems(items),
      });

      toast.success("Prescription created.");
      router.push(`/doctor/prescriptions/${prescription.id}`);
    } catch {
      toast.error("Unable to create prescription.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingPatients && patients.length === 0) {
    return <LoadingState label="Loading patients" />;
  }

  if (patientsError && patients.length === 0) {
    return (
      <ErrorState
        actionLabel="Retry"
        message={patientsError}
        onAction={() => setReloadKey((current) => current + 1)}
        title="Unable to load patients"
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <section className="grid gap-4 rounded-md border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[minmax(220px,320px)_1fr]">
          <Input
            label="Patient search"
            name="patientSearch"
            onChange={(event) => setPatientSearch(event.target.value)}
            placeholder="Name or email"
            value={patientSearch}
          />
          <Select
            disabled={isLoadingPatients}
            error={errors.patientId}
            label="Patient"
            name="patientId"
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setErrors((current) => ({ ...current, patientId: undefined }));
            }}
            options={patientOptions}
            placeholder={isLoadingPatients ? "Loading patients" : "Select patient"}
            value={selectedPatientId}
          />
        </div>

        {patientsError ? (
          <p className="text-sm font-medium text-danger-strong" role="alert">
            {patientsError}
          </p>
        ) : null}

        {!isLoadingPatients && patientOptions.length === 0 ? (
          <EmptyState
            message="No patients match the current search."
            title="No patients"
          />
        ) : null}

        <Textarea
          label="Notes"
          maxLength={1000}
          name="notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Treatment notes"
          value={notes}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Items</h2>
            <p className="text-sm text-muted-foreground">
              Medication, supplement, or treatment entries.
            </p>
          </div>
          <Button onClick={addItem} type="button" variant="secondary">
            Add item
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={addItem} type="button" variant="secondary">
                Add item
              </Button>
            }
            message="At least one item is required."
            title="No items"
          />
        ) : null}

        <div className="space-y-3">
          {items.map((item, index) => (
            <article
              className="rounded-md border border-border bg-surface p-4 shadow-sm"
              key={item.clientId}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Item {index + 1}
                </h3>
                <Button
                  onClick={() => removeItem(item.clientId)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Input
                  error={errors.items?.[item.clientId]}
                  label="Name"
                  name={`items.${item.clientId}.name`}
                  onChange={(event) =>
                    updateItem(item.clientId, "name", event.target.value)
                  }
                  placeholder="Item name"
                  value={item.name}
                />
                <Input
                  label="Dosage"
                  name={`items.${item.clientId}.dosage`}
                  onChange={(event) =>
                    updateItem(item.clientId, "dosage", event.target.value)
                  }
                  placeholder="Dosage"
                  value={item.dosage}
                />
                <Input
                  label="Quantity"
                  min={1}
                  name={`items.${item.clientId}.quantity`}
                  onChange={(event) =>
                    updateItem(item.clientId, "quantityText", event.target.value)
                  }
                  placeholder="Quantity"
                  type="number"
                  value={item.quantityText}
                />
                <Textarea
                  className="min-h-24"
                  label="Instructions"
                  name={`items.${item.clientId}.instructions`}
                  onChange={(event) =>
                    updateItem(
                      item.clientId,
                      "instructions",
                      event.target.value,
                    )
                  }
                  placeholder="Instructions"
                  value={item.instructions}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          onClick={() => router.push("/doctor/prescriptions")}
          type="button"
          variant="secondary"
        >
          Cancel
        </Button>
        <Button isLoading={isSubmitting} type="submit">
          Create prescription
        </Button>
      </div>
    </form>
  );
}

function validateForm(patientId: string, items: ItemDraft[]) {
  const errors: FormErrors = {};

  if (!patientId) {
    errors.patientId = "Patient is required.";
  }

  if (items.length === 0) {
    errors.items = { form: "At least one item is required." };
    return errors;
  }

  const itemErrors = items.reduce<Record<string, string>>((current, item) => {
    if (!item.name.trim()) {
      current[item.clientId] = "Item name is required.";
    }

    return current;
  }, {});

  if (Object.keys(itemErrors).length > 0) {
    errors.items = itemErrors;
  }

  return errors;
}

function toPrescriptionItems(items: ItemDraft[]) {
  return items.map((item) => ({
    name: item.name,
    dosage: item.dosage,
    quantity: item.quantityText ? Number(item.quantityText) : undefined,
    instructions: item.instructions,
  }));
}
