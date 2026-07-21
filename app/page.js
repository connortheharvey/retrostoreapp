"use client";
import { useEffect, useState } from "react";

function Stars({ value }) {
  const rounded = Math.round(value);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "" : "empty"}>★</span>
      ))}
    </span>
  );
}

function avgRating(reviews) {
  if (!reviews?.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function Home() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", address: "", description: "", specialties: "", website: "" });
  const [reviewDrafts, setReviewDrafts] = useState({});

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      setStores(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast("Connection lost. Try refreshing.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitStore() {
    if (!newStore.name.trim() || !newStore.address.trim()) {
      showToast("Every store needs a name and an address.");
      return;
    }
    const specialties = newStore.specialties
      ? newStore.specialties.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newStore, specialties }),
    });
    if (res.ok) {
      showToast("Store added to the map! 🕹️");
      setShowAddModal(false);
      setNewStore({ name: "", address: "", description: "", specialties: "", website: "" });
      loadData();
    } else {
      const err = await res.json();
      showToast(err.error || "Something glitched.");
    }
  }

  async function submitReview(storeId) {
    const draft = reviewDrafts[storeId] || {};
    if (!draft.rating) {
      showToast("Pick a star rating first.");
      return;
    }
    if (!draft.comment?.trim()) {
      showToast("Add a comment — what made this store worth the trip (or not)?");
      return;
    }
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store_id: storeId,
        reviewer_name: draft.name,
        rating: draft.rating,
        comment: draft.comment,
      }),
    });
    if (res.ok) {
      showToast("Review submitted. High score! 🏆");
      setReviewDrafts((d) => ({ ...d, [storeId]: {} }));
      loadData();
    } else {
      const err = await res.json();
      showToast(err.error || "Something glitched.");
    }
  }

  async function reportReview(reviewId) {
    if (!confirm("Report this review as inappropriate? It'll be hidden pending the owner's review.")) return;
    const res = await fetch(`/api/reviews/${reviewId}/flag`, { method: "POST" });
    if (res.ok) {
      showToast("Reported. Hidden pending review.");
      loadData();
    } else {
      showToast("Couldn't report that. Try again?");
    }
  }

  const totalReviews = stores.reduce((s, b) => s + (b.reviews?.length || 0), 0);
  const allRatings = stores.flatMap((b) => (b.reviews || []).map((r) => r.rating));
  const overallAvg = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : "—";

  let list = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === "rating") list = [...list].sort((a, b) => avgRating(b.reviews) - avgRating(a.reviews));
  else if (sort === "reviews") list = [...list].sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
  else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <div>
            <span className="logo">RETROSTORE PORTAL</span>
            <small>&gt; find your next cartridge_</small>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add a Store
        </button>
      </header>

      <div className="hero">
        <div className="hero-copy">
          <h1>
            Find the <span className="accent">good</span> retro stores.<br />
            Skip the dusty scams.
          </h1>
          <p className="sub">
            Arcades, cartridge shops, repair counters — reviewed by the people who actually dig through
            the bins. Insert coin to continue<span className="blink-cursor">&nbsp;</span>
          </p>
          <div className="hero-stats">
            <div className="stat"><b>{stores.length}</b><span>Stores Logged</span></div>
            <div className="stat"><b>{totalReviews}</b><span>Reviews</span></div>
            <div className="stat"><b>{overallAvg}</b><span>Avg Rating</span></div>
          </div>
        </div>
        <div className="mascot-wrap">
          <svg className="console" viewBox="0 0 200 160" width="200">
            <rect x="20" y="40" width="160" height="80" rx="14" fill="#6C4FE0" stroke="#4CE0D2" strokeWidth="3"/>
            <rect x="40" y="60" width="50" height="16" rx="4" fill="#14133D"/>
            <circle cx="150" cy="68" r="10" fill="#FF4FA3"/>
            <circle cx="130" cy="90" r="10" fill="#FFC94C"/>
            <rect x="85" y="20" width="30" height="26" rx="4" fill="#4CE0D2"/>
          </svg>
        </div>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or neighborhood…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Sort: Highest rated</option>
          <option value="reviews">Sort: Most reviewed</option>
          <option value="name">Sort: Name (A–Z)</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-msg">LOADING… please wait, blowing on the cartridge 🎮</p>
      ) : list.length === 0 ? (
        <p className="loading-msg">No stores match that search. Nothing found in this dungeon.</p>
      ) : (
        <div className="grid">
          {list.map((s) => {
            const avg = avgRating(s.reviews);
            const isGold = avg >= 4.5 && (s.reviews?.length || 0) >= 2;
            const isLow = avg > 0 && avg <= 2 && (s.reviews?.length || 0) >= 2;
            const isOpen = openId === s.id;
            const draft = reviewDrafts[s.id] || {};
            return (
              <div key={s.id} className={`card ${isGold ? "golden" : ""} ${isLow ? "low-score" : ""}`}>
                <div className="card-top">
                  <div>
                    <h3>{s.name}</h3>
                    <div className="loc">📍 {s.address}</div>
                  </div>
                  {isGold && <span className="badge gold">TOP SCORE</span>}
                  {isLow && <span className="badge low">GAME OVER</span>}
                </div>
                <div>
                  <Stars value={avg} />
                  <span className="score-num">{avg > 0 ? avg.toFixed(1) : "Unrated"}</span>
                </div>
                <div className="tags">
                  {(s.specialties || []).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <div className="desc">{s.description}</div>
                {s.website && (
                  <div className="desc"><a href={s.website} target="_blank" rel="noreferrer">{s.website}</a></div>
                )}
                <div className="review-count">{s.reviews?.length || 0} review{(s.reviews?.length || 0) !== 1 ? "s" : ""}</div>
                <div className="card-actions">
                  <button className="btn btn-ghost" onClick={() => setOpenId(isOpen ? null : s.id)}>
                    {isOpen ? "Hide reviews" : "Read reviews"}
                  </button>
                  <button className="btn btn-primary" onClick={() => setOpenId(isOpen ? null : s.id)}>
                    {isOpen ? "Never mind" : "Leave a review"}
                  </button>
                </div>

                {isOpen && (
                  <>
                    <div className="reviews">
                      {(s.reviews?.length || 0) === 0 ? (
                        <div className="empty-review">No reviews yet. Be the first player.</div>
                      ) : (
                        s.reviews.map((r) => (
                          <div className="review" key={r.id}>
                            <div className="review-head">
                              <span>{r.reviewer_name || "Anonymous Collector"}</span>
                              <Stars value={r.rating} />
                            </div>
                            <p>{r.comment}</p>
                            <button className="report-link" onClick={() => reportReview(r.id)}>Report</button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="review-form">
                      <span className="form-label">Your name (optional)</span>
                      <input
                        type="text"
                        placeholder="Anonymous Collector"
                        value={draft.name || ""}
                        onChange={(e) =>
                          setReviewDrafts((d) => ({ ...d, [s.id]: { ...draft, name: e.target.value } }))
                        }
                      />
                      <span className="form-label">Rating</span>
                      <div className="picker">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={n <= (draft.rating || 0) ? "filled" : ""}
                            onClick={() =>
                              setReviewDrafts((d) => ({ ...d, [s.id]: { ...draft, rating: n } }))
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="form-label">Comment</span>
                      <textarea
                        rows="2"
                        placeholder="Selection, prices, staff knowledge, vibe?"
                        value={draft.comment || ""}
                        onChange={(e) =>
                          setReviewDrafts((d) => ({ ...d, [s.id]: { ...draft, comment: e.target.value } }))
                        }
                      />
                      <button className="btn btn-primary" onClick={() => submitReview(s.id)} style={{ marginTop: 6 }}>
                        Submit review
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <footer>
        RetroStorePortal — built by collectors, for collectors. Reviews are public. See something wrong? Hit Report.
      </footer>

      {showAddModal && (
        <div className="overlay">
          <div className="modal">
            <h2>Add a Store</h2>
            <label>Store name</label>
            <input
              placeholder="e.g. Video Game Vault"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            />
            <label>Address / neighborhood</label>
            <input
              placeholder="e.g. 221 W 8th St, New York, NY"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            />
            <label>Description</label>
            <textarea
              rows="3"
              placeholder="What's the store known for?"
              value={newStore.description}
              onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
            />
            <label>Specialties (comma separated)</label>
            <input
              placeholder="NES/SNES, Arcade Cabinets, Repairs, Imports"
              value={newStore.specialties}
              onChange={(e) => setNewStore({ ...newStore, specialties: e.target.value })}
            />
            <label>Website (optional)</label>
            <input
              placeholder="https://..."
              value={newStore.website}
              onChange={(e) => setNewStore({ ...newStore, website: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Never mind</button>
              <button className="btn btn-primary" onClick={submitStore}>Add to the map</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
