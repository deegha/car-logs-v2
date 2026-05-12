"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { CAR_MAKES, getModels } from "@/data/carMakes";
import { PROVINCES, getDistricts, getTowns } from "@/data/locations";
import { formatPrice } from "@/lib/utils";
import type { Car, CarImage } from "@/types";

interface EditCarFormProps {
  car: Car & {
    images?: CarImage[];
    province?: string | null;
    district?: string | null;
    town?: string | null;
  };
  apiEndpoint: string;
  cancelHref: string;
  isAdmin?: boolean;
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
  { value: "PENDING", label: "Pending (Under Review)" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
  { value: "REJECTED", label: "Rejected" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1989 }, (_, i) => {
  const y = String(currentYear - i);
  return { value: y, label: y };
});

export function EditCarForm({ car, apiEndpoint, cancelHref, isAdmin = false }: EditCarFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(car.title);
  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [price, setPrice] = useState(String(Number(car.price)));
  const [mileage, setMileage] = useState(String(car.mileage));
  const [color, setColor] = useState(car.color ?? "");
  const [fuelType, setFuelType] = useState(car.fuelType);
  const [transmission, setTransmission] = useState(car.transmission);
  const [bodyType, setBodyType] = useState(car.bodyType ?? "");
  const [engineSize, setEngineSize] = useState(car.engineSize ?? "");
  const [description, setDescription] = useState(car.description ?? "");
  const [province, setProvince] = useState(
    (car as Car & { province?: string | null }).province ?? ""
  );
  const [district, setDistrict] = useState(
    (car as Car & { district?: string | null }).district ?? ""
  );
  const [town, setTown] = useState((car as Car & { town?: string | null }).town ?? "");
  const [status, setStatus] = useState<string>(isAdmin ? car.status : "PENDING");
  const [isNegotiable, setIsNegotiable] = useState(car.isNegotiable ?? false);
  const [emissionTestUrl, setEmissionTestUrl] = useState<string>(car.emissionTestUrl ?? "");
  const [emissionUploading, setEmissionUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(
    (car.images ?? []).sort((a, b) => a.order - b.order).map((img) => img.url)
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const initialImageUrls = (car.images ?? [])
    .sort((a, b) => a.order - b.order)
    .map((img) => img.url);

  function validate() {
    const errs: Record<string, string> = {};
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
      const res = await fetch(apiEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          ...(isAdmin && { status }),
          isNegotiable,
          emissionTestUrl: emissionTestUrl || null,
          images: uploadedUrls.map((url, i) => ({ url, isPrimary: i === 0, order: i })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Failed to save changes");
        return;
      }
      router.push(cancelHref);
      router.refresh();
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {isAdmin && (
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
          <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
            Status
          </h2>
          <Select
            label="Listing status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
            required
          />
        </section>
      )}

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

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Specs
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Fuel Type"
            value={fuelType}
            onChange={(e) => {
              setFuelType(e.target.value as typeof fuelType);
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
              setTransmission(e.target.value as typeof transmission);
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

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold tracking-wider text-foreground-muted uppercase">
          Photos
        </h2>
        <ImageUploader
          onChange={setUploadedUrls}
          onUploadingChange={setUploading}
          maxImages={5}
          initialImages={initialImageUrls}
        />

        <div className="flex flex-col gap-2 border-t border-border pt-4">
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
            initialImages={emissionTestUrl ? [emissionTestUrl] : []}
          />
        </div>
      </section>

      {make && model && year && price && (
        <p className="text-sm text-foreground-muted">
          Listing:{" "}
          <span className="font-medium text-foreground">
            {year} {make} {model}
          </span>{" "}
          · <span className="font-semibold text-primary-600">{formatPrice(Number(price))}</span>
        </p>
      )}

      {!isAdmin && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Saving changes will put your listing back under review before it goes live.
        </p>
      )}

      {apiError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{apiError}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push(cancelHref)}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading || emissionUploading}>
          {submitting ? "Saving…" : uploading ? "Uploading photos…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
