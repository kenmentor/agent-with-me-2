"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Pencil, RefreshCcw, Save, Trash, X } from "lucide-react";
import Req from "@/app/utility/axois";
import { toast } from "sonner";
import { statesAndLGAs } from "@/app/data";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Property {
  _id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: string;
  address: string;
  state: string;
  lga: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  furnishing: string;
  amenities: string[];
  contactPreference: string;
  availableFrom: string;
}

const sampleData: Property = {
  title: "2 Bedroom Apartment",
  description: "Spacious and clean apartment with constant water supply.",
  type: "rent",
  category: "apartment",
  price: "45000",
  address: "123 Palm Street",
  state: "Lagos",
  lga: "Ikeja",
  bedrooms: "2",
  bathrooms: "2",
  area: "85",
  furnishing: "semi-furnished",
  amenities: ["Water", "Electricity", "Parking"],
  contactPreference: "phone",
  availableFrom: "2025-11-01",
};

export default function EditablePropertyCard({
  data,
  getData,
}: {
  data?: Property;
  getData: () => void;
}) {
  const [formData, setFormData] = useState<Property>(data || sampleData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("all");

  const { app, base } = Req;
  async function handleSave() {
    try {
      setLoading(true);
      await app.put(`${base}/v1/house/${data?._id}`, formData);
      getData();
      setIsEditing(false);
    } catch (error) {
      toast.error("cant no update ");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      await app.put(`${base}/v1/house/${data?._id}`, {
        avaliable: false,
      });
    } catch (error) {
      toast.error("cant no update ");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setFormData(data || sampleData);
    setIsEditing(false);
  }

  return (
    <Card className="w-full mx-auto border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit " : formData?.title}
          </h2>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-1"
                disabled={loading}
              >
                <Save className="h-4 w-4" />{" "}
                {loading ? <Loader className=" animate-spin" /> : "Save"}
              </Button>
              <Button
                size="sm"
                disabled={loading}
                onClick={handleCancel}
                className="flex items-center gap-1 bg-green-500"
              >
                <RefreshCcw className="h-4 w-4" /> Reset
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={handleCancel}
                className="flex items-center gap-1"
              >
                <Trash className="h-4 w-4" /> Disable
              </Button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <p className="text-gray-600">{formData?.description}</p>
            <p className="text-sm text-gray-500">
              ₦{Number(formData?.price).toLocaleString()} / month
            </p>
            <p className="text-sm text-gray-500">
              📍 {formData?.address}, {formData?.lga}, {formData?.state}
            </p>
            <p className="text-sm text-gray-500">
              🏠 {formData?.bedrooms} bed • {formData?.bathrooms} bath •{" "}
              {formData?.area} sqm • {formData?.furnishing}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <Input
              value={formData?.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Title"
            />
            <Textarea
              value={formData?.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description"
            />
            <Input
              value={formData?.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Price (₦)"
            />
            <Input
              value={formData?.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Address"
            />
            <Select
              name="state"
              onValueChange={(value) => {
                setSelectedState(value);
                setFormData((prev) => ({
                  ...prev,
                  state: value,
                  lga: "all",
                }));
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any State</SelectItem>
                {Object.keys(statesAndLGAs).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ LGA (depends on selected state) */}
            <Select
              name="lga"
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, lga: value }))
              }
              disabled={selectedState === "all"}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="LGA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any LGA</SelectItem>
                {selectedState !== "all" &&
                  statesAndLGAs[selectedState]?.map((lga) => (
                    <SelectItem key={lga} value={lga}>
                      {lga}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
