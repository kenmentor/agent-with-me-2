"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ""}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-black hover:bg-gray-800">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoPropertiesState() {
  return (
    <EmptyState
      icon={SearchIcon}
      title="No properties found"
      description="We couldn't find any properties matching your search. Try adjusting your filters or search for something else."
      action={{
        label: "Browse All Properties",
        onClick: () => window.location.href = "/properties",
      }}
    />
  );
}

export function NoMessagesState() {
  return (
    <EmptyState
      icon={MessageIcon}
      title="No messages yet"
      description="Start a conversation with an agent about a property you're interested in."
      action={{
        label: "Browse Properties",
        onClick: () => window.location.href = "/properties",
      }}
    />
  );
}

export function NoBookingsState() {
  return (
    <EmptyState
      icon={CalendarIcon}
      title="No bookings yet"
      description="You haven't made any property bookings yet. Browse available properties to get started."
      action={{
        label: "Find Properties",
        onClick: () => window.location.href = "/properties",
      }}
    />
  );
}

export function NoFavoritesState() {
  return (
    <EmptyState
      icon={HeartIcon}
      title="No saved properties"
      description="Save properties you're interested in to view them later."
      action={{
        label: "Explore Properties",
        onClick: () => window.location.href = "/properties",
      }}
    />
  );
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon={AlertIcon}
      title={message}
      description="Please try again later or contact support if the problem persists."
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
      } : undefined}
    />
  );
}

// Re-export icons from lucide-react
import { Search as SearchIcon, MessageCircle as MessageIcon, Calendar as CalendarIcon, Heart as HeartIcon, AlertCircle as AlertIcon } from "lucide-react";
