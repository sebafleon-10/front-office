"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0F14",
          color: "#F5F7FA",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7E8B9A" }}>
            Front Office
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "12px 0 0" }}>
            The season hit a snag.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9BA6B2", margin: "12px 0 0" }}>
            Something went wrong at the root of the app. Reloading rebuilds the
            exact same season from your decisions.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 11, color: "#7E8B9A", margin: "8px 0 0" }}>Ref {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#4C8DFF",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload the season
          </button>
        </div>
      </body>
    </html>
  );
}
