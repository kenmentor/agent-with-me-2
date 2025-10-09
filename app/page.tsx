import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Shield, Users, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import PropertyCard from "./components/PopertyCard";
import FeaturedPropertyCard from "./components/featuredPropertyCard";
const mockProperties = [
  {
    id: 2,
    title: "3BHK Villa in Koregaon Park",
    location: "Koregaon Park, Pune",
    price: "₦1.2 Cr",
    type: "sale",
    bedrooms: 3,
    bathrooms: 3,
    area: "1200 sq ft",
    image: "/placeholder.svg?height=200&width=300",
    landlord: "Priya Sharma",
    rating: 4.8,
    verified: true,
    views: 89,
  },
  {
    id: 3,
    title: "1BHK Studio in Whitefield",
    location: "Whitefield, Bangalore",
    price: "₦25,000/month",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: "450 sq ft",
    image: "/placeholder.svg?height=200&width=300",
    landlord: "Amit Patel",
    rating: 4.2,
    verified: true,
    views: 67,
  },
];
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Agent with me
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/properties">
                <Button variant="ghost">Browse Properties</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect <span className="text-blue-600">Home</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified landlords and tenants. Rent, buy, or sell
            properties with confidence.
            <strong> Free 3-day trial for all listings!</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Properties
              </Button>
            </Link>
            <Link href="/auth/register?role=landlord">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white"
              >
                List Your Property - FREE Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Agent with me ?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Verified Users</CardTitle>
                <CardDescription>
                  All users verified through phone/email. Safe and secure
                  transactions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Direct Contact</CardTitle>
                <CardDescription>
                  Connect directly with property owners. In-app chat and calling
                  features.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>
                  3-day free listing for landlords. No hidden charges during
                  beta phase.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Home className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Rent Payments</CardTitle>
                <CardDescription>
                  Secure online rent payments with landlord approval system and
                  payment history.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link href="/properties">
              <Button variant="outline">View All Properties</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockProperties.map((property) => {
              return (
                <FeaturedPropertyCard property={property} favorites={[]} />
              );
            })}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=200&width=300"
                  alt="1BHK Studio in Whitefield"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-green-500">
                  For Rent
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  1BHK Studio in Whitefield
                </h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Whitefield, Bangalore
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-3">
                  ₦25,000/month
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    Contact Owner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Features Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Secure Rent Payment System
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">
                Multiple Payment Methods
              </h3>
              <p className="text-blue-100">
                UPI, Cards, Net Banking - Choose what works for you
              </p>
            </div>
            <div className="bg-blue-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Landlord Approval</h3>
              <p className="text-blue-100">
                Two-step verification ensures payment security
              </p>
            </div>
            <div className="bg-blue-700 p-6 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Payment History</h3>
              <p className="text-blue-100">
                Track all payments with detailed transaction records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Agent with me today and start your property journey with our
            free trial!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=tenant">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100"
              >
                I'm Looking for Property
              </Button>
            </Link>
            <Link href="/auth/register?role=landlord">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                I Want to List Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-6 w-6" />
                <span className="text-xl font-bold">Agent with me </span>
              </div>
              <p className="text-gray-400">
                Making home finding simple and secure for everyone in India.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Tenants</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/properties" className="hover:text-white">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register?role=tenant"
                    className="hover:text-white"
                  >
                    Sign Up Free
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Landlords</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/auth/register?role=landlord"
                    className="hover:text-white"
                  >
                    List Property
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Agent with me . All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
