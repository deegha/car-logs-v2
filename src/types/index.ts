import type { CarStatus, FuelType, Transmission, SellerStatus } from "@/generated/prisma/enums";

export type { CarStatus, FuelType, Transmission, SellerStatus };

export interface CarImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
  carId: number;
  createdAt: string | Date;
}

export interface Car {
  id: number;
  slug: string | null;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string | number;
  mileage: number;
  color: string | null;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: string | null;
  engineSize: string | null;
  description: string | null;
  province: string | null;
  district: string | null;
  town: string | null;
  isNegotiable: boolean;
  emissionTestUrl: string | null;
  status: CarStatus;
  featured: boolean;
  sellerId: number;
  images?: CarImage[];
  seller?: Seller;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: SellerStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaginatedCars {
  cars: Car[];
  total: number;
  page: number;
  pages: number;
}

export interface CarFilters {
  search?: string;
  make?: string;
  model?: string;
  minYear?: string;
  maxYear?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}
