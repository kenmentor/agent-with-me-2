"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Calendar, CreditCard, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function PaymentNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "due_soon",
      title: "Rent Due in 3 Days",
      message: "Your rent of ₹45,000 for 2BHK Apartment in Bandra West is due on Jan 25, 2024",
      action: "Pay Now",
      actionLink: "/payments/pay",
      priority: "high",
    },
    {
      id: 2,
      type: "approval_pending",
      title: "Payment Pending Approval",
      message: "Your payment of ₹45,000 is waiting for landlord approval",
      action: "View Details",
      actionLink: "/payments/history",
      priority: "medium",
    },
  ])

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`shadow-lg ${
            notification.priority === "high"
              ? "border-red-200 bg-red-50"
              : notification.priority === "medium"
                ? "border-yellow-200 bg-yellow-50"
                : "border-blue-200 bg-blue-50"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {notification.type === "due_soon" && <Calendar className="h-5 w-5 text-red-600 mt-0.5" />}
                {notification.type === "approval_pending" && <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />}
                {notification.type === "overdue" && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}

                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <Link href={notification.actionLink}>
                    <Button size="sm" className="mt-2">
                      {notification.action}
                    </Button>
                  </Link>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="p-1 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
