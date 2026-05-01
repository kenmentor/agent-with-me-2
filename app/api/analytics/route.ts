import { NextResponse } from "next/server";

interface Event {
  type: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface PageView {
  page: string;
  referrer?: string;
  sessionId: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events, pageViews, sessionId, timestamp } = body as {
      events?: Event[];
      pageViews?: PageView[];
      sessionId?: string;
      timestamp?: string;
    };

    console.log("Analytics received:", {
      eventsCount: events?.length || 0,
      pageViewsCount: pageViews?.length || 0,
      sessionId,
    });

    // Process events for simple recommendations
    if (events && events.length > 0) {
      const propertyViews = events.filter((e: Event) => e.type === "property" && e.action === "view");
      const propertyLikes = events.filter((e: Event) => e.type === "property" && (e.action === "like" || e.action === "unlike"));
      
      const userPreferences = {
        viewedProperties: propertyViews.map((p: Event) => p.target),
        likedProperties: propertyLikes.filter((p: Event) => p.action === "like").map((p: Event) => p.target),
        sessionId,
        timestamp,
      };

      console.log("User preferences captured:", userPreferences);
    }

    if (pageViews && pageViews.length > 0) {
      console.log("Page views:", pageViews.map((p: PageView) => p.page));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to process analytics" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  const data: Record<string, unknown> = {
    overview: {
      totalUsers: 1250,
      activeSessions: 45,
      totalPageViews: 15000,
      totalEvents: 45000,
    },
    topProperties: [
      { id: "1", title: "Lekki Apartment", views: 450, likes: 32 },
      { id: "2", title: "Victoria Island Villa", views: 380, likes: 28 },
      { id: "3", title: "Ikoyi Penthouse", views: 290, likes: 21 },
    ],
    recentActivity: [
      { type: "view", property: "Lekki Apartment", time: "2 min ago" },
      { type: "like", property: "Victoria Island Villa", time: "5 min ago" },
      { type: "signup", method: "google", time: "10 min ago" },
    ],
    userJourneys: [
      { path: "/ → /properties → /properties/123 → /chat", count: 45 },
      { path: "/ → /properties → /dashboard", count: 32 },
      { path: "/ → /auth/login → /dashboard/guest", count: 28 },
    ],
    recommendations: {
      popularInLocation: ["Lekki", "Ikoyi", "Victoria Island"],
      popularTypes: ["apartment", "villa", "penthouse"],
      priceRange: { min: 500000, max: 5000000 },
    },
  };

  return NextResponse.json(data[type] || data.overview);
}
