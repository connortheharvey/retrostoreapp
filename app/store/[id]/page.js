"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabaseBrowser";

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

export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({});
  const [userCoords, setUserCoords] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function loadStore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${params.id}`);
      if (!res.ok) {
        setStore(null);
      } else {
        setStore(await res.json());
      }
    } catch (e) {
      showToast("Couldn't reach the server.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStore();
    // best-effort — if the user already granted location elsewhere in the app
    // this will resolve quickly; if not, it just silently fails and we skip distance
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 4000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = getBrowserClient();
      const path = `${store.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("store-photos")
        .upload(path, file);

      if (uploadError) {
        showToast("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("store-photos").getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;

      const res = await fetch(`/api/stores/${store.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
      });

      if (res.ok) {
        showToast("Photo added! 📸");
        loadStore();
      } else {
        showToast("Uploaded, but couldn't save it to the store. Try again?");
      }
    } catch (err) {
      showToast("Something went wrong uploading that photo.");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function submitReview() {
    if (!reviewDraft.rating) {
      showToast("Pick a star rating first.");
      return;
    }
    if (!reviewDraft.comment?.trim()) {
      showToast("Add a comment.");
      return;
    }
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store_id: store.id,
        reviewer_name: reviewDraft.name,
        rating: reviewDraft.rating,
        comment: reviewDraft.comment,
      }),
    });
    if (res.ok) {
      showToast("Review submitted. High score! 🏆");
      setReviewDraft({});
      loadStore();
    } else {
      const err = await res.json();
      showToast(err.error || "Something glitched.");
    }
  }

  async function reportReview(reviewId) {
    if (!confirm("Report this review as inappropriate?")) return;
    const res = await fetch(`/api/reviews/${reviewId}/flag`, { method: "POST" });
    if (res.ok) {
      showToast("Reported. Hidden pending review.");
      loadStore();
    }
  }

  if (loading) {
    return <p className="loading-msg">LOADING… please wait, blowing on the cartridge 🎮</p>;
  }
  if (!store) {
    return (
      <div className="detail-wrap">
        <Link href="/" className="back-link">← Back to all stores</Link>
        <p className="loading-msg">Couldn't find that store. It may have been removed.</p>
      </div>
    );
  }

  const avg = avgRating(store.reviews);
  const hasCoords = store.latitude != null && store.longitude != null;
  const distance =
    hasCoords && userCoords
      ? haversineMiles(userCoords.lat, userCoords.lng, store.latitude, store.longitude)
      : null;

  const mapsQuery = encodeURIComponent(store.address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${mapsQuery}`;

  return (
    <div className="detail-wrap">
      <Link href="/" className="back-link">← Back to all stores</Link>

      <div className="detail-header">
        <div>
          <h1>{store.name}</h1>
          <div className="loc">📍 {store.address}</div>
          {distance !== null && <div className="distance">{distance.toFixed(1)} miles away</div>}
        </div>
        <div>
          <Stars value={avg} />
          <span className="score-num">{avg > 0 ? avg.toFixed(1) : "Unrated"}</span>
        </div>
      </div>

      <div className="tags">
        {(store.specialties || []).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>

      <p className="desc" style={{ marginTop: 14 }}>{store.description}</p>

      <div className="maps-row" style={{ marginTop: 10 }}>
        <a className="btn btn-teal" href={googleMapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
        <a className="btn btn-ghost" href={appleMapsUrl} target="_blank" rel="noreferrer">Open in Apple Maps</a>
        {store.website && (
          <a className="btn btn-ghost" href={store.website} target="_blank" rel="noreferrer">Visit website</a>
        )}
      </div>

      <section className="panel-box">
        <h2>Photos</h2>
        {(store.photos?.length || 0) === 0 ? (
          <div className="gallery-empty">No photos yet — be the first to show what this place looks like.</div>
        ) : (
          <div className="gallery">
            {store.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt={`${store.name} photo`} />
            ))}
          </div>
        )}
        <div className="upload-box">
          <label className="form-label" style={{ display: "block", marginBottom: 10 }}>
            Add a photo
          </label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          {uploading && <p style={{ color: "var(--ink-faint)", marginTop: 8 }}>Uploading…</p>}
        </div>
      </section>

      <section className="panel-box">
        <h2>Reviews ({store.reviews?.length || 0})</h2>
        <div className="reviews">
          {(store.reviews?.length || 0) === 0 ? (
            <div className="empty-review">No reviews yet. Be the first player.</div>
          ) : (
            store.reviews.map((r) => (
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

        <div className="review-form" style={{ marginTop: 14 }}>
          <span className="form-label">Your name (optional)</span>
          <input
            type="text"
            placeholder="Anonymous Collector"
            value={reviewDraft.name || ""}
            onChange={(e) => setReviewDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <span className="form-label">Rating</span>
          <div className="picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={n <= (reviewDraft.rating || 0) ? "filled" : ""}
                onClick={() => setReviewDraft((d) => ({ ...d, rating: n }))}
              >
                ★
              </span>
            ))}
          </div>
          <span className="form-label">Comment</span>
          <textarea
            rows="2"
            placeholder="Selection, prices, staff knowledge, vibe?"
            value={reviewDraft.comment || ""}
            onChange={(e) => setReviewDraft((d) => ({ ...d, comment: e.target.value }))}
          />
          <button className="btn btn-primary" onClick={submitReview} style={{ marginTop: 6, alignSelf: "flex-start" }}>
            Submit review
          </button>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
