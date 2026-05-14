import { AppShell } from "@/components/layout";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";

const prescriptionRows = [
  {
    code: "RX-20260514-AF31C092",
    doctor: "Dra. Paula Gomez",
    patient: "Mariana Ruiz",
    status: "pending",
  },
  {
    code: "RX-20260514-76A9E112",
    doctor: "Dr. Simon Vargas",
    patient: "Carlos Mesa",
    status: "consumed",
  },
];

export default function Home() {
  return (
    <AppShell
      actions={
        <>
          <Button variant="secondary">Export</Button>
          <Button>New prescription</Button>
        </>
      }
      description="Base interface components for the prescription management workflows."
      eyebrow="Nutribiotics"
      title="Prescription operations"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-end">
            <Input label="Search" name="search" placeholder="Code, patient, doctor" />
            <Select
              label="Status"
              name="status"
              options={[
                { label: "Pending", value: "pending" },
                { label: "Consumed", value: "consumed" },
              ]}
              placeholder="All statuses"
            />
            <Button className="sm:w-28">Filter</Button>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptionRows.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.patient}</TableCell>
                    <TableCell>{row.doctor}</TableCell>
                    <TableCell>
                      <Badge tone={row.status === "pending" ? "warning" : "success"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination limit={10} page={1} total={2} totalPages={1} />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Quick prescription note
            </h2>
            <div className="mt-4 space-y-4">
              <Input label="Patient" name="patient" placeholder="Patient name" />
              <Textarea
                label="Instructions"
                name="instructions"
                placeholder="Medication instructions"
              />
              <Button fullWidth variant="secondary">
                Save draft
              </Button>
            </div>
          </div>
          <EmptyState
            message="Use this space for workflow-specific empty states."
            title="No selection"
          />
        </aside>
      </div>
    </AppShell>
  );
}
