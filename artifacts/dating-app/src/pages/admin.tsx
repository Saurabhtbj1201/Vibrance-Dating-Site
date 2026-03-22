import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, Plus, Trash2, Loader2, CheckCircle2,
  XCircle, Clock, User, GraduationCap, Building2,
  ChevronRight, ArrowLeft, X, Check, AlertCircle, Search, UserCog,
  BadgeCheck, Eye, ImageOff
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/components/layout";

const BASE_URL = import.meta.env.BASE_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

type Tab = "verifications" | "colleges" | "profiles" | "admins";

interface College { id: string; name: string; city?: string; state?: string; }
interface ProfileRow { profile: any; user: { id: string; email: string; createdAt: string; isAdmin: boolean }; }
interface VerificationRow { request: any; profile: { name: string; photos: string[] }; user: { email: string }; }
interface AdminUser { id: string; email: string; name?: string | null; photo?: string | null; createdAt: string; }

// ── Image lightbox ───────────────────────────────────────────────────────────

function ImageModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">{label}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <img src={url} alt={label} className="w-full rounded-2xl object-contain max-h-[70vh]" />
      </div>
    </div>
  );
}

function DocImageSet({ docs }: { docs: { url: string; label: string }[] }) {
  const [viewing, setViewing] = useState<{ url: string; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  return (
    <>
      {viewing && <ImageModal url={viewing.url} label={viewing.label} onClose={() => setViewing(null)} />}
      <div className="grid grid-cols-2 gap-2">
        {docs.map(doc => (
          <button key={doc.label} onClick={() => setViewing(doc)}
            className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-[4/3] flex items-center justify-center hover:border-primary/50 transition-colors group">
            {errors[doc.label] ? (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageOff className="w-5 h-5" />
                <span className="text-xs">{doc.label}</span>
              </div>
            ) : (
              <>
                <img src={doc.url} alt={doc.label}
                  className="w-full h-full object-cover"
                  onError={() => setErrors(e => ({ ...e, [doc.label]: true }))} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1">{doc.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

// ── API helpers ──────────────────────────────────────────────────────────────

function useAdminFetch<T>(path: string, token: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/admin/${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e === 403 ? "Access denied" : "Failed to load"); setLoading(false); });
  };

  useEffect(load, [token, ...deps]);
  return { data, loading, error, reload: load };
}

// ── Colleges Tab ─────────────────────────────────────────────────────────────

function CollegesTab({ token }: { token: string }) {
  const { toast } = useToast();
  const { data: colleges, loading, error, reload } = useAdminFetch<College[]>("colleges", token);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setAdding(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/colleges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), city: city.trim(), state: state.trim() }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: "College added" });
      setName(""); setCity(""); setState(""); setShowForm(false);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string, collegeName: string) => {
    if (!confirm(`Delete "${collegeName}"?`)) return;
    setDeleting(id);
    try {
      await fetch(`${BACKEND_URL}/api/admin/colleges/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "College removed" });
      reload();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const filtered = (colleges || []).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (error) return <div className="text-destructive text-sm text-center py-8">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges…"
            className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Add College / University</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *"
            className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City"
              className="bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
            <input value={state} onChange={e => setState(e.target.value)} placeholder="State"
              className="bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={adding}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Cancel</button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{filtered.length} college{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              {(c.city || c.state) && <p className="text-xs text-muted-foreground">{[c.city, c.state].filter(Boolean).join(", ")}</p>}
            </div>
            <button onClick={() => handleDelete(c.id, c.name)} disabled={deleting === c.id}
              className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
              {deleting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No colleges found</div>
        )}
      </div>
    </div>
  );
}

// ── Profiles Tab ─────────────────────────────────────────────────────────────

function ProfilesTab({ token, selfUserId }: { token: string; selfUserId: string }) {
  const { toast } = useToast();
  const { data: rows, loading, error, reload } = useAdminFetch<ProfileRow[]>("profiles", token);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; label: string } | null>(null);

  const filtered = (rows || []).filter(r =>
    (r.profile.name || "").toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = async (row: ProfileRow) => {
    if (!confirm(`Permanently delete "${row.profile.name || row.user.email}" and ALL their data? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${row.user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: "User deleted" });
      setSelected(null);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setDeleting(false); }
  };

  if (selected) {
    const p = selected.profile;
    const isSelf = selected.user.id === selfUserId;
    const badge = (label: string, val: string | null | undefined) =>
      val ? <span className="bg-muted text-foreground text-xs px-2 py-1 rounded-full border border-border">{label}: {val}</span> : null;

    return (
      <div className="space-y-4">
        {lightboxPhoto && <ImageModal url={lightboxPhoto.url} label={lightboxPhoto.label} onClose={() => setLightboxPhoto(null)} />}
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to profiles
        </button>

        {/* All photos grid */}
        {p.photos?.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {p.photos.map((url: string, i: number) => (
              <button key={i} onClick={() => setLightboxPhoto({ url, label: i === 0 ? "Main Photo" : `Photo ${i + 1}` })}
                className={`relative rounded-xl overflow-hidden bg-muted group ${i === 0 ? "col-span-2 row-span-2" : ""} aspect-square`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">Main</span>}
              </button>
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-bold text-foreground">{p.name || "No name"}{p.age ? `, ${p.age}` : ""}</p>
                {p.verificationStatus === "verified" && (
                  <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{selected.user.email}</p>
              {selected.user.isAdmin && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 mt-1 inline-block">Admin</span>
              )}
            </div>
            {p.verificationStatus === "verified" && (
              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            {p.verificationStatus === "pending" && (
              <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-full shrink-0">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>

          {/* Bio */}
          {p.bio && <p className="text-sm text-foreground bg-muted rounded-xl p-3 leading-relaxed">{p.bio}</p>}

          {/* Detail badges */}
          <div className="flex flex-wrap gap-2">
            {badge("Gender", p.gender)}
            {badge("Location", p.location)}
            {badge("Profession", p.profession)}
            {badge("Education", p.education)}
            {badge("College", p.collegeName)}
            {badge("Course", p.course)}
            {badge("Status", p.courseStatus)}
            {badge("Year", p.completionYear ? String(p.completionYear) : null)}
            {badge("Smoking", p.smoking)}
            {badge("Drinking", p.drinking)}
            {badge("Workout", p.workout)}
            {badge("Diet", p.diet)}
            {badge("Looking for", p.lookingFor)}
            {badge("Interested in", p.interestedIn)}
            {badge("Zodiac", p.zodiacSign)}
          </div>

          {/* Interests */}
          {p.interests?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map((i: string) => <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20">{i}</span>)}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {p.hobbies?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {p.hobbies.map((h: string) => <span key={h} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border">{h}</span>)}
              </div>
            </div>
          )}

          {/* Languages */}
          {p.languages?.length > 0 && (
            <div><p className="text-xs text-muted-foreground mb-1">Languages</p>
              <p className="text-sm text-foreground">{p.languages.join(", ")}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-1">Joined: {new Date(selected.user.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Delete user */}
        {!isSelf && (
          <button onClick={() => handleDeleteUser(selected)} disabled={deleting}
            className="w-full py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors disabled:opacity-60">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete User & All Data
          </button>
        )}
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (error) return <div className="text-destructive text-sm text-center py-8">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} profile{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {filtered.map(row => (
          <button key={row.profile.id} onClick={() => setSelected(row)}
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
              {row.profile.photos?.[0]
                ? <img src={row.profile.photos[0]} alt="" className="w-full h-full object-cover" />
                : <User className="w-5 h-5 text-muted-foreground m-2.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{row.profile.name}, {row.profile.age}</p>
              <p className="text-xs text-muted-foreground truncate">{row.user.email}</p>
            </div>
            {row.profile.verificationStatus === "verified" && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
            {row.profile.verificationStatus === "pending" && <Clock className="w-4 h-4 text-yellow-400 shrink-0" />}
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Verifications Tab ─────────────────────────────────────────────────────────

function VerificationsTab({ token }: { token: string }) {
  const { toast } = useToast();
  const { data: rows, loading, error, reload } = useAdminFetch<VerificationRow[]>("verifications", token);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = (rows || []).filter(r => filter === "all" || r.request.status === filter);

  const handleAction = async (id: string, userId: string, status: "approved" | "rejected") => {
    if (status === "rejected" && !note.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNote: note.trim() || null }),
      });
      if (!res.ok) throw new Error();
      toast({ title: status === "approved" ? "✓ Approved!" : "Rejected", description: `Verification request ${status}.` });
      setReviewing(null);
      setNote("");
      reload();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally { setActionLoading(false); }
  };

  const StatusChip = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/10 text-green-400 border-green-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    return <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize", map[status] || "")}>{status}</span>;
  };

  const idTypeLabel = (v: string) => ({
    aadhar: "Aadhaar",
    pan: "PAN",
    driving_license: "Driving License",
    passport: "Passport",
    voter_card: "Voter ID",
    other: "Gov ID"
  })[v] || v;

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (error) return <div className="text-destructive text-sm text-center py-8">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["pending", "all", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
              filter === f ? "bg-primary border-primary text-white" : "bg-muted border-border text-muted-foreground hover:text-foreground"
            )}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-3">
        {filtered.map(row => (
          <div key={row.request.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Summary row */}
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === row.request.id ? null : row.request.id)}>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                {row.profile?.photos?.[0]
                  ? <img src={row.profile.photos[0]} alt="" className="w-full h-full object-cover" />
                  : <User className="w-5 h-5 text-muted-foreground m-2.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{row.profile?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{row.user.email}</p>
              </div>
              <StatusChip status={row.request.status} />
            </button>

            {/* Expanded detail */}
            {expanded === row.request.id && (
              <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-muted-foreground block">ID Type</span><span className="text-foreground">{idTypeLabel(row.request.idType)}</span></div>
                  <div><span className="text-xs text-muted-foreground block">ID Number</span><span className="text-foreground font-mono">{row.request.idNumber}</span></div>
                  {row.request.phone && <div><span className="text-xs text-muted-foreground block">Phone</span><span className="text-foreground">{row.request.phone}</span></div>}
                  {row.request.address && <div className="col-span-2"><span className="text-xs text-muted-foreground block">Address</span><span className="text-foreground">{row.request.address}</span></div>}
                </div>

                {/* Document images — tap to view fullscreen */}
                <DocImageSet docs={[
                  ...(row.request.selfieUrl ? [{ url: row.request.selfieUrl, label: "Selfie" }] : []),
                  ...(row.request.idFrontUrl ? [{ url: row.request.idFrontUrl, label: "ID Front" }] : []),
                  ...(row.request.idBackUrl ? [{ url: row.request.idBackUrl, label: "ID Back" }] : []),
                  ...(row.request.eduDocUrl ? [{ url: row.request.eduDocUrl, label: "Edu Doc" }] : []),
                ]} />

                {row.request.adminNote && (
                  <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground"><span className="text-foreground font-medium">Note: </span>{row.request.adminNote}</div>
                )}

                <p className="text-xs text-muted-foreground">Submitted: {new Date(row.request.createdAt).toLocaleString()}</p>

                {/* Action buttons — only for pending */}
                {row.request.status === "pending" && (
                  <>
                    {reviewing === row.request.id ? (
                      <div className="space-y-2">
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                          placeholder="Reason / feedback for user (required for rejection)…"
                          className="w-full bg-muted border border-border text-foreground rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(row.request.id, row.request.userId, "approved")} disabled={actionLoading}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                          </button>
                          <button onClick={() => handleAction(row.request.id, row.request.userId, "rejected")} disabled={actionLoading}
                            className="flex-1 py-2.5 rounded-xl bg-destructive/80 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                          </button>
                        </div>
                        <button onClick={() => { setReviewing(null); setNote(""); }} className="w-full py-2 text-xs text-muted-foreground">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setReviewing(row.request.id)}
                        className="w-full py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                        Review Request
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No requests found</div>
        )}
      </div>
    </div>
  );
}

// ── Admins Tab ────────────────────────────────────────────────────────────────

function AdminsTab({ token, selfUserId }: { token: string; selfUserId: string }) {
  const { toast } = useToast();
  const { data: admins, loading, error, reload } = useAdminFetch<AdminUser[]>("admins", token);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!email.trim()) { toast({ title: "Email required", variant: "destructive" }); return; }
    setAdding(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: data.already ? "Already an admin" : `${data.email} is now an admin` });
      setEmail(""); setShowForm(false);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setAdding(false); }
  };

  const handleRemove = async (userId: string, adminEmail: string) => {
    if (!confirm(`Remove admin access from ${adminEmail}?`)) return;
    setRemoving(userId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/admins/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Admin access removed" });
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setRemoving(null); }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (error) return <div className="text-destructive text-sm text-center py-8">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-sm text-yellow-300">
        Admins can access the full admin panel. You cannot remove your own admin access.
      </div>

      <button onClick={() => setShowForm(!showForm)}
        className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Admin by Email
      </button>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Promote User to Admin</p>
          <p className="text-xs text-muted-foreground">Enter the email address of the existing user you want to make an admin.</p>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={adding}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Grant Access
            </button>
            <button onClick={() => { setShowForm(false); setEmail(""); }}
              className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Cancel</button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{(admins || []).length} admin{(admins || []).length !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {(admins || []).map(a => {
          const isSelf = a.id === selfUserId;
          return (
            <div key={a.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                {a.photo
                  ? <img src={a.photo} alt="" className="w-full h-full object-cover" />
                  : <User className="w-5 h-5 text-muted-foreground m-2.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{a.name || "No profile"}</p>
                  {isSelf && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 shrink-0">You</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{a.email}</p>
              </div>
              <button
                onClick={() => !isSelf && handleRemove(a.id, a.email)}
                disabled={isSelf || removing === a.id}
                title={isSelf ? "You cannot remove your own admin access" : "Remove admin access"}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                  isSelf
                    ? "opacity-25 cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                )}
              >
                {removing === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function Admin() {
  const token = localStorage.getItem("spark_token");
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("verifications");
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selfUserId, setSelfUserId] = useState("");

  useEffect(() => {
    if (!token) { navigate("/auth"); return; }
    fetch(`${BACKEND_URL}/api/admin/check`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setIsAdmin(true); setSelfUserId(d.userId); setChecking(false); })
      .catch(() => { setIsAdmin(false); setChecking(false); });
  }, [token]);

  if (checking) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You don't have admin access to this panel.</p>
        <Link href="/profile"><button className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">Go Back</button></Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "verifications", label: "Verify", icon: ShieldCheck },
    { key: "colleges", label: "Colleges", icon: Building2 },
    { key: "profiles", label: "Profiles", icon: User },
    { key: "admins", label: "Admins", icon: UserCog },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/profile">
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Admin Panel</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border bg-background">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors border-b-2",
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 pb-8">
        {token && (
          <>
            {tab === "verifications" && <VerificationsTab token={token} />}
            {tab === "colleges" && <CollegesTab token={token} />}
            {tab === "profiles" && <ProfilesTab token={token} selfUserId={selfUserId} />}
            {tab === "admins" && <AdminsTab token={token} selfUserId={selfUserId} />}
          </>
        )}
      </div>
    </div>
  );
}
