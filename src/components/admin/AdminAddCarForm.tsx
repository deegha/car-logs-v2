"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { PROVINCES, getDistricts, getTowns } from "@/data/locations";
import { currency } from "@/config/app";
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

  const [sellerId, setSellerId] = useState("");
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
    if (!sellerId) errs.sellerId = "Required";
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
          sellerId: Number(sellerId),
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
          <Input
            label={`Price (${currency.code})`}
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((er) => ({ ...er, price: undefined! }));
            }}
            error={errors.price}
            required
            min={0}
            placeholder="25000"
          />
          <Input
            label="Mileage (km)"
            type="number"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value);
              setErrors((er) => ({ ...er, mileage: undefined! }));
            }}
            error={errors.mileage}
            required
            min={0}
            placeholder="45000"
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
            <p className="text-xs text-foreground-muted">Shows a &ldquo;Negotiable&rdquo; badge on the listing</p>
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
          <Input
            label="Body Type"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            placeholder="e.g. Sedan, SUV"
          />
          <Input
            label="Engine Size"
            value={engineSize}
            onChange={(e) => setEngineSize(e.target.value)}
            placeholder="e.g. 2.5L"
          />
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the car's condition, features, history…"
          rows={4}
        />
      </section>

      {/* Photos */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Photos
        </h2>
        <ImageUploader onChange={setUploadedUrls} onUploadingChange={setUploading} maxImages={5} />
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">Emission Test Certificate <span className="font-normal text-foreground-muted">(optional)</span></p>
          <p className="text-xs text-foreground-muted">Upload a photo of the latest emission test certificate.</p>
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
