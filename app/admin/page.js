"use client";
import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [flagged, setFlagged] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Login failed.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFlagged(data);
      setAuthed(true);
    } catch (e) {
      setError("Couldn't reach the server.");
    }
    setLoading(false);
  }

  async function refresh() {
    const res = await fetch("/api/admin/reviews", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) setFlagged(await res.json());
  }

  async function restore(id) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "x-admin-password": password },
    });
    refresh();
  }

  async function permanentlyDelete(id) {
    if (!confirm("Permanently delete this review? This can't be undone.")) return;
    await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    refresh();
  }

  if (!authed) {
    return (
      <div className="admin-wrap">
        <h1>Moderation Login</h1>
        <div className="admin-login">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button className="btn btn-primary" onClick={login} disabled={loading}>
            {loading ? "Checking…" : "Log in"}
          </button>
        </div>
        {error && <p style={{ color: "var(--danger)", marginTop: 12 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <h1>Flagged Reviews ({flagged.length})</h1>
      {flagged.length === 0 ? (
        <p style={{ color: "#A9A5E8" }}>Nothing flagged right now. All clear.</p>
      ) : (
        flagged.map((r) => (
          <div className="flagged-item" key={r.id}>
            <div className="store-name">{r.stores?.name || "Unknown store"}</div>
            <div className="review-head">
              <span>{r.reviewer_name}</span>
              <span>{"★".repeat(r.rating)}</span>
            </div>
            <p>{r.comment}</p>
            <div className="flagged-actions">
              <button className="btn btn-ghost" onClick={() => restore(r.id)}>Restore (not a violation)</button>
              <button className="btn btn-primary" onClick={() => permanentlyDelete(r.id)}>Delete permanently</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
