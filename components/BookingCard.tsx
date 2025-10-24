import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  RotateCcw,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

type BookingStatus = "confirmed" | "pending" | "cancelled" | "draft";

export interface BookingCardProps {
  booking: {
    _id: string;
    houseTitle: string;
    guestName: string;
    tenantPhone: string;
    amount: number;
    status: BookingStatus;
    checkIn: string;
    checkOut: string;
    platformFee: number;
    expiredDate: string;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onRefund?: (id: string) => void;
  };
}

export default function BookingCard({ booking }: BookingCardProps) {
  const now = new Date();
  const expired = new Date(booking.expiredDate) < now;

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper for confirmation dialogs
  const confirmAction = (message: string, action: () => void) => {
    if (window.confirm(message)) action();
  };

  return (
    <div
      key={booking._id}
      className="flex flex-col md:flex-row md:items-center md:justify-between p-5 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200"
    >
      {/* LEFT SIDE */}
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-3">
          <Clock className="h-5 w-5 text-gray-500" />
          <h4 className="font-semibold text-lg text-gray-800">
            {booking.guestName}
          </h4>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {booking.houseTitle || "Property details unavailable"}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-500">Check-In</p>
            <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Check-Out</p>
            <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Platform Fee</p>
            <p>₦{booking.platformFee.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Expires</p>
            <p
              className={expired ? "text-red-500 font-medium" : "text-gray-700"}
            >
              {new Date(booking.expiredDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          📞 <span className="font-medium">{booking.tenantPhone}</span>
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="text-right mt-4 md:mt-0 md:ml-6">
        <p className="text-2xl font-bold text-green-600">
          ₦{booking.amount.toLocaleString()}
        </p>

        <div className="flex flex-col space-y-2 mt-3">
          {!expired && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  confirmAction("Do you want to approve this booking?", () =>
                    booking.onApprove?.(booking._id)
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve House
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  confirmAction("Do you want to reject this booking?", () =>
                    booking.onReject?.(booking._id)
                  )
                }
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Refund me, I don’t like this house
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
