"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { MileageInput } from "@/components/ui/MileageInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { PROVINCES, getDistricts, getTowns } from "@/data/locations";
import { BODY_TYPE_OPTIONS } from "@/data/bodyTypes";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { formatPrice } from "@/lib/utils";

interface SellerOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface AdminAddCarFormProps {
  sellers: SellerOption[];
}

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

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "PENDING", label: "Pending" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1989 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

export function AdminAddCarForm({ sellers }: AdminAddCarFormProps) {
  const router = useRouter();

  const [sellerMode, setSellerMode] = useState<"existing" | "manual">("existing");
  const [sellerId, setSellerId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactIsWhatsApp, setContactIsWhatsApp] = useState(false);
  const [status, setStatus] = useState("AVAILABLE");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [emissionTestUrl, setEmissionTestUrl] = useState("");
  const [emissionUploading, setEmissionUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const sellerOptions = sellers.map((s) => ({
    value: String(s.id),
    label: `${s.firstName} ${s.lastName} — ${s.email}`,
  }));

  function validate() {
    const errs: Record<string, string> = {};
    if (sellerMode === "existing") {
      if (!sellerId) errs.sellerId = "Required";
    } else {
      if (!contactName.trim()) errs.contactName = "Required";
      if (!/^\d{9}$/.test(contactPhone)) errs.contactPhone = "Enter 9 digits after +94";
    }
    if (!title.trim()) errs.title = "Required";
    if (!make.trim()) errs.make = "Required";
    if (!model.trim()) errs.model = "Required";
    if (!year) errs.year = "Required";
    if (!price || Number(price) <= 0) errs.price = "Enter a valid price";
    if (!mileage || Number(mileage) < 0) errs.mileage = "Enter valid mileage";
    if (!fuelType) errs.fuelType = "Required";
    if (!transmission) errs.transmission = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(sellerMode === "existing"
            ? { sellerId: Number(sellerId) }
            : {
                manualContact: {
                  name: contactName,
                  phone: contactPhone,
                  isWhatsApp: contactIsWhatsApp,
                },
              }),
          title,
          make,
          model,
          year: Number(year),
          price: Number(price),
          mileage: Number(mileage),
          color: color || null,
          fuelType,
          transmission,
          bodyType: bodyType || null,
          engineSize: engineSize || null,
          description: description || null,
          province: province || null,
          district: district || null,
          town: town || null,
          isNegotiable,
          emissionTestUrl: emissionTestUrl || null,
          status,
          images: uploadedUrls.map((url, i) => ({ url, isPrimary: i === 0, order: i })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Failed to create listing");
        return;
      }
      router.push("/admin/dashboard/listings");
      router.refresh();
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Seller & status */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Seller
        </h2>

        {/* Mode toggle */}
        <div className="flex overflow-hidden rounded-md border border-border text-sm">
          {(["existing", "manual"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setSellerMode(mode);
                setErrors((er) => ({
                  ...er,
                  sellerId: undefined!,
                  contactName: undefined!,
                  contactPhone: undefined!,
                }));
              }}
              className={`flex-1 px-4 py-2 font-medium transition-colors ${
                sellerMode === mode
                  ? "bg-primary-600 text-white"
                  : "bg-background text-foreground-muted hover:bg-background-subtle"
              }`}
            >
              {mode === "existing" ? "Existing seller" : "Manual contact"}
            </button>
          ))}
        </div>

        {sellerMode === "existing" ? (
          <Select
            label="List on behalf of"
            value={sellerId}
            onChange={(e) => {
              setSellerId(e.target.value);
              setErrors((er) => ({ ...er, sellerId: undefined! }));
            }}
            options={sellerOptions}
            placeholder="Select a seller"
            error={errors.sellerId}
            required
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                Contact Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => {
                  setContactName(e.target.value);
                  setErrors((er) => ({ ...er, contactName: undefined! }));
                }}
                placeholder="e.g. Kamal Perera"
                className={`field-input ${errors.contactName ? "border-danger" : ""}`}
              />
              {errors.contactName && <p className="text-sm text-danger">{errors.contactName}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="flex">
                <span className="flex h-9 items-center rounded-l-md border border-r-0 border-border bg-background-subtle px-3 text-xs text-foreground-muted select-none">
                  +94
                </span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 9));
                    setErrors((er) => ({ ...er, contactPhone: undefined! }));
                  }}
                  placeholder="712345678"
                  maxLength={9}
                  className={`h-9 flex-1 rounded-r-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none ${
                    errors.contactPhone
                      ? "border-danger focus:border-danger focus:ring-danger/20"
                      : ""
                  }`}
                />
              </div>
              {errors.contactPhone && <p className="text-sm text-danger">{errors.contactPhone}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background-subtle px-4 py-3 hover:bg-background-subtle/80">
              <input
                type="checkbox"
                checked={contactIsWhatsApp}
                onChange={(e) => setContactIsWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-foreground">This number is on WhatsApp</p>
                <p className="text-xs text-foreground-muted">
                  Buyers will see a WhatsApp button on the listing
                </p>
              </div>
            </label>
          </div>
        )}

        <Select
          label="Listing status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
          required
        />
      </section>

      {/* Basic details */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Details
        </h2>
        <Input
          label="Listing Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((er) => ({ ...er, title: undefined! }));
          }}
          error={errors.title}
          required
          placeholder="e.g. 2020 Toyota Camry SL – 1 Owner"
        />
        <div className="grid grid-cols-2 gap-4">
          <AutoComplete
            label="Make"
            value={make}
            onChange={(v) => {
              setMake(v);
              setModel("");
              setErrors((er) => ({ ...er, make: undefined! }));
            }}
            options={CAR_MAKES}
            error={errors.make}
            required
            placeholder="e.g. Toyota"
          />
          <AutoComplete
            label="Model"
            value={model}
            onChange={(v) => {
              setModel(v);
              setErrors((er) => ({ ...er, model: undefined! }));
            }}
            options={getModels(make)}
            error={errors.model}
            required
            placeholder={make ? "e.g. Camry" : "Select a make first"}
            disabled={!make}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setErrors((er) => ({ ...er, year: undefined! }));
            }}
            options={YEAR_OPTIONS}
            placeholder="Year"
            error={errors.year}
            required
          />
          <CurrencyInput
            label="Price"
            value={price}
            onChange={(raw) => {
              setPrice(raw);
              setErrors((er) => ({ ...er, price: undefined! }));
            }}
            error={errors.price}
            required
          />
          <MileageInput
            label="Mileage"
            value={mileage}
            onChange={(raw) => {
              setMileage(raw);
              setErrors((er) => ({ ...er, mileage: undefined! }));
            }}
            error={errors.mileage}
            required
          />
        </div>
        <Input
          label="Colour"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="e.g. White"
        />
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background-subtle px-4 py-3 hover:bg-background-subtle/80">
          <input
            type="checkbox"
            checked={isNegotiable}
            onChange={(e) => setIsNegotiable(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary-600"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Price is negotiable</p>
            <p className="text-xs text-foreground-muted">
              Shows a &ldquo;Negotiable&rdquo; badge on the listing
            </p>
          </div>
        </label>
        <div className="grid grid-cols-3 gap-4">
          <AutoComplete
            label="Province"
            value={province}
            onChange={(v) => {
              setProvince(v);
              setDistrict("");
              setTown("");
            }}
            options={PROVINCES}
            placeholder="Province"
          />
          <AutoComplete
            label="District"
            value={district}
            onChange={(v) => {
              setDistrict(v);
              setTown("");
            }}
            options={getDistricts(province)}
            placeholder={province ? "District" : "Select province first"}
            disabled={!province}
          />
          <AutoComplete
            label="Town"
            value={town}
            onChange={setTown}
            options={getTowns(province, district)}
            placeholder={district ? "Town" : "Select district first"}
            disabled={!district}
          />
        </div>
      </section>

      {/* Specs */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Specs
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Fuel Type"
            value={fuelType}
            onChange={(e) => {
              setFuelType(e.target.value);
              setErrors((er) => ({ ...er, fuelType: undefined! }));
            }}
            options={FUEL_OPTIONS}
            placeholder="Select fuel type"
            error={errors.fuelType}
            required
          />
          <Select
            label="Transmission"
            value={transmission}
            onChange={(e) => {
              setTransmission(e.target.value);
              setErrors((er) => ({ ...er, transmission: undefined! }));
            }}
            options={TRANSMISSION_OPTIONS}
            placeholder="Select transmission"
            error={errors.transmission}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Body Type"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            options={BODY_TYPE_OPTIONS}
            placeholder="Select body type"
          />
          <Input
            label="Engine Size"
            value={engineSize}
            onChange={(e) => setEngineSize(e.target.value)}
            placeholder="e.g. 2.5L"
          />
        </div>
        <RichTextEditor
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Describe the car's condition, features, history…"
        />
      </section>

      {/* Photos */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Photos
        </h2>
        <ImageUploader onChange={setUploadedUrls} onUploadingChange={setUploading} maxImages={5} />
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">
            Emission Test Certificate{" "}
            <span className="font-normal text-foreground-muted">(optional)</span>
          </p>
          <p className="text-xs text-foreground-muted">
            Upload a photo of the latest emission test certificate.
          </p>
          <ImageUploader
            onChange={(urls) => setEmissionTestUrl(urls[0] ?? "")}
            onUploadingChange={setEmissionUploading}
            maxImages={1}
          />
        </div>
      </section>

      {/* Summary & submit */}
      {price && year && make && model && (
        <p className="text-sm text-foreground-muted">
          Listing:{" "}
          <span className="font-medium text-foreground">
            {year} {make} {model}
          </span>
          {price && (
            <>
              {" "}
              · <span className="font-semibold text-primary-600">{formatPrice(Number(price))}</span>
            </>
          )}
        </p>
      )}

      {apiError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{apiError}</p>}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/dashboard/listings")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading || emissionUploading}>
          {submitting ? "Creating…" : uploading ? "Uploading photos…" : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
