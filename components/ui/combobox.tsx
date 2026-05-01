"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";

interface ComboboxProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function Combobox({ label, value, onValueChange, options, placeholder, error, required }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>{label}{required ? " *" : ""}</Label>
      <div ref={wrapperRef} className="relative">
        <Input
          value={value || filter}
          onChange={(e) => {
            setFilter(e.target.value);
            onValueChange(e.target.value);
          }}
          onFocus={() => {
            setOpen(true);
            setFilter(value || "");
          }}
          placeholder={placeholder || `Select or type...`}
          className={error ? "border-red-500 pr-10" : "pr-10"}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No matches. Type to add custom.
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                    value === option ? "bg-gray-50 dark:bg-gray-700 font-medium" : ""
                  }`}
                  onClick={() => {
                    onValueChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                  {value === option && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
