"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
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
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);

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

  function findNearMe() {
    if (!navigator.geolocation) {
      showToast("Your browser doesn't support location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("distance");
        setLocating(false);
        showToast("Sorted by distance from you.");
      },
      () => {
        setLocating(false);
        showToast("Couldn't get your location. Check your browser's permission settings.");
      },
      { timeout: 8000 }
    );
  }

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

  let list = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  function distanceOf(s) {
    if (!userCoords || s.latitude == null || s.longitude == null) return Infinity;
    return haversineMiles(userCoords.lat, userCoords.lng, s.latitude, s.longitude);
  }

  if (sort === "rating") list = [...list].sort((a, b) => avgRating(b.reviews) - avgRating(a.reviews));
  else if (sort === "reviews") list = [...list].sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
  else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "distance") list = [...list].sort((a, b) => distanceOf(a) - distanceOf(b));

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand">
            <div>
              <span className="logo">RetroFind</span>
              <small>find your next cartridge</small>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add a Store
          </button>
        </div>
      </header>

      <div className="hero">
        <svg className="confetti c1" width="70" height="70" viewBox="0 0 70 70"><path d="M5 35 Q15 10 25 35 T45 35 T65 35" stroke="var(--ink)" strokeWidth="4" fill="none" strokeLinecap="round"/></svg>
        <svg className="confetti c2" width="50" height="50" viewBox="0 0 50 50"><polygon points="25,4 46,44 4,44" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="3"/></svg>
        <svg className="confetti c3" width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="18" fill="none" stroke="var(--pink)" strokeWidth="8"/><circle cx="23" cy="23" r="18" fill="none" stroke="var(--ink)" strokeWidth="2"/></svg>
        <svg className="confetti c4" width="40" height="40" viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" fill="var(--cyan)" stroke="var(--ink)" strokeWidth="3" transform="rotate(20 20 20)"/></svg>

        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Find the <span className="pink">good</span> retro stores.
            </h1>
            <p className="sub">
              Arcades, cartridge shops, repair counters — reviewed by the people who actually dig through
              the bins.
            </p>
          </div>
          <div className="mascot-wrap">
            <svg className="console" viewBox="0 0 200 160" width="190">
              <rect x="20" y="40" width="160" height="80" rx="14" fill="#FFFBEF" stroke="#161616" strokeWidth="4"/>
              <rect x="40" y="60" width="50" height="16" rx="4" fill="#161616"/>
              <circle cx="150" cy="68" r="10" fill="var(--cyan)" stroke="#161616" strokeWidth="3"/>
              <circle cx="130" cy="90" r="10" fill="var(--yellow)" stroke="#161616" strokeWidth="3"/>
              <rect x="85" y="20" width="30" height="26" rx="4" fill="var(--pink)" stroke="#161616" strokeWidth="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <div className="how-step"><div className="shape">🔎</div><div><b>Find</b><span>Search or use your location</span></div></div>
        <div className="how-step"><div className="shape">🚗</div><div><b>Visit</b><span>Get directions in one tap</span></div></div>
        <div className="how-step"><div className="shape">⭐</div><div><b>Rate</b><span>Leave a review, add a photo</span></div></div>
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
          {userCoords && <option value="distance">Sort: Nearest to me</option>}
        </select>
        <button className="btn btn-teal locate-btn" onClick={findNearMe} disabled={locating}>
          📍 {locating ? "Locating…" : "Find stores near me"}
        </button>
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
            const dist = distanceOf(s);
            const mapsQuery = encodeURIComponent(s.address);
            return (
              <div key={s.id} className={`card ${isGold ? "golden" : ""} ${isLow ? "low-score" : ""}`}>
                {isGold && <span className="price-tag">TOP SCORE</span>}
                {isLow && <span className="price-tag low">GAME OVER</span>}
                <div className="card-top">
                  <div>
                    <h3><Link href={`/store/${s.id}`}>{s.name}</Link></h3>
                    <div className="loc">📍 {s.address}</div>
                    {userCoords && dist !== Infinity && (
                      <div className="distance">{dist.toFixed(1)} mi away</div>
                    )}
                  </div>
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
                <div className="review-count">{s.reviews?.length || 0} review{(s.reviews?.length || 0) !== 1 ? "s" : ""} · {s.photos?.length || 0} photo{(s.photos?.length || 0) !== 1 ? "s" : ""}</div>

                <div className="maps-row">
                  <a className="btn btn-teal btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noreferrer">Google Maps</a>
                  <a className="btn btn-ghost btn-sm" href={`https://maps.apple.com/?q=${mapsQuery}`} target="_blank" rel="noreferrer">Apple Maps</a>
                </div>

                <div className="card-actions">
                  <Link href={`/store/${s.id}`} className="btn btn-ghost" style={{ textDecoration: "none", textAlign: "center" }}>
                    View store & photos
                  </Link>
                  <button className="btn btn-primary" onClick={() => setOpenId(isOpen ? null : s.id)}>
                    {isOpen ? "Hide reviews" : "Quick review"}
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
        RetroFind — built by collectors, for collectors. Reviews are public. See something wrong? Hit Report.
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
            <p style={{ fontSize: "0.75rem", color: "var(--ink-faint)", marginTop: 10 }}>
              Note: stores added here won&apos;t show a distance in &quot;near me&quot; sorting yet —
              coordinates for user-submitted stores are on the roadmap.
            </p>
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
