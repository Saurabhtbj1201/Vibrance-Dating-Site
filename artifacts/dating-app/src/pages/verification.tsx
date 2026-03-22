import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, Upload, ChevronDown, ArrowLeft,
  CheckCircle2, Clock, XCircle, Loader2, FileText, User, Home
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/components/layout";

const BASE_URL = import.meta.env.BASE_URL;
const BACKEND_URL = "http://localhost:3000";

const ID_TYPES = [
  { value: "aadhar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "voter_card", label: "Voter ID Card" },
  { value: "other", label: "Other Government ID" },
];

const EDU_DOC_TYPES = [
  { value: "certificate", label: "Degree Certificate" },
  { value: "college_id", label: "College ID Card" },
  { value: "fee_receipt", label: "Fee Receipt" },
  { value: "marksheet", label: "Mark Sheet / Transcript" },
  { value: "other", label: "Other Document" },
];

interface VerificationRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  idType: string;
  idNumber: string;
  adminNote?: string | null;
  createdAt: string;
}

function StatusBanner({ request }: { request: VerificationRequest }) {
  if (request.status === "pending") {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex gap-4 items-start">
        <Clock className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-300 text-base">Verification Pending</p>
          <p className="text-sm text-muted-foreground mt-1">Your documents are being reviewed. This usually takes 1–3 business days.</p>
        </div>
      </div>
    );
  }
  if (request.status === "approved") {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex gap-4 items-start">
        <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-300 text-base">Profile Verified!</p>
          <p className="text-sm text-muted-foreground mt-1">Your profile is now verified. A badge will appear on your profile.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex gap-4 items-start">
      <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-300 text-base">Verification Rejected</p>
        {request.adminNote && <p className="text-sm text-muted-foreground mt-1">Reason: {request.adminNote}</p>}
        <p className="text-sm text-primary mt-2 font-medium">You can re-submit with corrected documents below.</p>
      </div>
    </div>
  );
}

export default function Verification() {
  const token = localStorage.getItem("spark_token");
  const { toast } = useToast();

  const [existing, setExisting] = useState<VerificationRequest | null | "loading">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [eduDocType, setEduDocType] = useState("");
  const [eduDocUrl, setEduDocUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/verification/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => setExisting(data))
      .catch(() => setExisting(null));
  }, [token]);

  const uploadFile = async (file: File, field: string): Promise<string | null> => {
    if (!token) return null;
    setUploadingField(field);
    try {
      const res = await fetch(`${BACKEND_URL}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error();
      const { uploadURL, objectPath } = await res.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      return `${BACKEND_URL}/api/storage${objectPath}`;
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the file. Try again.", variant: "destructive" });
      return null;
    } finally {
      setUploadingField(null);
    }
  };

  function FileUploadBtn({ label, url, onUrl, field }: { label: string; url: string; onUrl: (u: string) => void; field: string }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const isUploading = uploadingField === field;
    return (
      <div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const result = await uploadFile(file, field);
            if (result) onUrl(result);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <button type="button" onClick={() => fileRef.current?.click()}
          className={cn(
            "w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all text-sm",
            url ? "border-green-500/50 bg-green-500/5 text-green-400" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading…</span></>
          ) : url ? (
            <><CheckCircle2 className="w-5 h-5" /><span>Uploaded ✓</span></>
          ) : (
            <><Upload className="w-5 h-5" /><span>{label}</span></>
          )}
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!idType || !idNumber.trim()) {
      toast({ title: "Required fields", description: "Please fill in ID type and document number.", variant: "destructive" });
      return;
    }
    if (!selfieUrl) {
      toast({ title: "Selfie required", description: "Please upload a selfie photo.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idType, idNumber: idNumber.trim(), idFrontUrl, idBackUrl, eduDocType, eduDocUrl, selfieUrl, phone: phone.trim(), address: address.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      const data = await res.json();
      setExisting(data);
      toast({ title: "Submitted!", description: "Your verification request has been submitted for review." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = existing === null || (existing !== "loading" && existing?.status === "rejected");

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto hide-scrollbar bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/profile">
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Get Verified</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-10">
        {/* Info card */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm text-foreground leading-relaxed">
            A verified badge shows other users that your identity and education details are authentic. Submit the documents below and our team will review within 1–3 days.
          </p>
        </div>

        {/* Status banner */}
        {existing === "loading" ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : existing ? (
          <StatusBanner request={existing} />
        ) : null}

        {/* Form — show if no request or rejected */}
        {canSubmit && existing !== "loading" && (
          <>
            {/* Section: Identity */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Identity Document</h2>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Document Type *</label>
                <div className="relative">
                  <select value={idType} onChange={e => setIdType(e.target.value)}
                    className="w-full appearance-none bg-muted border border-border text-foreground rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary/50">
                    <option value="">Select ID type…</option>
                    {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Document Number *</label>
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                  placeholder="Enter document number…"
                  className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Front Side</label>
                  <FileUploadBtn label="Upload front" url={idFrontUrl} onUrl={setIdFrontUrl} field="id_front" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Back Side</label>
                  <FileUploadBtn label="Upload back" url={idBackUrl} onUrl={setIdBackUrl} field="id_back" />
                </div>
              </div>
            </div>

            {/* Section: Education */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Educational Document</h2>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Document Type</label>
                <div className="relative">
                  <select value={eduDocType} onChange={e => setEduDocType(e.target.value)}
                    className="w-full appearance-none bg-muted border border-border text-foreground rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary/50">
                    <option value="">Select document type…</option>
                    {EDU_DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <FileUploadBtn label="Upload educational document" url={eduDocUrl} onUrl={setEduDocUrl} field="edu_doc" />
            </div>

            {/* Section: Selfie */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Selfie Photo *</h2>
              </div>
              <p className="text-xs text-muted-foreground">Take a clear selfie holding your identity document next to your face.</p>
              <FileUploadBtn label="Upload selfie" url={selfieUrl} onUrl={setSelfieUrl} field="selfie" />
            </div>

            {/* Section: Contact */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Contact Details</h2>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Current Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your full current address…" rows={3}
                  className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none" />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {submitting ? "Submitting…" : "Submit for Verification"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
