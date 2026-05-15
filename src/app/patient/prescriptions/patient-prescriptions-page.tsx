"use client";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  Select,
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
  listPatientPrescriptions,
  type Prescription,
  type PrescriptionStatus,
} from "@/lib/prescriptions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";

const pageSize = 10;

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Consumed", value: "consumed" },
];

interface ListState {
  data: Prescription[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface FilterValues {
  status: PrescriptionStatus | "";
}

const emptyList: ListState = {
  data: [],
  limit: pageSize,
  page: 1,
  total: 0,
  totalPages: 0,
};

export function PatientPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens } = useAuth();
  const [list, setList] = useState<ListState>(emptyList);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [consumingIds, setConsumingIds] = useState<Record<string, boolean>>({});
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>(
    {},
  );

  const currentFilters = useMemo(
    () => getFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const page = useMemo(() => getPageFromSearchParams(searchParams), [searchParams]);
  const query = useMemo(
    () => ({
      ...currentFilters,
      limit: pageSize,
      page,
    }),
    [currentFilters, page],
  );

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

        setIsLoading(true);
        setError(null);

        return listPatientPrescriptions(tokens.accessToken, query, {
          signal: controller.signal,
        });
      })
      .then((response) => {
        if (!response) {
          return;
        }

        setList(response);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load prescriptions.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, reloadKey, tokens?.accessToken]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQueryString({ ...getFiltersFromForm(event.currentTarget), page: 1 });
  }

  function handleClearFilters() {
    router.push("/patient/prescriptions");
  }

  function handlePageChange(nextPage: number) {
    updateQueryString({ ...currentFilters, page: nextPage });
  }

  function updateQueryString(nextQuery: FilterValues & { page: number }) {
    const params = new URLSearchParams();

    if (nextQuery.status) {
      params.set("status", nextQuery.status);
    }

    if (nextQuery.page > 1) {
      params.set("page", String(nextQuery.page));
    }

    const queryString = params.toString();
    router.push(
      queryString
        ? `/patient/prescriptions?${queryString}`
        : "/patient/prescriptions",
    );
  }

  async function handleConsume(prescription: Prescription) {
    if (!tokens?.accessToken) {
      toast.error("Session expired.");
      return;
    }

    setBusyId(setConsumingIds, prescription.id, true);

    try {
      const updatedPrescription = await consumePrescription(
        tokens.accessToken,
        prescription.id,
      );

      setList((current) => ({
        ...current,
        data: current.data.map((item) =>
          item.id === updatedPrescription.id ? updatedPrescription : item,
        ),
      }));
      toast.success("Prescription consumed.");
    } catch {
      toast.error("Unable to consume prescription.");
    } finally {
      setBusyId(setConsumingIds, prescription.id, false);
    }
  }

  async function handleDownload(prescription: Prescription) {
    if (!tokens?.accessToken) {
      toast.error("Session expired.");
      return;
    }

    setBusyId(setDownloadingIds, prescription.id, true);

    try {
      const download = await downloadPrescriptionPdf(
        tokens.accessToken,
        prescription.id,
      );

      saveBlob(download.blob, download.filename);
    } catch {
      toast.error("Unable to download prescription PDF.");
    } finally {
      setBusyId(setDownloadingIds, prescription.id, false);
    }
  }

  const hasFilters = Boolean(currentFilters.status);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Prescriptions</h2>
        <p className="text-sm text-muted-foreground">
          Review your available and consumed prescriptions.
        </p>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border bg-surface p-4 shadow-sm sm:grid-cols-[minmax(160px,220px)_auto_auto]"
        key={searchParams.toString()}
        onSubmit={handleSubmit}
      >
        <Select
          defaultValue={currentFilters.status}
          label="Status"
          name="status"
          options={statusOptions}
          placeholder="All statuses"
        />
        <Button className="self-end" type="submit">
          Apply
        </Button>
        <Button
          className="self-end"
          disabled={!hasFilters}
          onClick={handleClearFilters}
          type="button"
          variant="secondary"
        >
          Clear
        </Button>
      </form>

      {isLoading ? <LoadingState label="Loading prescriptions" /> : null}

      {!isLoading && error ? (
        <ErrorState
          actionLabel="Retry"
          message={error}
          onAction={() => setReloadKey((current) => current + 1)}
          title="Unable to load prescriptions"
        />
      ) : null}

      {!isLoading && !error && list.total === 0 ? (
        <EmptyState
          message={
            hasFilters
              ? "No prescriptions match the selected status."
              : "Available prescriptions will appear in this workspace."
          }
          title="No prescriptions"
        />
      ) : null}

      {!isLoading && !error && list.total > 0 ? (
        <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">{prescription.code}</TableCell>
                  <TableCell>{prescription.author.user.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={prescription.status} />
                  </TableCell>
                  <TableCell>
                    <time dateTime={prescription.createdAt}>
                      {formatDate(prescription.createdAt)}
                    </time>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        className="inline-flex h-8 items-center rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                        href={`/patient/prescriptions/${prescription.id}`}
                      >
                        View
                      </Link>
                      {prescription.status === "pending" ? (
                        <Button
                          isLoading={Boolean(consumingIds[prescription.id])}
                          onClick={() => handleConsume(prescription)}
                          size="sm"
                          type="button"
                        >
                          Consume
                        </Button>
                      ) : (
                        <Button disabled size="sm" type="button" variant="secondary">
                          Consumed
                        </Button>
                      )}
                      <Button
                        isLoading={Boolean(downloadingIds[prescription.id])}
                        onClick={() => handleDownload(prescription)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            limit={list.limit}
            onPageChange={handlePageChange}
            page={list.page}
            total={list.total}
            totalPages={list.totalPages}
          />
        </div>
      ) : null}
    </section>
  );
}

function StatusBadge({ status }: { status: PrescriptionStatus }) {
  return (
    <Badge tone={status === "pending" ? "warning" : "success"}>
      {status === "pending" ? "Pending" : "Consumed"}
    </Badge>
  );
}

interface SearchParamsReader {
  get: (name: string) => string | null;
}

function getFiltersFromSearchParams(
  searchParams: SearchParamsReader,
): FilterValues {
  return {
    status: getStatusFromSearchParams(searchParams),
  };
}

function getFiltersFromForm(form: HTMLFormElement): FilterValues {
  const formData = new FormData(form);

  return {
    status: toFilterStatus(getStringFormValue(formData, "status")),
  };
}

function getStringFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getStatusFromSearchParams(
  searchParams: SearchParamsReader,
): PrescriptionStatus | "" {
  return toFilterStatus(searchParams.get("status") ?? "");
}

function getPageFromSearchParams(searchParams: SearchParamsReader) {
  const page = Number(searchParams.get("page"));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function toFilterStatus(value: string): PrescriptionStatus | "" {
  return value === "pending" || value === "consumed" ? value : "";
}

function setBusyId(
  setter: Dispatch<SetStateAction<Record<string, boolean>>>,
  id: string,
  value: boolean,
) {
  setter((current) => ({
    ...current,
    [id]: value,
  }));
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
