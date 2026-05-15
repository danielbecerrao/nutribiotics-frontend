"use client";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  consumePrescription,
  downloadPrescriptionPdf,
  getPrescriptionById,
  type Prescription,
  type PrescriptionStatus,
} from "@/lib/prescriptions";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function PatientPrescriptionDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const { tokens } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsuming, setIsConsuming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const prescriptionId = useMemo(() => normalizeParam(params.id), [params.id]);

  useEffect(() => {
    if (!tokens?.accessToken || !prescriptionId) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) {
          return null;
        }

        setIsLoading(true);
        setError(null);

        return getPrescriptionById(tokens.accessToken, prescriptionId);
      })
      .then((response) => {
        if (!response) {
          return;
        }

        setPrescription(response);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load prescription.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [prescriptionId, reloadKey, tokens?.accessToken]);

  async function handleConsume() {
    if (!tokens?.accessToken || !prescription) {
      toast.error("Session expired.");
      return;
    }

    setIsConsuming(true);

    try {
      const updatedPrescription = await consumePrescription(
        tokens.accessToken,
        prescription.id,
      );

      setPrescription(updatedPrescription);
      toast.success("Prescription consumed.");
    } catch {
      toast.error("Unable to consume prescription.");
    } finally {
      setIsConsuming(false);
    }
  }

  async function handleDownload() {
    if (!tokens?.accessToken || !prescription) {
      toast.error("Session expired.");
      return;
    }

    setIsDownloading(true);

    try {
      const download = await downloadPrescriptionPdf(
        tokens.accessToken,
        prescription.id,
      );

      saveBlob(download.blob, download.filename);
    } catch {
      toast.error("Unable to download prescription PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading prescription" />;
  }

  if (error) {
    return (
      <ErrorState
        actionLabel="Retry"
        message={error}
        onAction={() => setReloadKey((current) => current + 1)}
        title="Unable to load prescription"
      />
    );
  }

  if (!prescription) {
    return (
      <EmptyState
        action={<BackLink />}
        message="The selected prescription could not be found."
        title="Prescription not found"
      />
    );
  }

  const canConsume = prescription.status === "pending";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <BackLink />
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Prescription detail
            </h2>
            <StatusBadge status={prescription.status} />
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {prescription.code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canConsume ? (
            <Button
              isLoading={isConsuming}
              onClick={handleConsume}
              type="button"
            >
              Consume
            </Button>
          ) : (
            <Button disabled type="button" variant="secondary">
              Consumed
            </Button>
          )}
          <Button
            isLoading={isDownloading}
            onClick={handleDownload}
            type="button"
            variant="secondary"
          >
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard title="Prescription">
          <DetailRow label="Code" value={prescription.code} />
          <DetailRow label="Date" value={formatDateTime(prescription.createdAt)} />
          <DetailRow label="Status" value={formatStatus(prescription.status)} />
        </DetailCard>

        <DetailCard title="Patient">
          <DetailRow label="Name" value={prescription.patient.user.name} />
          <DetailRow label="Email" value={prescription.patient.user.email} />
          <DetailRow
            label="Birth date"
            value={
              prescription.patient.birthDate
                ? formatDate(prescription.patient.birthDate)
                : "Not registered"
            }
          />
        </DetailCard>

        <DetailCard title="Doctor">
          <DetailRow label="Name" value={prescription.author.user.name} />
          <DetailRow label="Email" value={prescription.author.user.email} />
          <DetailRow
            label="Specialty"
            value={prescription.author.specialty ?? "Not registered"}
          />
        </DetailCard>
      </div>

      <DetailCard title="Notes">
        <p className="text-sm text-foreground">
          {prescription.notes?.trim() || "No notes registered."}
        </p>
      </DetailCard>

      <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-base font-semibold text-foreground">Items</h3>
        </div>
        {prescription.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Instructions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescription.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.dosage ?? "Not registered"}</TableCell>
                  <TableCell>{item.quantity ?? "Not registered"}</TableCell>
                  <TableCell>{item.instructions ?? "Not registered"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4">
            <EmptyState
              message="This prescription has no registered items."
              title="No items"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function BackLink() {
  return (
    <Link
      className="inline-flex text-sm font-medium text-primary hover:text-primary-strong"
      href="/patient/prescriptions"
    >
      Back to prescriptions
    </Link>
  );
}

function DetailCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: PrescriptionStatus }) {
  return (
    <Badge tone={status === "pending" ? "warning" : "success"}>
      {formatStatus(status)}
    </Badge>
  );
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatStatus(status: PrescriptionStatus) {
  return status === "pending" ? "Pending" : "Consumed";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
