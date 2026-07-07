import { Link } from "wouter";
import { ROUTE_PATHS } from "@/app/routes/routePaths";

export default function NotFound() {
  return (
    <div
      className="fi-not-found"
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: "#FAF7F4",
          color: "#1F1F1F",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#4B5563",
              marginBottom: "0.75rem",
            }}
          >
            Relationship Concierge
          </p>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem", fontWeight: 600 }}>
            This path is not part of your concierge yet
          </h1>
          <p style={{ color: "#4B5563", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            The link may be outdated, or the page may have moved. Your relationships and reminders
            are still right where you left them.
          </p>
          <Link
            href={ROUTE_PATHS.home}
            style={{
              color: "#E23B2E",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Return home
        </Link>
      </div>
    </div>
  );
}
