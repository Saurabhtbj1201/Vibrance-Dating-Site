import { useState, useEffect, useRef } from "react";
import {
  LogOut, Check, Pencil, Plus, X,
  User, Heart, Zap, Music, Film, Instagram, Star,
  MapPin, Briefcase, GraduationCap, Languages, PawPrint,
  Target, Sliders, Sparkles, Camera, Loader2,
  Cigarette, Wine, Dumbbell, Salad, Trash2,
  ShieldCheck, ShieldAlert, Clock, ChevronDown, Settings
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyProfile, useUpdateMyProfile, type UpdateProfileRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";

// ── helpers ─────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE_URL = import.meta.env.BASE_URL;

const INTERESTS_PRESET = [
  "Travel", "Coffee", "Yoga", "Hiking", "Movies", "Music",
  "Cooking", "Reading", "Gaming", "Art", "Fitness", "Photography",
  "Dancing", "Wine", "Beach", "Foodie", "Dogs", "Cats",
];

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// ── Photo Upload ─────────────────────────────────────────────────────────────

function usePhotoUpload(token: string | null) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    if (!token) return null;
    setUploading(true);
    try {
      // Step 1: get presigned URL
      const res = await fetch(`${BACKEND_URL}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();
      // Step 2: upload directly to GCS
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      // Return serving URL
      return `${BACKEND_URL}/api/storage${objectPath}`;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}

// ── Photo Grid ───────────────────────────────────────────────────────────────

function PhotoGrid({ photos, onChange, token }: { photos: string[]; onChange: (p: string[]) => void; token: string | null }) {
  const { upload, uploading } = usePhotoUpload(token);
  const fileRef = useRef<HTMLInputElement>(null);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" }); return; }
    const url = await upload(file);
    if (url) {
      const next = [...photos];
      if (slotIndex < next.length) next[slotIndex] = url;
      else next.push(url);
      onChange(next.slice(0, 5));
    } else {
      toast({ title: "Upload failed", description: "Could not upload the photo. Try again.", variant: "destructive" });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const slots = Array.from({ length: 5 });

  return (
    <div className="space-y-2">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <div className="grid grid-cols-3 gap-2">
        {slots.map((_, i) => {
          const url = photos[i];
          const imageUrl = resolveImageUrl(url);
          const isMain = i === 0;
          return (
            <div key={i} className={`relative rounded-xl overflow-hidden border-2 ${isMain ? "border-primary" : "border-dashed border-border"} bg-muted aspect-square`}>
              {url ? (
                <>
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => onChange(photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {isMain && <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">Main</span>}
                </>
              ) : (
                <button
                  onClick={() => { setSlotIndex(i); fileRef.current?.click(); }}
                  disabled={uploading}
                  className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {uploading && slotIndex === i ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-xs">{isMain ? "Add photo" : "+"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">First photo is your main profile picture. Up to 5 photos.</p>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function OptionButton({ label, value, current, onClick }: { label: string; value: string; current?: string | null; onClick: (v: string) => void }) {
  const active = current === value;
  return (
    <button type="button" onClick={() => onClick(active ? "" : value)}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active ? "bg-primary text-white border-primary shadow-sm" : "bg-background text-foreground border-border hover:border-primary/40"}`}>
      {label}
    </button>
  );
}

function TagInput({ tags, onChange, placeholder, presets }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string; presets?: string[] }) {
  const [input, setInput] = useState("");
  const add = (val: string) => {
    const clean = val.trim();
    if (clean && !tags.includes(clean)) onChange([...tags, clean]);
    setInput("");
  };
  const remove = (t: string) => onChange(tags.filter((x) => x !== t));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {t}<button type="button" onClick={() => remove(t)}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      {presets && (
        <div className="flex flex-wrap gap-2">
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => add(p)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border hover:border-primary/40 hover:text-primary transition-colors">
              <Plus className="w-3 h-3" /> {p}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder={placeholder || "Type and press Enter…"}
          className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground" />
        <button type="button" onClick={() => add(input)} className="px-3 py-2 rounded-xl bg-primary text-white text-sm"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>{children}</div>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value?: string | null; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground" />
  );
}

function SelectInput({ value, onChange, options, placeholder }: { value?: string | null; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-primary/50 text-foreground appearance-none cursor-pointer">
      <option value="">{placeholder || "Select…"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const PROFESSION_OPTIONS = [
  "Student", "Professor / Teacher", "Doctor / Medical", "Nurse / Healthcare",
  "Engineer", "Software Developer", "Designer", "Architect", "Lawyer / Legal",
  "Accountant / Finance", "Banker / Investor", "Business Owner", "Entrepreneur",
  "Freelancer", "Artist / Musician", "Writer / Journalist", "Marketing / PR",
  "Sales", "HR / Recruiter", "Real Estate", "Hospitality / Tourism",
  "Chef / Cook", "Photographer", "Content Creator / Influencer",
  "Scientist / Researcher", "Athlete / Coach", "Military / Defense",
  "Government / Civil Servant", "Retail / Service", "Transport / Driver", "Other",
];

const EDUCATION_OPTIONS = [
  "High School", "Trade / Vocational School", "Some College",
  "Associate's Degree", "Bachelor's Degree", "Master's Degree",
  "MBA", "PhD / Doctorate", "Medical Degree (MD)", "Law Degree (JD)", "Other",
];

const COURSE_OPTIONS = [
  // Engineering
  "Computer Science & Engineering", "Mechanical Engineering", "Civil Engineering",
  "Electrical Engineering", "Electronics & Communication", "Chemical Engineering",
  "Aerospace Engineering", "Biomedical Engineering",
  // Medicine & Health
  "MBBS (Medicine)", "BDS (Dentistry)", "Nursing", "Pharmacy (B.Pharm / M.Pharm)",
  "Physiotherapy", "Biotechnology",
  // Business & Commerce
  "B.Com / M.Com (Commerce)", "BBA / MBA (Business Administration)",
  "Economics", "Finance & Accounting", "Banking & Insurance",
  // Computer & IT
  "BCA / MCA (Computer Applications)", "Information Technology",
  "Data Science", "Artificial Intelligence & ML", "Cybersecurity",
  // Arts & Humanities
  "English Literature", "History", "Political Science", "Philosophy",
  "Psychology", "Sociology", "Fine Arts", "Performing Arts",
  // Science
  "Physics", "Chemistry", "Mathematics & Statistics",
  "Biology / Zoology / Botany", "Environmental Science",
  // Law & Social Sciences
  "LLB / LLM (Law)", "Social Work", "Journalism & Mass Communication",
  // Design & Architecture
  "Architecture", "Graphic Design", "Fashion Design", "Interior Design",
  // Education
  "B.Ed / M.Ed (Education)", "Physical Education",
  // Other
  "Other",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR + 5 - i);

function ReadValue({ value }: { value?: string | number | string[] | null }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return <span className="text-sm text-muted-foreground italic">Not set</span>;
  if (Array.isArray(value)) return (
    <div className="flex flex-wrap gap-1.5">
      {value.map((v) => <span key={v} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">{v}</span>)}
    </div>
  );
  return <span className="text-sm text-foreground font-medium">{String(value)}</span>;
}

function LifestyleTag({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Icon className="w-3 h-3" /> {label}</span>
      <ReadValue value={value} />
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function CompletionBar({ percent }: { percent: number }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">Profile Strength</span></div>
        <span className="text-sm font-bold text-primary">{percent}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
      {percent < 80 && <p className="text-xs text-muted-foreground mt-2">Complete your profile to get more matches!</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useGetMyProfile();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();
  const { toast } = useToast();

  const token = localStorage.getItem("spark_token");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [colleges, setColleges] = useState<{ id: string; name: string; city?: string }[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>("none");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) return;
      fetch(`${BACKEND_URL}/api/colleges`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setColleges).catch(() => {});
      fetch(`${BACKEND_URL}/api/verification/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null).then(d => { if (d) setVerificationStatus(d.status); }).catch(() => {});
      fetch(`${BACKEND_URL}/api/admin/check`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { 
          if (r.ok) {
            r.json().then(data => setIsAdmin(data.isAdmin)).catch(() => setIsAdmin(false));
          } else {
            setIsAdmin(false);
          }
        }).catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        gender: profile.gender ?? "",
        location: profile.location ?? "",
        photos: profile.photos ?? [],
        bio: profile.bio ?? "",
        interests: profile.interests ?? [],
        profession: profile.profession ?? "",
        education: profile.education ?? "",
        course: profile.course ?? "",
        courseStatus: profile.courseStatus ?? "",
        completionYear: profile.completionYear ?? undefined,
        collegeName: profile.collegeName ?? "",
        languages: (profile.languages as string[]) ?? [],
        smoking: profile.smoking ?? "",
        drinking: profile.drinking ?? "",
        workout: profile.workout ?? "",
        diet: profile.diet ?? "",
        pets: profile.pets ?? "",
        lookingFor: profile.lookingFor ?? "",
        interestedIn: profile.interestedIn ?? "",
        minAgePreference: profile.minAgePreference ?? 18,
        maxAgePreference: profile.maxAgePreference ?? 50,
        distancePreference: profile.distancePreference ?? 50,
        hobbies: (profile.hobbies as string[]) ?? [],
        favoriteMusic: profile.favoriteMusic ?? "",
        favoriteMovies: profile.favoriteMovies ?? "",
        instagramHandle: profile.instagramHandle ?? "",
        zodiacSign: profile.zodiacSign ?? "",
      });
    }
  }, [profile]);

  const set = (key: keyof UpdateProfileRequest, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    updateProfile({ data: form }, {
      onSuccess: () => { setEditing(false); toast({ title: "Profile updated", description: "Your changes have been saved." }); },
      onError: () => toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const avatarUrl = resolveImageUrl((form.photos as string[])?.[0] || profile?.photos?.[0]);
  const completion = (profile as any)?.completionPercent ?? 0;
  const displayAge = form.dateOfBirth ? calcAge(form.dateOfBirth) : profile?.age;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto hide-scrollbar bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">My Profile</h1>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl border border-border text-sm text-muted-foreground font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="px-4 py-1.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                <Check className="w-4 h-4" />{isPending ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-xl border border-border text-sm text-foreground font-medium flex items-center gap-1.5 hover:bg-muted transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              {isAdmin && (
                <Link href="/admin">
                  <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors" title="Admin Panel">
                    <Settings className="w-4 h-4" />
                  </button>
                </Link>
              )}
              <button onClick={() => logout()} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Avatar */}
        {!editing && (
          <div className="flex flex-col items-center py-4">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-muted mb-3">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display font-bold text-foreground">{profile?.name}{displayAge ? `, ${displayAge}` : ""}</h2>
              {(profile as any)?.verificationStatus === "verified" && (
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" title="Verified" />
              )}
            </div>
            {profile?.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {profile.location}</p>}
            {profile?.profession && <p className="text-sm text-primary font-medium flex items-center gap-1 mt-0.5"><Briefcase className="w-3.5 h-3.5" /> {profile.profession}</p>}
            {/* Verification status pill */}
            {verificationStatus === "pending" && (
              <span className="mt-2 flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Verification Pending
              </span>
            )}
            {verificationStatus === "rejected" && (
              <Link href="/verification">
                <span className="mt-2 flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full cursor-pointer">
                  <ShieldAlert className="w-3 h-3" /> Re-submit Verification
                </span>
              </Link>
            )}
            {verificationStatus === "none" && (
              <Link href="/verification">
                <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full cursor-pointer hover:text-primary hover:border-primary/30 transition-colors">
                  <ShieldCheck className="w-3 h-3" /> Get Verified
                </span>
              </Link>
            )}
          </div>
        )}

        {/* Completion */}
        <CompletionBar percent={completion} />

        {/* ── SECTION: Basic Info ──────────────────────────────────── */}
        <SectionCard title="Basic Information" icon={User}>
          {editing ? (
            <div className="space-y-4">
              <Field label="Photos (1 main + up to 4 more)">
                <PhotoGrid photos={(form.photos as string[]) || []} onChange={(p) => set("photos", p)} token={token} />
              </Field>
              <Field label="Full Name"><TextInput value={form.name} onChange={(v) => set("name", v)} placeholder="Your name" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth"><TextInput type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} /></Field>
                <Field label="Gender">
                  <div className="flex flex-col gap-2">
                    {["Man", "Woman", "Non-binary"].map((g) => (
                      <OptionButton key={g} label={g} value={g.toLowerCase()} current={form.gender} onClick={(v) => set("gender", v)} />
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Location"><TextInput value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. New York, USA" /></Field>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.photos && profile.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.slice(0, 5).map((url, i) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden aspect-square ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">Main</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Gender</span><br /><ReadValue value={profile?.gender} /></div>
                <div><span className="text-muted-foreground text-xs">Age</span><br /><ReadValue value={displayAge} /></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span><br /><ReadValue value={profile?.location} /></div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION: Profile Details ──────────────────────────────── */}
        <SectionCard title="Profile Details" icon={Sparkles}>
          {editing ? (
            <div className="space-y-4">
              <Field label="Bio (up to 300 characters)">
                <textarea value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} rows={3} maxLength={300} placeholder="Write something fun about yourself…"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground resize-none" />
                <span className="text-xs text-muted-foreground">{(form.bio || "").length}/300</span>
              </Field>
              <Field label="Interests">
                <TagInput tags={(form.interests as string[]) || []} onChange={(v) => set("interests", v)} presets={INTERESTS_PRESET} placeholder="Add an interest…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Profession"><SelectInput value={form.profession} onChange={(v) => set("profession", v)} options={PROFESSION_OPTIONS} placeholder="Select profession…" /></Field>
                <Field label="Education (Last Degree)"><SelectInput value={form.education} onChange={(v) => set("education", v)} options={EDUCATION_OPTIONS} placeholder="Select degree…" /></Field>
              </div>
              <Field label="Course / Major">
                <SelectInput value={form.course === "" || COURSE_OPTIONS.includes(form.course ?? "") ? form.course : "Other"} onChange={(v) => { if (v !== "Other") set("course", v); else set("course", "Other"); }} options={COURSE_OPTIONS} placeholder="Select course…" />
                {(form.course === "Other" || (form.course && !COURSE_OPTIONS.slice(0, -1).includes(form.course))) && (
                  <TextInput value={form.course === "Other" ? "" : form.course} onChange={(v) => set("course", v || "Other")} placeholder="Enter your course name…" />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Current Status">
                  <div className="flex gap-2">
                    {(["pursuing", "completed"] as const).map((val) => (
                      <OptionButton key={val} label={val === "pursuing" ? "Pursuing" : "Completed"} value={val} current={form.courseStatus} onClick={(v) => set("courseStatus", v)} />
                    ))}
                  </div>
                </Field>
                <Field label="Completion Year">
                  <SelectInput value={form.completionYear ? String(form.completionYear) : ""} onChange={(v) => set("completionYear", v ? Number(v) : undefined)} options={YEAR_OPTIONS.map(String)} placeholder="Year…" />
                </Field>
              </div>
              <Field label="College / University">
                {colleges.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={colleges.some(c => c.name === form.collegeName) ? form.collegeName : "__other__"}
                        onChange={e => { if (e.target.value !== "__other__") set("collegeName", e.target.value); else set("collegeName", ""); }}
                        className="w-full appearance-none bg-background border border-border text-foreground rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="">Select college…</option>
                        {colleges.map(c => (
                          <option key={c.id} value={c.name}>{c.name}{c.city ? ` — ${c.city}` : ""}</option>
                        ))}
                        <option value="__other__">Other (type below)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {(!colleges.some(c => c.name === form.collegeName) || form.collegeName === "") && (
                      <TextInput value={form.collegeName ?? ""} onChange={(v) => set("collegeName", v)} placeholder="Type your college name…" />
                    )}
                  </div>
                ) : (
                  <TextInput value={form.collegeName} onChange={(v) => set("collegeName", v)} placeholder="e.g. Harvard University…" />
                )}
              </Field>
              <Field label="Languages Spoken">
                <TagInput tags={(form.languages as string[]) || []} onChange={(v) => set("languages", v)} placeholder="Add a language…" />
              </Field>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.bio && <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs flex items-center gap-1"><Briefcase className="w-3 h-3" /> Profession</span><br /><ReadValue value={profile?.profession} /></div>
                <div><span className="text-muted-foreground text-xs flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Education</span><br /><ReadValue value={profile?.education} /></div>
              </div>
              {(profile?.course || profile?.collegeName) && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Course</span><br />
                    <ReadValue value={profile?.course} />
                    {profile?.courseStatus && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">{profile.courseStatus}</span>}
                    {profile?.completionYear && <span className="text-xs text-muted-foreground ml-1">({profile.completionYear})</span>}
                  </div>
                  <div><span className="text-muted-foreground text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> College / University</span><br /><ReadValue value={profile?.collegeName} /></div>
                </div>
              )}
              <div><span className="text-muted-foreground text-xs flex items-center gap-1 mb-1"><Languages className="w-3 h-3" /> Languages</span><ReadValue value={profile?.languages as string[]} /></div>
              <div><span className="text-muted-foreground text-xs mb-1 block">Interests</span><ReadValue value={profile?.interests} /></div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION: Lifestyle ───────────────────────────────── */}
        <SectionCard title="Lifestyle & Personality" icon={Zap}>
          {editing ? (
            <div className="space-y-4">
              <Field label="Smoking">
                <div className="flex flex-wrap gap-2">
                  {[["No", "no"], ["Yes", "yes"], ["Occasionally", "occasionally"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.smoking} onClick={(v) => set("smoking", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Drinking">
                <div className="flex flex-wrap gap-2">
                  {[["No", "no"], ["Yes", "yes"], ["Socially", "socially"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.drinking} onClick={(v) => set("drinking", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Workout">
                <div className="flex flex-wrap gap-2">
                  {[["Active", "active"], ["Sometimes", "sometimes"], ["Never", "never"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.workout} onClick={(v) => set("workout", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Diet">
                <div className="flex flex-wrap gap-2">
                  {[["Non-veg", "non-veg"], ["Veg", "veg"], ["Vegan", "vegan"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.diet} onClick={(v) => set("diet", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Pets">
                <div className="flex flex-wrap gap-2">
                  {[["Have Pets", "yes"], ["No Pets", "no"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.pets} onClick={(v) => set("pets", v)} />
                  ))}
                </div>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <LifestyleTag icon={Cigarette} label="Smoking" value={profile?.smoking} />
              <LifestyleTag icon={Wine} label="Drinking" value={profile?.drinking} />
              <LifestyleTag icon={Dumbbell} label="Workout" value={profile?.workout} />
              <LifestyleTag icon={Salad} label="Diet" value={profile?.diet} />
              <LifestyleTag icon={PawPrint} label="Pets" value={profile?.pets} />
            </div>
          )}
        </SectionCard>

        {/* ── SECTION: Relationship Preferences ────────────────── */}
        <SectionCard title="Relationship Preferences" icon={Heart}>
          {editing ? (
            <div className="space-y-4">
              <Field label="Looking For">
                <div className="flex flex-wrap gap-2">
                  {[["Casual", "casual"], ["Serious Relationship", "serious"], ["Friendship", "friendship"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.lookingFor} onClick={(v) => set("lookingFor", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Interested In">
                <div className="flex flex-wrap gap-2">
                  {[["Men", "men"], ["Women", "women"], ["Everyone", "everyone"]].map(([label, val]) => (
                    <OptionButton key={val} label={label} value={val} current={form.interestedIn} onClick={(v) => set("interestedIn", v)} />
                  ))}
                </div>
              </Field>
              <Field label={`Age Preference: ${form.minAgePreference ?? 18}–${form.maxAgePreference ?? 50}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-7">Min</span>
                    <input type="range" min={18} max={80} value={form.minAgePreference ?? 18} onChange={(e) => set("minAgePreference", Number(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-xs font-medium text-foreground w-7">{form.minAgePreference ?? 18}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-7">Max</span>
                    <input type="range" min={18} max={80} value={form.maxAgePreference ?? 50} onChange={(e) => set("maxAgePreference", Number(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-xs font-medium text-foreground w-7">{form.maxAgePreference ?? 50}</span>
                  </div>
                </div>
              </Field>
              <Field label={`Distance Preference: ${form.distancePreference ?? 50} km`}>
                <div className="flex items-center gap-3">
                  <input type="range" min={5} max={500} step={5} value={form.distancePreference ?? 50} onChange={(e) => set("distancePreference", Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="text-xs font-medium text-foreground w-16">{form.distancePreference ?? 50} km</span>
                </div>
              </Field>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Looking For</span><br /><ReadValue value={profile?.lookingFor} /></div>
                <div><span className="text-xs text-muted-foreground">Interested In</span><br /><ReadValue value={profile?.interestedIn} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Sliders className="w-3 h-3" /> Age Range</span><br /><ReadValue value={profile?.minAgePreference && profile?.maxAgePreference ? `${profile.minAgePreference}–${profile.maxAgePreference}` : null} /></div>
                <div><span className="text-xs text-muted-foreground">Distance</span><br /><ReadValue value={profile?.distancePreference ? `${profile.distancePreference} km` : null} /></div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION: Additional ──────────────────────────────── */}
        <SectionCard title="Additional Details" icon={Star}>
          {editing ? (
            <div className="space-y-4">
              <Field label="Zodiac Sign">
                <div className="flex flex-wrap gap-2">
                  {ZODIAC_SIGNS.map((z) => (
                    <OptionButton key={z} label={z} value={z.toLowerCase()} current={form.zodiacSign} onClick={(v) => set("zodiacSign", v)} />
                  ))}
                </div>
              </Field>
              <Field label="Hobbies">
                <TagInput tags={(form.hobbies as string[]) || []} onChange={(v) => set("hobbies", v)} placeholder="e.g. Pottery, Surfing…" />
              </Field>
              <Field label="Favorite Music"><TextInput value={form.favoriteMusic} onChange={(v) => set("favoriteMusic", v)} placeholder="e.g. Indie, Jazz, Pop" /></Field>
              <Field label="Favorite Movies / Shows"><TextInput value={form.favoriteMovies} onChange={(v) => set("favoriteMovies", v)} placeholder="e.g. Interstellar, The Office" /></Field>
              <Field label="Instagram Handle">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input type="text" value={form.instagramHandle || ""} onChange={(e) => set("instagramHandle", e.target.value.replace("@", ""))} placeholder="your_handle"
                    className="w-full border border-border rounded-xl pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground" />
                </div>
              </Field>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {profile?.zodiacSign && <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3" /> Zodiac</span><br /><ReadValue value={profile.zodiacSign.charAt(0).toUpperCase() + profile.zodiacSign.slice(1)} /></div>}
              {(profile?.hobbies as string[])?.length > 0 && <div><span className="text-xs text-muted-foreground mb-1 block">Hobbies</span><ReadValue value={profile?.hobbies as string[]} /></div>}
              <div className="grid grid-cols-2 gap-3">
                {profile?.favoriteMusic && <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Music className="w-3 h-3" /> Music</span><br /><ReadValue value={profile.favoriteMusic} /></div>}
                {profile?.favoriteMovies && <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Film className="w-3 h-3" /> Movies</span><br /><ReadValue value={profile.favoriteMovies} /></div>}
              </div>
              {profile?.instagramHandle && <div><span className="text-xs text-muted-foreground flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram</span><br /><span className="text-sm text-primary font-medium">@{profile.instagramHandle}</span></div>}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
