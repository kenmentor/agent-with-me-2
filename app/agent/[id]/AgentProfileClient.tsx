"use client";

import { getDisplayName } from "@/lib/utils";

interface Agent {
  _id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  bio?: string;
  agencyName?: string;
  avatar?: string;
  profileImage?: string;
  adminVerified?: boolean;
  yearsOfExperience?: number;
  serviceAreas?: string[];
  specializations?: string[];
  rating?: number;
  reviewCount?: number;
}

interface Property {
  _id: string;
  title: string;
  thumbnail?: string;
  price: number;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
}

interface AgentProfileContentProps {
  id: string;
  agent: Agent;
  properties: Property[];
}

export default function AgentProfileContent({ id, agent, properties }: AgentProfileContentProps) {
  const name = getDisplayName(agent);
  const initials = agent.firstName?.[0]?.toUpperCase() || agent.userName?.[0]?.toUpperCase() || "?";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                {agent.profileImage || agent.avatar ? (
                  <img
                    src={agent.profileImage || agent.avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold">{initials}</span>
                )}
              </div>
              {agent.adminVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5" title="Verified Agent">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold">{name}</h1>
              </div>
              
              {agent.agencyName && (
                <p className="text-blue-200 mt-1">{agent.agencyName}</p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                {agent.yearsOfExperience && (
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {agent.yearsOfExperience} years experience
                  </span>
                )}
                <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                  {properties.length} properties
                </span>
                {agent.rating && (
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <span>★</span> {agent.rating.toFixed(1)} ({agent.reviewCount || 0} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-col gap-2">
              {agent.phoneNumber && (
                <a
                  href={`tel:${agent.phoneNumber}`}
                  className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                >
                  Call Agent
                </a>
              )}
              <a
                  href={`/chat/${agent._id}`}
                className="border border-white/30 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                Message
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {agent.bio && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{agent.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations && agent.specializations.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map((spec, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {agent.serviceAreas && agent.serviceAreas.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Service Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.serviceAreas.map((area, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Properties */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Properties ({properties.length})
              </h2>
              
              {properties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No properties listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.map((property) => (
                    <a
                      key={property._id}
                      href={`/properties/${property._id}`}
                      className="group block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative bg-gray-100">
                        {property.thumbnail ? (
                          <img
                            src={property.thumbnail}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{property.location}</p>
                        <p className="font-bold text-blue-600 mt-1">
                          ₦{property.price.toLocaleString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {agent.phoneNumber && (
                  <a href={`tel:${agent.phoneNumber}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {agent.phoneNumber}
                  </a>
                )}
                <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {agent.email}
                </a>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Share Profile</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
