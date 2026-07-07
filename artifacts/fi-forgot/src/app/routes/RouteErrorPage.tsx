import { Link } from "wouter";
import { PublicLayoutShell } from "@/app/layouts/layoutShells";
import { ROUTE_PATHS } from "@/app/routes/routePaths";

export function RouteErrorPage() {
  return (
    <PublicLayoutShell>
      <div
        role="alert"
        className="fi-route-error"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
          We hit a small bump
        </h1>
        <p style={{ color: "#555", maxWidth: 420, marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Something interrupted this part of your concierge experience. You can return home and
          continue where you left off.
        </p>
        <Link href={ROUTE_PATHS.home}>Return home</Link>
      </div>
    </PublicLayoutShell>
  );
}
