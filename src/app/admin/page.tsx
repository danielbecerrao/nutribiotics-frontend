import { Badge } from "@/components/ui";

const metrics = [
  { label: "Prescriptions", value: "0", tone: "info" },
  { label: "Pending", value: "0", tone: "warning" },
  { label: "Consumed", value: "0", tone: "success" },
] as const;

export default function AdminPage() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article
          className="rounded-md border border-border bg-surface p-4 shadow-sm"
          key={metric.label}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </h2>
            <Badge tone={metric.tone}>{metric.label}</Badge>
          </div>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {metric.value}
          </p>
        </article>
      ))}
    </section>
  );
}
