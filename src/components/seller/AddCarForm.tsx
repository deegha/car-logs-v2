"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { formatPrice } from "@/lib/utils";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { MileageInput } from "@/components/ui/MileageInput";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { BODY_TYPE_OPTIONS } from "@/data/bodyTypes";
import { PROVINCES, getDistricts, getTowns } from "@/data/locations";

type Step = "details" | "specs" | "images" | "review";

const STEPS: Step[] = ["details", "specs", "images", "review"];
const STEP_LABELS: Record<Step, string> = {
  details: "Details",
  specs: "Specs",
  images: "Photos",
  review: "Review",
};

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Brand New (< 1,000 km)" },
  { value: "USED", label: "Used" },
  { value: "RECONDITIONED", label: "Reconditioned" },
];

const FUEL_OPTIONS = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "PLUGIN_HYBRID", label: "Plug-in Hybrid" },
];

const TRANSMISSION_OPTIONS = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
  { value: "CVT", label: "CVT" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1989 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

interface FormData {
  title: string;
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  color: string;
  condition: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  engineSize: string;
  description: string;
  province: string;
  district: string;
  town: string;
}

const EMPTY: FormData = {
  title: "",
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  color: "",
  condition: "USED",
  fuelType: "",
  transmission: "",
  bodyType: "",
  engineSize: "",
  description: "",
  province: "",
  district: "",
  town: "",
};

interface SellerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phones: { id: number; number: string; isPrimary: boolean; isWhatsApp: boolean }[];
}

interface AddCarFormProps {
  isLoggedIn?: boolean;
}

export function AddCarForm({ isLoggedIn = false }: AddCarFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [emissionTestUrl, setEmissionTestUrl] = useState<string>("");
  const [emissionUploading, setEmissionUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [hasJustRegistered, setHasJustRegistered] = useState(false);
  const showContactDetails = isLoggedIn || hasJustRegistered;
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [addingPhone, setAddingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [removingPhoneId, setRemovingPhoneId] = useState<number | null>(null);
  const [patchingPhoneId, setPatchingPhoneId] = useState<number | null>(null);
  const [localPhones, setLocalPhones] = useState<
    { id: number; number: string; isPrimary: boolean; isWhatsApp: boolean }[]
  >([]);
  const [localPhoneInput, setLocalPhoneInput] = useState("");
  const [localPhoneError, setLocalPhoneError] = useState("");

  useEffect(() => {
    sendGAEvent("event", "listing_step_view", {
      step,
      step_number: STEPS.indexOf(step) + 1,
    });
  }, [step]);

  function update(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setData((d) => ({ ...d, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    };
  }

  function updateMake(value: string) {
    setData((d) => ({ ...d, make: value, model: "" }));
    setErrors((er) => ({ ...er, make: undefined }));
  }

  function updateModel(value: string) {
    setData((d) => ({ ...d, model: value }));
    setErrors((er) => ({ ...er, model: undefined }));
  }

  function updateProvince(value: string) {
    setData((d) => ({ ...d, province: value, district: "", town: "" }));
    setErrors((er) => ({ ...er, province: undefined }));
  }

  function updateDistrict(value: string) {
    setData((d) => ({ ...d, district: value, town: "" }));
    setErrors((er) => ({ ...er, district: undefined }));
  }

  function updateTown(value: string) {
    setData((d) => ({ ...d, town: value }));
    setErrors((er) => ({ ...er, town: undefined }));
  }

  function validateDetails(): boolean {
    const errs: Partial<FormData> = {};
    if (!data.title.trim()) errs.title = "Required";
    if (!data.make.trim()) errs.make = "Required";
    if (!data.model.trim()) errs.model = "Required";
    if (!data.year) errs.year = "Required";
    if (!data.price || Number(data.price) <= 0) errs.price = "Enter a valid price";
    if (!data.mileage || Number(data.mileage) < 0) errs.mileage = "Enter valid mileage";
    if (!data.province.trim()) errs.province = "Required";
    if (!data.district.trim()) errs.district = "Required";
    if (!data.town.trim()) errs.town = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateSpecs(): boolean {
    const errs: Partial<FormData> = {};
    if (!data.fuelType) errs.fuelType = "Required";
    if (!data.transmission) errs.transmission = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (step === "details" && !validateDetails()) {
      sendGAEvent("event", "listing_step_validation_failed", { step });
      return;
    }
    if (step === "specs" && !validateSpecs()) {
      sendGAEvent("event", "listing_step_validation_failed", { step });
      return;
    }
    if (step === "images") {
      if (uploadedUrls.length === 0) {
        setImageError("Please add at least one photo to continue.");
        return;
      }
      if (uploading || emissionUploading) return;
      setImageError("");
    }
    sendGAEvent("event", "listing_step_complete", {
      step,
      step_number: STEPS.indexOf(step) + 1,
    });
    const idx = STEPS.indexOf(step);
    const nextStep = STEPS[idx + 1];
    setStep(nextStep);
    if (nextStep === "review" && (isLoggedIn || hasJustRegistered)) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.seller) setSeller(d.seller);
        })
        .catch(() => {});
    }
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      sendGAEvent("event", "listing_step_back", { from_step: step });
      setStep(STEPS[idx - 1]);
    }
  }

  async function addPhone() {
    setPhoneError("");
    if (!/^\d{9}$/.test(newPhone)) {
      setPhoneError("Enter a 9-digit local number (e.g. 712345678)");
      return;
    }
    setAddingPhone(true);
    try {
      const res = await fetch("/api/seller/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newPhone }),
      });
      const d = await res.json();
      if (!res.ok) {
        setPhoneError(d.error ?? "Failed to add");
        return;
      }
      setSeller((s) => (s ? { ...s, phones: [...s.phones, d.phone] } : s));
      setNewPhone("");
    } finally {
      setAddingPhone(false);
    }
  }

  async function removePhone(id: number) {
    setPhoneError("");
    setRemovingPhoneId(id);
    try {
      const res = await fetch(`/api/seller/phones/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setSeller((s) => {
          if (!s) return s;
          const filtered = s.phones.filter((p) => p.id !== id);
          if (data.promotedId) {
            return {
              ...s,
              phones: filtered.map((p) =>
                p.id === data.promotedId ? { ...p, isPrimary: true } : p
              ),
            };
          }
          return { ...s, phones: filtered };
        });
      } else if (res.status === 422) {
        const data = await res.json();
        setPhoneError(data.error ?? "Cannot remove this phone");
      }
    } finally {
      setRemovingPhoneId(null);
    }
  }

  async function patchPhone(id: number, update: { isPrimary?: boolean; isWhatsApp?: boolean }) {
    setPatchingPhoneId(id);
    try {
      const res = await fetch(`/api/seller/phones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) return;
      const { phone } = await res.json();
      setSeller((s) => {
        if (!s) return s;
        return {
          ...s,
          phones: s.phones.map((p) => {
            if (update.isPrimary) return p.id === id ? phone : { ...p, isPrimary: false };
            return p.id === id ? phone : p;
          }),
        };
      });
    } finally {
      setPatchingPhoneId(null);
    }
  }

  function addLocalPhone() {
    setLocalPhoneError("");
    if (!/^\d{9}$/.test(localPhoneInput)) {
      setLocalPhoneError("Enter a 9-digit local number (e.g. 712345678)");
      return;
    }
    if (localPhones.length >= 5) {
      setLocalPhoneError("Maximum 5 phone numbers allowed");
      return;
    }
    setLocalPhones((prev) => [
      ...prev,
      { id: Date.now(), number: localPhoneInput, isPrimary: prev.length === 0, isWhatsApp: false },
    ]);
    setLocalPhoneInput("");
  }

  function removeLocalPhone(id: number) {
    setLocalPhones((prev) => {
      const wasP = prev.find((p) => p.id === id)?.isPrimary ?? false;
      const filtered = prev.filter((p) => p.id !== id);
      if (wasP && filtered.length > 0) {
        return filtered.map((p, i) => (i === 0 ? { ...p, isPrimary: true } : p));
      }
      return filtered;
    });
  }

  function setLocalPrimary(id: number) {
    setLocalPhones((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })));
  }

  function toggleLocalWhatsApp(id: number) {
    setLocalPhones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isWhatsApp: !p.isWhatsApp } : p))
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setApiError("");

    const images = uploadedUrls.map((url, i) => ({
      url,
      isPrimary: i === 0,
      order: i,
    }));

    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          make: data.make,
          model: data.model,
          year: Number(data.year),
          price: Number(data.price),
          mileage: Number(data.mileage),
          color: data.color || null,
          condition: data.condition || "USED",
          fuelType: data.fuelType,
          transmission: data.transmission,
          bodyType: data.bodyType || null,
          engineSize: data.engineSize || null,
          description: data.description || null,
          province: data.province || null,
          district: data.district || null,
          town: data.town || null,
          isNegotiable,
          emissionTestUrl: emissionTestUrl || null,
          images,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setApiError(result.error ?? "Submission failed");
        sendGAEvent("event", "listing_submit_error", { error: result.error ?? "unknown" });
        return;
      }
      sendGAEvent("event", "listing_submitted", {
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        photo_count: uploadedUrls.length,
      });
      router.push(`/seller/dashboard?submitted=1`);
    } catch {
      setApiError("Something went wrong. Please try again.");
      sendGAEvent("event", "listing_submit_error", { error: "network_error" });
    } finally {
      setSubmitting(false);
    }
  }

  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="flex flex-col gap-6">
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex w-full max-w-xs flex-col items-center gap-6 rounded-2xl border border-border bg-background p-8 text-center shadow-xl">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Submitting your listing</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Just a moment — please don&apos;t close this tab.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < stepIdx
                  ? "bg-primary-600 text-white"
                  : i === stepIdx
                    ? "border-2 border-primary-600 text-primary-600"
                    : "border-2 border-border text-foreground-muted"
              }`}
            >
              {i < stepIdx ? "✓" : i + 1}
            </div>
            <span
              className={`hidden text-sm sm:block ${
                i === stepIdx ? "font-semibold text-foreground" : "text-foreground-muted"
              }`}
            >
              {STEP_LABELS[s]}
            </span>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex flex-col gap-4">
        {step === "details" && (
          <>
            <Input
              label="Listing Title"
              value={data.title}
              onChange={update("title")}
              error={errors.title}
              required
              placeholder="e.g. 2020 Toyota Camry SL – 1 Owner"
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <AutoComplete
                label="Make"
                value={data.make}
                onChange={updateMake}
                options={CAR_MAKES}
                error={errors.make}
                required
                placeholder="e.g. Toyota"
              />
              <AutoComplete
                label="Model"
                value={data.model}
                onChange={updateModel}
                options={getModels(data.make)}
                error={errors.model}
                required
                placeholder={
                  CAR_MAKES.includes(data.make)
                    ? `e.g. ${getModels(data.make)[0] ?? "Model"}`
                    : "Select a make first"
                }
                disabled={!CAR_MAKES.includes(data.make)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <Select
                label="Year"
                value={data.year}
                onChange={update("year")}
                error={errors.year}
                options={YEAR_OPTIONS}
                placeholder="Year"
                required
              />
              <CurrencyInput
                label="Price"
                value={data.price}
                onChange={(raw) => {
                  setData((d) => ({ ...d, price: raw }));
                  setErrors((er) => ({ ...er, price: undefined }));
                }}
                error={errors.price}
                required
              />
              <MileageInput
                label="Mileage"
                value={data.mileage}
                onChange={(raw) => {
                  setData((d) => ({ ...d, mileage: raw }));
                  setErrors((er) => ({ ...er, mileage: undefined }));
                }}
                error={errors.mileage}
                required
                className="col-span-2 sm:col-span-1"
              />
            </div>
            <Input
              label="Colour"
              value={data.color}
              onChange={update("color")}
              placeholder="e.g. White"
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 hover:bg-background-subtle">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Price is negotiable</p>
                <p className="text-xs text-foreground-muted">
                  Buyers will see a &ldquo;Negotiable&rdquo; badge on your listing
                </p>
              </div>
            </label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <AutoComplete
                label="Province"
                value={data.province}
                onChange={updateProvince}
                options={PROVINCES}
                error={errors.province}
                required
                placeholder="e.g. Western Province"
              />
              <AutoComplete
                label="District"
                value={data.district}
                onChange={updateDistrict}
                options={getDistricts(data.province)}
                error={errors.district}
                required
                placeholder={
                  PROVINCES.includes(data.province)
                    ? `e.g. ${getDistricts(data.province)[0] ?? "District"}`
                    : "Select province first"
                }
                disabled={!PROVINCES.includes(data.province)}
              />
              <AutoComplete
                label="Town"
                value={data.town}
                onChange={updateTown}
                options={getTowns(data.province, data.district)}
                error={errors.town}
                required
                placeholder={
                  getDistricts(data.province).includes(data.district)
                    ? `e.g. ${getTowns(data.province, data.district)[0] ?? "Town"}`
                    : "Select district first"
                }
                disabled={!getDistricts(data.province).includes(data.district)}
              />
            </div>
          </>
        )}

        {step === "specs" && (
          <>
            <Select
              label="Condition"
              value={data.condition}
              onChange={update("condition")}
              options={CONDITION_OPTIONS}
              placeholder="Select condition"
              required
            />
            <Select
              label="Fuel Type"
              value={data.fuelType}
              onChange={update("fuelType")}
              error={errors.fuelType}
              options={FUEL_OPTIONS}
              placeholder="Select fuel type"
              required
            />
            <Select
              label="Transmission"
              value={data.transmission}
              onChange={update("transmission")}
              error={errors.transmission}
              options={TRANSMISSION_OPTIONS}
              placeholder="Select transmission"
              required
            />
            <Select
              label="Body Type"
              value={data.bodyType}
              onChange={update("bodyType")}
              options={BODY_TYPE_OPTIONS}
              placeholder="Select body type"
            />
            <Input
              label="Engine Size"
              value={data.engineSize}
              onChange={update("engineSize")}
              placeholder="e.g. 2.5L"
            />
            <RichTextEditor
              label="Description"
              value={data.description}
              onChange={(html) => {
                setData((d) => ({ ...d, description: html }));
                setErrors((er) => ({ ...er, description: undefined }));
              }}
              placeholder="Describe the car's condition, features, history…"
            />
          </>
        )}

        {step === "images" && (
          <div className="flex flex-col gap-6">
            <ImageUploader
              onChange={(urls) => {
                setUploadedUrls(urls);
                if (urls.length > 0) setImageError("");
              }}
              onUploadingChange={setUploading}
              maxImages={5}
              initialImages={uploadedUrls}
            />
            {imageError && <p className="text-sm font-medium text-red-500">{imageError}</p>}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Emission Test Certificate{" "}
                <span className="font-normal text-foreground-muted">(optional)</span>
              </p>
              <p className="text-xs text-foreground-muted">
                Upload a photo of your latest emission test certificate.
              </p>
              <ImageUploader
                onChange={(urls) => setEmissionTestUrl(urls[0] ?? "")}
                onUploadingChange={setEmissionUploading}
                maxImages={1}
                addLabel="emission test"
                initialImages={emissionTestUrl ? [emissionTestUrl] : []}
              />
            </div>
          </div>
        )}

        {step === "review" && !showContactDetails && (
          <div className="flex flex-col gap-4">
            {/* Pre-registration phone collection */}
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="mb-1 text-sm font-semibold tracking-wider text-foreground-muted uppercase">
                Your Phone Numbers
              </h3>
              <p className="mb-1 text-xs text-foreground-muted">
                Add your contact numbers — they&apos;ll be saved when you create your account.
              </p>
              <p className="mb-3 text-xs text-foreground-muted/70">
                Tap <span className="font-medium">WhatsApp</span> next to a number to mark it — it
                turns green so buyers know they can reach you there.
              </p>
              {localPhones.length === 1 && (
                <p className="mb-2 text-xs text-foreground-muted/60 italic">
                  Wrong number? Add the correct one below, then remove this one.
                </p>
              )}
              {localPhones.length > 0 && (
                <ul className="mb-3 flex flex-col divide-y divide-border">
                  {localPhones.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 py-2.5">
                      <span className="text-sm font-medium text-foreground">+94 {p.number}</span>
                      <div className="ml-1 flex flex-wrap items-center gap-1">
                        {p.isPrimary ? (
                          <span className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setLocalPrimary(p.id)}
                            className="cursor-pointer rounded-full border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:border-primary-300 hover:text-primary-600"
                          >
                            Set primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleLocalWhatsApp(p.id)}
                          className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs transition-colors ${
                            p.isWhatsApp
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-border text-foreground-muted hover:border-green-200 hover:text-green-600"
                          }`}
                        >
                          WhatsApp
                        </button>
                      </div>
                      {localPhones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocalPhone(p.id)}
                          className="ml-auto text-foreground-muted transition-colors hover:text-danger"
                          title="Remove"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {localPhones.length < 5 && (
                <div className="flex gap-2">
                  <div className="flex flex-1">
                    <span className="flex h-9 items-center rounded-l-md border border-r-0 border-border bg-background-subtle px-3 text-xs text-foreground-muted select-none">
                      +94
                    </span>
                    <input
                      type="tel"
                      value={localPhoneInput}
                      onChange={(e) =>
                        setLocalPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 9))
                      }
                      onKeyDown={(e) => e.key === "Enter" && addLocalPhone()}
                      placeholder="712345678"
                      maxLength={9}
                      className="h-9 w-full rounded-r-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    />
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={addLocalPhone}>
                    Add
                  </Button>
                </div>
              )}
              {localPhoneError && <p className="mt-2 text-xs text-danger">{localPhoneError}</p>}
            </div>
            <p className="text-sm text-foreground-muted">
              Create a free account to submit your listing.
            </p>
            <RegisterForm
              showPhone={false}
              onSuccess={() => {
                setHasJustRegistered(true);
                (async () => {
                  for (const lp of localPhones) {
                    await fetch("/api/seller/phones", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        number: lp.number,
                        isPrimary: lp.isPrimary,
                        isWhatsApp: lp.isWhatsApp,
                      }),
                    });
                  }
                  const r = await fetch("/api/auth/me");
                  const d = await r.json();
                  if (d?.seller) setSeller(d.seller);
                })().catch(() => {});
              }}
              loginHref="/auth/login?next=/sell"
            />
          </div>
        )}

        {step === "review" && showContactDetails && (
          <div className="flex flex-col gap-4">
            {/* Contact details */}
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="mb-3 text-sm font-semibold tracking-wider text-foreground-muted uppercase">
                Your Contact Details
              </h3>
              {seller ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {seller.firstName} {seller.lastName}
                    </span>
                    <span className="text-sm text-foreground-muted">{seller.email}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
                      Phone Numbers
                    </p>
                    {seller.phones.length === 0 && (
                      <p className="text-sm text-danger">
                        Add at least one phone number to submit.
                      </p>
                    )}
                    <ul className="flex flex-col divide-y divide-border">
                      {seller.phones.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 py-2.5">
                          <span className="text-sm font-medium text-foreground">
                            +94 {p.number}
                          </span>
                          <div className="ml-1 flex flex-wrap items-center gap-1">
                            {p.isPrimary ? (
                              <span className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                                Primary
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => patchPhone(p.id, { isPrimary: true })}
                                disabled={patchingPhoneId === p.id}
                                className="cursor-pointer rounded-full border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:border-primary-300 hover:text-primary-600 disabled:opacity-40"
                              >
                                Set primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => patchPhone(p.id, { isWhatsApp: !p.isWhatsApp })}
                              disabled={patchingPhoneId === p.id}
                              className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-40 ${
                                p.isWhatsApp
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-border text-foreground-muted hover:border-green-200 hover:text-green-600"
                              }`}
                            >
                              WhatsApp
                            </button>
                          </div>
                          {seller.phones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePhone(p.id)}
                              disabled={removingPhoneId === p.id}
                              className="ml-auto text-foreground-muted transition-colors hover:text-danger disabled:opacity-40"
                              title="Remove"
                            >
                              {removingPhoneId === p.id ? (
                                <span className="text-xs">…</span>
                              ) : (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    {seller.phones.length < 5 && (
                      <div className="flex gap-2 pt-1">
                        <div className="flex flex-1">
                          <span className="flex h-9 items-center rounded-l-md border border-r-0 border-border bg-background-subtle px-3 text-xs text-foreground-muted select-none">
                            +94
                          </span>
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) =>
                              setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                            }
                            placeholder="712345678"
                            maxLength={9}
                            className="h-9 w-full rounded-r-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addPhone}
                          disabled={addingPhone}
                        >
                          {addingPhone ? "Adding…" : "Add"}
                        </Button>
                      </div>
                    )}
                    {phoneError && <p className="text-xs text-danger">{phoneError}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">Loading…</p>
              )}
            </div>

            {/* Listing summary */}
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background-subtle p-4 text-sm">
              <ReviewRow label="Title" value={data.title} />
              <ReviewRow label="Make / Model" value={`${data.make} ${data.model}`} />
              <ReviewRow label="Year" value={data.year} />
              <ReviewRow
                label="Condition"
                value={
                  CONDITION_OPTIONS.find((o) => o.value === data.condition)?.label ?? data.condition
                }
              />
              <ReviewRow label="Price" value={formatPrice(Number(data.price))} />
              <ReviewRow label="Mileage" value={`${Number(data.mileage).toLocaleString()} km`} />
              <ReviewRow label="Fuel" value={data.fuelType} />
              <ReviewRow label="Transmission" value={data.transmission} />
              {data.bodyType && <ReviewRow label="Body" value={data.bodyType} />}
              {data.engineSize && <ReviewRow label="Engine" value={data.engineSize} />}
              {data.color && <ReviewRow label="Colour" value={data.color} />}
              <ReviewRow
                label="Location"
                value={[data.town, data.district, data.province].filter(Boolean).join(", ")}
              />
              <ReviewRow
                label="Photos"
                value={
                  uploadedUrls.length > 0
                    ? `${uploadedUrls.length} photo${uploadedUrls.length !== 1 ? "s" : ""}`
                    : "No photos"
                }
              />
              <ReviewRow label="Negotiable" value={isNegotiable ? "Yes" : "No"} />
              <ReviewRow
                label="Emission Test"
                value={emissionTestUrl ? "Uploaded" : "Not provided"}
              />
              {apiError && <p className="rounded-md bg-red-50 px-3 py-2 text-danger">{apiError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={goBack} disabled={stepIdx === 0}>
          Back
        </Button>
        {step !== "review" ? (
          <Button onClick={goNext} disabled={step === "images" && (uploading || emissionUploading)}>
            {step === "images" && (uploading || emissionUploading) ? "Uploading…" : "Continue"}
          </Button>
        ) : showContactDetails ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !seller || seller.phones.length === 0}
            title={seller?.phones.length === 0 ? "Add at least one phone number" : undefined}
          >
            {submitting ? "Submitting…" : "Submit Listing"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-32 shrink-0 font-medium text-foreground-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
