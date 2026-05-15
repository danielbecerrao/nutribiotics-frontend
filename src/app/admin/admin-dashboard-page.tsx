"use client";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  getAdminMetrics,
  type AdminMetrics,
  type AdminMetricsQuery,
} from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartColors = {
  consumed: "#2f855a",
  daily: "#2b6cb0",
  pending: "#b7791f",
};

export function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(
    () => getQueryFromSearchParams(searchParams),
    [searchParams],
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

        return getAdminMetrics(tokens.accessToken, query, {
          signal: controller.signal,
        });
      })
      .then((response) => {
        if (!response) {
          return;
        }

        setMetrics(response);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load admin metrics.",
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

    updateQueryString(getQueryFromForm(event.currentTarget));
  }

  function handleClearFilters() {
    router.push("/admin");
  }

  function updateQueryString(nextQuery: AdminMetricsQuery) {
    const params = new URLSearchParams();

    if (nextQuery.from) {
      params.set("from", nextQuery.from);
    }

    if (nextQuery.to) {
      params.set("to", nextQuery.to);
    }

    const queryString = params.toString();
    router.push(queryString ? `/admin?${queryString}` : "/admin");
  }

  const hasFilters = Boolean(query.from || query.to);
  const statusData = metrics ? getStatusChartData(metrics) : [];
  const dailyData = metrics ? getDailyChartData(metrics) : [];
  const hasPrescriptionMetrics = Boolean(
    metrics &&
      (metrics.totals.prescriptions > 0 ||
        dailyData.length > 0 ||
        metrics.topDoctors.length > 0),
  );

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Track directory and prescription activity across the platform.
        </p>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border bg-surface p-4 shadow-sm sm:grid-cols-[minmax(160px,220px)_minmax(160px,220px)_auto_auto]"
        key={searchParams.toString()}
        onSubmit={handleSubmit}
      >
        <Input
          defaultValue={query.from ?? ""}
          label="From"
          name="from"
          type="date"
        />
        <Input defaultValue={query.to ?? ""} label="To" name="to" type="date" />
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

      {isLoading ? <LoadingState label="Loading admin metrics" /> : null}

      {!isLoading && error ? (
        <ErrorState
          actionLabel="Retry"
          message={error}
          onAction={() => setReloadKey((current) => current + 1)}
          title="Unable to load admin metrics"
        />
      ) : null}

      {!isLoading && !error && metrics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Doctors"
              tone="info"
              value={metrics.totals.doctors}
            />
            <MetricCard
              label="Patients"
              tone="success"
              value={metrics.totals.patients}
            />
            <MetricCard
              label="Prescriptions"
              tone="warning"
              value={metrics.totals.prescriptions}
            />
          </div>

          {hasPrescriptionMetrics ? (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                <ChartPanel title="Prescriptions by status">
                  <ResponsiveContainer height={260} width="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid stroke="#d9ded4" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {statusData.map((item) => (
                          <Cell fill={item.fill} key={item.name} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Prescriptions by day">
                  <ResponsiveContainer height={260} width="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid stroke="#d9ded4" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} />
                      <Tooltip />
                      <Line
                        dataKey="total"
                        dot={{ r: 3 }}
                        stroke={chartColors.daily}
                        strokeWidth={2}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </div>

              <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Top doctors
                  </h3>
                  <Badge tone="info">Top 5</Badge>
                </div>
                {metrics.topDoctors.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead className="text-right">Prescriptions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.topDoctors.map((item) => (
                        <TableRow key={item.doctorId}>
                          <TableCell className="font-medium">
                            {item.doctor.user.name}
                          </TableCell>
                          <TableCell>
                            {item.doctor.specialty ?? "Not registered"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      message="No doctors have prescriptions in the selected period."
                      title="No top doctors"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              message={
                hasFilters
                  ? "No prescriptions match the selected date range."
                  : "Prescription activity will appear when records are created."
              }
              title="No prescription metrics"
            />
          )}
        </>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "info" | "success" | "warning";
  value: number;
}) {
  return (
    <article className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-4 text-3xl font-semibold text-foreground">
        {formatNumber(value)}
      </p>
    </article>
  );
}

function ChartPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

interface SearchParamsReader {
  get: (name: string) => string | null;
}

function getQueryFromSearchParams(
  searchParams: SearchParamsReader,
): AdminMetricsQuery {
  return {
    from: toDateInputValue(searchParams.get("from") ?? ""),
    to: toDateInputValue(searchParams.get("to") ?? ""),
  };
}

function getQueryFromForm(form: HTMLFormElement): AdminMetricsQuery {
  const formData = new FormData(form);

  return {
    from: toDateInputValue(getStringFormValue(formData, "from")),
    to: toDateInputValue(getStringFormValue(formData, "to")),
  };
}

function getStringFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function toDateInputValue(value: string) {
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);

  return match?.[0] ?? "";
}

function getStatusChartData(metrics: AdminMetrics) {
  return [
    {
      fill: chartColors.pending,
      name: "Pending",
      total: metrics.prescriptionsByStatus.pending,
    },
    {
      fill: chartColors.consumed,
      name: "Consumed",
      total: metrics.prescriptionsByStatus.consumed,
    },
  ];
}

function getDailyChartData(metrics: AdminMetrics) {
  return metrics.dailySeries.map((item) => ({
    date: formatShortDate(item.date),
    total: item.total,
  }));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
