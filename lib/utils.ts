import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openEmailClient() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, open default email app (just opens inbox, no message)
    window.location.href = 'mailto:';
  } else {
    // On desktop, open Gmail
    window.open('https://mail.google.com', '_blank');
  }
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0';
  return `₦${num.toLocaleString('en-NG')}`;
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₦0';
  return `₦${num.toLocaleString('en-NG')}`;
}

export function formatPhoneNumber(phone: string | number | null | undefined): string {
  if (!phone) return "";
  const phoneStr = String(phone).replace(/\D/g, "");
  if (phoneStr.length === 10) {
    return `0${phoneStr}`;
  }
  if (phoneStr.length === 11 && phoneStr.startsWith("0")) {
    return phoneStr;
  }
  if (phoneStr.length === 12 && phoneStr.startsWith("234")) {
    return `0${phoneStr.slice(3)}`;
  }
  return phoneStr;
}

export function formatPhoneForCall(phone: string | number | null | undefined): string {
  if (!phone) return "";
  const phoneStr = String(phone).replace(/\D/g, "");
  if (phoneStr.length === 10) {
    return `0${phoneStr}`;
  }
  if (phoneStr.length === 11 && phoneStr.startsWith("0")) {
    return phoneStr;
  }
  if (phoneStr.length === 12 && phoneStr.startsWith("234")) {
    return `0${phoneStr.slice(3)}`;
  }
  return phoneStr;
}

export function getDisplayName(user: { firstName?: string; lastName?: string; userName?: string } | null): string {
  if (!user) return "User";
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.userName || "User";
}

export function getFirstName(user: { firstName?: string; userName?: string } | null): string {
  if (!user) return "User";
  return user.firstName || user.userName?.split(" ")[0] || "User";
}

const PROPERTY_DRAFT_KEY = "property_draft";

export interface PropertyDraft {
  formData?: Record<string, any>;
  images?: string[];
  savedAt?: number;
}

export function savePropertyDraft(draft: PropertyDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROPERTY_DRAFT_KEY, JSON.stringify({
    ...draft,
    savedAt: Date.now()
  }));
}

export function getPropertyDraft(): PropertyDraft | null {
  if (typeof window === "undefined") return null;
  const draft = localStorage.getItem(PROPERTY_DRAFT_KEY);
  if (!draft) return null;
  try {
    return JSON.parse(draft);
  } catch {
    return null;
  }
}

export function clearPropertyDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROPERTY_DRAFT_KEY);
}

export function hasPropertyDraft(): boolean {
  const draft = getPropertyDraft();
  return !!(draft?.formData || draft?.images?.length);
}
