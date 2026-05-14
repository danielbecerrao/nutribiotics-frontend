"use client";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
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
  listDoctorPrescriptions,
  type Prescription,
  type PrescriptionStatus,
} from "@/lib/prescriptions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
  from: string;
  status: PrescriptionStatus | "";
  to: string;
}

const emptyList: ListState = {
  data: [],
  limit: pageSize,
  page: 1,
  total: 0,
  totalPages: 0,
};

export function DoctorPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens } = useAuth();
  const [list, setList] = useState<ListState>(emptyList);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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

        return listDoctorPrescriptions(tokens.accessToken, query, {
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
    router.push("/doctor/prescriptions");
  }

  function handlePageChange(nextPage: number) {
    updateQueryString({ ...currentFilters, page: nextPage });
  }

  function updateQueryString(nextQuery: FilterValues & { page: number }) {
    const params = new URLSearchParams();

    if (nextQuery.status) {
      params.set("status", nextQuery.status);
    }

    if (nextQuery.from) {
      params.set("from", nextQuery.from);
    }

    if (nextQuery.to) {
      params.set("to", nextQuery.to);
    }

    if (nextQuery.page > 1) {
      params.set("page", String(nextQuery.page));
    }

    const queryString = params.toString();
    router.push(
      queryString
        ? `/doctor/prescriptions?${queryString}`
        : "/doctor/prescriptions",
    );
  }

  const hasFilters = Boolean(
    currentFilters.status || currentFilters.from || currentFilters.to,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Prescriptions</h2>
          <p className="text-sm text-muted-foreground">
            Review prescriptions created from your doctor account.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong"
          href="/doctor/prescriptions/new"
        >
          New prescription
        </Link>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border bg-surface p-4 shadow-sm md:grid-cols-[minmax(160px,220px)_minmax(160px,220px)_minmax(160px,220px)_auto_auto]"
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
        <Input
          defaultValue={currentFilters.from}
          label="From"
          name="from"
          type="date"
        />
        <Input
          defaultValue={currentFilters.to}
          label="To"
          name="to"
          type="date"
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
          action={
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md border border-primary bg-primary px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong"
              href="/doctor/prescriptions/new"
            >
              New prescription
            </Link>
          }
          message={
            hasFilters
              ? "No prescriptions match the selected filters."
              : "Created prescriptions will appear in this workspace."
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
                <TableHead>Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">{prescription.code}</TableCell>
                  <TableCell>{prescription.patient.user.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={prescription.status} />
                  </TableCell>
                  <TableCell>
                    <time dateTime={prescription.createdAt}>
                      {formatDate(prescription.createdAt)}
                    </time>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="font-medium text-primary hover:text-primary-strong"
                      href={`/doctor/prescriptions/${prescription.id}`}
                    >
                      View
                    </Link>
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
    from: searchParams.get("from") ?? "",
    status: getStatusFromSearchParams(searchParams),
    to: searchParams.get("to") ?? "",
  };
}

function getFiltersFromForm(form: HTMLFormElement): FilterValues {
  const formData = new FormData(form);

  return {
    from: getStringFormValue(formData, "from"),
    status: toFilterStatus(getStringFormValue(formData, "status")),
    to: getStringFormValue(formData, "to"),
  };
}

function getStringFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getStatusFromSearchParams(
  searchParams: SearchParamsReader,
): PrescriptionStatus | "" {
  const status = searchParams.get("status");

  return status === "pending" || status === "consumed" ? status : "";
}

function getPageFromSearchParams(searchParams: SearchParamsReader) {
  const page = Number(searchParams.get("page"));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function toFilterStatus(value: string): PrescriptionStatus | "" {
  return value === "pending" || value === "consumed" ? value : "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
