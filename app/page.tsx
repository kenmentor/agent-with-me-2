"use client";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { useState, useEffect } from "react";
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
import Image from "next/image";
import backgroundImage from "@/public/image1.png";
import Header from "@/components/Header";
import useWindowDimensions from "@/hooks/useWindowDimenstions";
import FeaturedPropertyCard from "@/components/FeaturedPropertyCard";
import Req from "@/app/utility/axois";

const { base, app } = Req;

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  thumbnail: string;
  landlord: string;
  rating: number;
  verified: boolean;
  views: number;
}

export default function HomePage() {
  const [data, setData] = useState<Property[]>([]);

  useEffect(() => {
    const finalUrl = `${base}/v1/house?limit=3`;

    const fetchData = async () => {
      try {
        const res = (await app.get(finalUrl)).data;
        const result = res.data;
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-h-screen min-w-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        className="py-20 px-4 h-screen flex justify-center items-center flex-col"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            The smart way to find your next home
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Connect with verified landlords and tenants. Rent, buy, or sell
            properties with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button
                size="lg"
                className="w-auto sm:w-auto text-white hover:border hover:bg-transparent hover:text-white"
              >
                Browse Properties
              </Button>
            </Link>
            <Link href="/auth/register?role=landlord">
              <Button
                size="lg"
                variant="outline"
                className="w-auto sm:w-auto bg-white"
              >
                List Your Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Counters */}
        <div className="relative flex-row w-[460px] justify-between top-32 hidden md:flex">
          <div>
            <AnimatedCounter
              target={800}
              className="text-white text-3xl font-semibold"
            />
            <p className="text-white">Listed Properties</p>
          </div>
          <div>
            <AnimatedCounter
              target={5300}
              className="text-white text-3xl font-semibold"
            />
            <p className="text-white">Happy Customers</p>
          </div>
          <div>
            <AnimatedCounter
              target={23}
              includePlusIcon={false}
              className="text-white text-3xl font-semibold"
            />
            <p className="text-white">Awards</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Agent with me ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Featured Properties (Dynamic) */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link href="/properties">
              <Button variant="outline">View All Properties</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {data.length > 0 ? (
              data.map((property) => (
                <FeaturedPropertyCard
                  key={property.id}
                  property={property}
                  favorites={[]}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">
                Loading properties...
              </p>
            )}
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
            Join Agent with me today and start your property journey
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
                <svg
                  width="45.396"
                  height="60"
                  viewBox="0 0 45.396 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8"
                >
                  <g>
                    <path
                      d="M0 0L17.9781 5.93773L18.3963 60L0 53.9894L0 0Z"
                      fill="#FFFFFF"
                      fillRule="evenodd"
                      transform="translate(27 0)"
                    />
                    <path
                      d="M0 5.80534L12.975 0L12.975 53.9767L0 59L0 5.80534Z"
                      fill="#C0C0C0"
                      fillRule="evenodd"
                      transform="translate(14.35 0)"
                    />
                    <path
                      d="M0 0L14.7218 4.49413L15.0642 45.4126L0 40.8633L0 0Z"
                      fill="#FFFFFF"
                      fillRule="evenodd"
                      transform="translate(9.181 7.587)"
                    />
                    <path
                      d="M0 4.32941L9.23646 0L9.23645 40.6186L0 44L0 4.32941Z"
                      fill="#C0C0C0"
                      fillRule="evenodd"
                      transform="translate(0 7.587)"
                    />
                  </g>
                </svg>
                <span className="text-xl font-bold">Agent with me</span>
              </div>
              <p className="text-gray-400">
                Simplifying the way you find your next home, securely and
                confidently.
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
                    Sign Up
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
            <p>&copy; 2025 Agent with me. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
