import { ImageResponse } from "next/og";

export const alt = "Vantage — reference ops console";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori (the renderer) does not resolve CSS variables or oklch(), so every
// value here is a literal hex/rgb and every multi-child box sets display:flex.
export default function OgImage() {
  const bg = "#191512";
  const ink = "#f2ede6";
  const muted = "#a99f92";
  const amber = "#e8ac53";
  const green = "#4dc07e";
  const dots = ["#4dc07e", "#a78bfa", "#5aa2f0", "#e6b34e", "#e2686d"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          backgroundImage:
            "radial-gradient(900px 460px at 88% -12%, rgba(232,172,83,0.20), transparent)",
          color: ink,
          padding: 68,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: amber,
              alignItems: "center",
              justifyContent: "center",
              color: "#2a1e0e",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>
            Vantage
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              color: muted,
              textTransform: "uppercase",
            }}
          >
            Revenue · last 12 months
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", fontSize: 118, fontWeight: 800 }}>
              $765,745
            </div>
            <div
              style={{
                display: "flex",
                marginBottom: 26,
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(77,192,126,0.16)",
                color: green,
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              +32.7%
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 27, color: muted }}>
            Reference ops console · Next.js 16 · React 19 · Supabase
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {dots.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: c,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
