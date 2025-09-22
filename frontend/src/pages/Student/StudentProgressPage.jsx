import { useEffect, useState } from "react";

/**
 * Minimal Student Progress page:
 * - fetches the student's progress summary
 * - shows each enrolled course, progress %, lessons, and (if present) a certificate link
 *
 * For now we hardcode the studentId. We'll plug in auth later.
 */
export default function StudentProgressPage() {
  // TODO: replace with the logged-in student's ID (from JWT/user context)
  const STUDENT_ID = "S014";

  const [data, setData] = useState(null);     // server response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:5000/api/progress-reports/student/${STUDENT_ID}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load progress");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading progress…</div>;
  if (error)   return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;
  if (!data)   return <div style={{ padding: 16 }}>No data.</div>;

  const { student_id, courses = [] } = data;

  return (
    <div style={{ padding: 24, maxWidth: 920, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Student Progress</h2>
      <div style={{ opacity: 0.8, marginBottom: 24 }}>Student ID: <b>{student_id}</b></div>

      {courses.length === 0 && (
        <div>No active courses found.</div>
      )}

      {courses.map((c) => {
        const pct = Number(c?.progress_percent || 0);
        const progressLabel = `${c?.completed_lessons ?? 0} / ${c?.total_lessons ?? 0} lessons`;

        // try to turn absolute file path into a browser URL if it contains "uploads"
        let certificateHref = "";
        if (c?.certificate_file) {
          const idx = String(c.certificate_file).lastIndexOf("uploads");
          if (idx !== -1) {
            certificateHref = `http://localhost:5000/${c.certificate_file.slice(idx).replaceAll("\\", "/")}`;
          }
        }

        return (
          <div
            key={c.course_name}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              background: "#fff"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>{c.course_name}</h3>
              <div style={{ fontSize: 14, color: "#6b7280" }}>{progressLabel}</div>
            </div>

            {/* progress bar */}
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999 }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "#3b82f6",
                    transition: "width .3s ease"
                  }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#374151" }}>
                {pct}% completed
              </div>
            </div>

            {/* last lesson snapshot */}
            {c.last_lesson ? (
              <div style={{ fontSize: 14, color: "#4b5563", marginTop: 8 }}>
                <div>Last lesson: <b>#{c.last_lesson.lesson_number}</b></div>
                <div>Date: {new Date(c.last_lesson.date).toLocaleString()}</div>
                <div>Feedback: {c.last_lesson.feedback || "-"}</div>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>
                No lessons recorded yet.
              </div>
            )}

            {/* certificate */}
            <div style={{ marginTop: 12 }}>
              {c.certificate_status === "Issued" && certificateHref ? (
                <a
                  href={certificateHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #3b82f6",
                    textDecoration: "none",
                    color: "#fff",
                    background: "#3b82f6"
                  }}
                >
                  🎓 Download Certificate ({c.certificateId})
                </a>
              ) : c.certificate_status === "Eligible" ? (
                <span style={{ fontSize: 14, color: "#10b981" }}>
                  ✅ Eligible — waiting for issuance
                </span>
              ) : (
                <span style={{ fontSize: 14, color: "#6b7280" }}>
                  Not eligible yet
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
