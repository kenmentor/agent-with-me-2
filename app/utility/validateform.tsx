// or any toast lib you use

import { toast } from "sonner";
interface Property {
  // Basic Info

  _id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: string;
  // Location

  address: string;
  state: string;
  lga: string;

  // Property Details
  bedrooms: string;
  bathrooms: string;

  furnishing: string;

  // Amenities
  amenities: string[];

  // Images
  images: File[];
  video: File | null;
  thumbnail: File | null;
}
export function validateProperty(property: Property): boolean {
  const requiredFields: (keyof Property)[] = [
    "title",
    "description",
    "type",
    "category",
    "price",

    "address",
    "state",
    "lga",
    "bedrooms",
    "bathrooms",

    "furnishing",
  ];

  const missingFields: string[] = [];

  // 🔍 Check simple string fields
  for (const key of requiredFields) {
    const value = property[key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(key);
    }
  }

  // ✅ Special field checks
  if (!property.images || property.images.length === 0)
    missingFields.push("images");
  if (!property.thumbnail) missingFields.push("thumbnail");
  if (!property.video) missingFields.push("video");
  if (!property.amenities || property.amenities.length === 0)
    missingFields.push("amenities");

  // ⚡ Show result
  if (missingFields.length > 0) {
    toast.message(`Please fill in: ${missingFields.join(", ")}`);
    return false;
  }

  toast.message("All fields are valid ✅ Ready to upload!");
  return true;
}
