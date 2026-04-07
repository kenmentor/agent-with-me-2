import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openEmailClient() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, try to open native email app
    const emailApps = [
      'mailto:', // Fallback - opens default email app
      'googlemail://',
      'ms-outlook://',
      'io.mymail://',
    ];
    
    // Try each app, fall back to mailto if all fail
    for (const app of emailApps) {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = app;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 1000);
        return; // If it doesn't throw, it worked
      } catch (e) {
        continue;
      }
    }
    
    // Fallback to mailto
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
