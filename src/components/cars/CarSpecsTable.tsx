import type { Car } from "@/types";
import { formatMileage, formatPrice } from "@/lib/utils";

interface CarSpecsTableProps {
  car: Car;
}

const fuelLabels: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
  PLUGIN_HYBRID: "Plug-in Hybrid",
};

const transmissionLabels: Record<string, string> = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual",
  CVT: "CVT",
};

export function CarSpecsTable({ car }: CarSpecsTableProps) {
  const rows = [
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Year", value: String(car.year) },
    { label: "Price", value: formatPrice(car.price) },
    { label: "Mileage", value: formatMileage(car.mileage) },
    { label: "Fuel Type", value: fuelLabels[car.fuelType] ?? car.fuelType },
    { label: "Transmission", value: transmissionLabels[car.transmission] ?? car.transmission },
    car.bodyType ? { label: "Body Type", value: car.bodyType } : null,
    car.engineSize ? { label: "Engine Size", value: car.engineSize } : null,
    car.color ? { label: "Colour", value: car.color } : null,
    (car.province || car.district || car.town)
      ? {
          label: "Location",
          value: [car.town, car.district, car.province].filter(Boolean).join(", "),
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-background" : "bg-background-subtle"}>
              <td className="w-2/5 px-4 py-2.5 font-medium text-foreground-muted">{row.label}</td>
              <td className="px-4 py-2.5 text-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
