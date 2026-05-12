"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { PROVINCES, getDistricts, getTowns } from "@/data/locations";
import { currency } from "@/config/app";

type Step = "details" | "specs" | "images" | "review";

const STEPS: Step[] = ["details", "specs", "images", "review"];
const STEP_LABELS: Record<Step, string> = {
  details: "Details",
  specs: "Specs",
  images: "Photos",
  review: "Review",
};

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
  fuelType: "",
  transmission: "",
  bodyType: "",
  engineSize: "",
  description: "",
  province: "",
  district: "",
  town: "",
};

export function AddCarForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [emissionTestUrl, setEmissionTestUrl] = useState<string>("");
  const [emissionUploading, setEmissionUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    if (step === "details" && !validateDetails()) return;
    if (step === "specs" && !validateSpecs()) return;
    if (step === "images" && (uploading || emissionUploading)) return;
    const idx = STEPS.indexOf(step);
    const nextStep = STEPS[idx + 1];
    setStep(nextStep);
    if (nextStep === "review" && isAuthenticated === null) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setIsAuthenticated(!!d?.seller))
        .catch(() => setIsAuthenticated(false));
    }
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
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
        return;
      }
      router.push(`/seller/dashboard?submitted=1`);
    } catch {
      setApiError("Something went wrong. Please try again.");
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
                placeholder={data.make ? "e.g. Camry" : "Select a make first"}
                disabled={!data.make}
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
              <Input
                label={`Price (${currency.code})`}
                type="number"
                value={data.price}
                onChange={update("price")}
                error={errors.price}
                required
                min={0}
                placeholder="25000"
              />
              <Input
                label="Mileage (km)"
                type="number"
                value={data.mileage}
                onChange={update("mileage")}
                error={errors.mileage}
                required
                min={0}
                className="col-span-2 sm:col-span-1"
                placeholder="45000"
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
                <p className="text-xs text-foreground-muted">Buyers will see a &ldquo;Negotiable&rdquo; badge on your listing</p>
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
                placeholder={data.province ? "e.g. Colombo" : "Select province first"}
                disabled={!data.province}
              />
              <AutoComplete
                label="Town"
                value={data.town}
                onChange={updateTown}
                options={getTowns(data.province, data.district)}
                error={errors.town}
                required
                placeholder={data.district ? "e.g. Nugegoda" : "Select district first"}
                disabled={!data.district}
              />
            </div>
          </>
        )}

        {step === "specs" && (
          <>
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
            <Input
              label="Body Type"
              value={data.bodyType}
              onChange={update("bodyType")}
              placeholder="e.g. Sedan, SUV, Hatchback"
            />
            <Input
              label="Engine Size"
              value={data.engineSize}
              onChange={update("engineSize")}
              placeholder="e.g. 2.5L"
            />
            <Textarea
              label="Description"
              value={data.description}
              onChange={update("description")}
              placeholder="Describe the car's condition, features, history…"
              rows={5}
            />
          </>
        )}

        {step === "images" && (
          <div className="flex flex-col gap-6">
            <ImageUploader
              onChange={setUploadedUrls}
              onUploadingChange={setUploading}
              maxImages={5}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Emission Test Certificate <span className="font-normal text-foreground-muted">(optional)</span></p>
              <p className="text-xs text-foreground-muted">Upload a photo of your latest emission test certificate.</p>
              <ImageUploader
                onChange={(urls) => setEmissionTestUrl(urls[0] ?? "")}
                onUploadingChange={setEmissionUploading}
                maxImages={1}
              />
            </div>
          </div>
        )}

        {step === "review" && isAuthenticated === null && (
          <p className="py-4 text-center text-sm text-foreground-muted">Checking your session…</p>
        )}

        {step === "review" && isAuthenticated === false && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground-muted">
              Create a free account to submit your listing.
            </p>
            <RegisterForm
              onSuccess={() => setIsAuthenticated(true)}
              loginHref="/auth/login?next=/sell"
            />
          </div>
        )}

        {step === "review" && isAuthenticated === true && (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background-subtle p-4 text-sm">
            <ReviewRow label="Title" value={data.title} />
            <ReviewRow label="Make / Model" value={`${data.make} ${data.model}`} />
            <ReviewRow label="Year" value={data.year} />
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
            <ReviewRow label="Emission Test" value={emissionTestUrl ? "Uploaded" : "Not provided"} />
            {apiError && <p className="rounded-md bg-red-50 px-3 py-2 text-danger">{apiError}</p>}
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
        ) : isAuthenticated === true ? (
          <Button onClick={handleSubmit} disabled={submitting}>
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
