import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-primary">
            Nutribiotics
          </p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Access prescription management with your assigned account.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
