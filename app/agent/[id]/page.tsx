import { Metadata } from "next";
import Req from "@/app/utility/axios";
import { getDisplayName } from "@/lib/utils";
import AgentProfileClient from "./AgentProfileClient";

const { app, base } = Req;

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

async function getAgent(agentId: string): Promise<Agent | null> {
  try {
    const res = await app.get(`${base}/v1/user/${agentId}`);
    return res.data.data || null;
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
  }
}

async function getAgentProperties(agentId: string): Promise<Property[]> {
  try {
    const res = await app.get(`${base}/v1/house?agentId=${agentId}&limit=20`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching agent properties:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);
  
  if (!agent) {
    return {
      title: "Agent Not Found | Agent With Me",
    };
  }

  const name = getDisplayName(agent);
  
  return {
    title: `${name} | Agent With Me`,
    description: agent.bio || `View ${name}'s profile on Agent With Me. ${agent?.propertyCount || 0} properties available.`,
    openGraph: {
      title: `${name} - Agent Profile | Agent With Me`,
      description: agent.bio || `View ${name}'s properties and contact information on Agent With Me.`,
      images: [agent.profileImage || agent.avatar || "/og-image-placeholder.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Agent Profile | Agent With Me`,
      description: agent.bio || `View ${name}'s properties and contact information on Agent With Me.`,
      images: [agent.profileImage || agent.avatar || "/og-image-placeholder.png"],
    },
  };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);
  const properties = await getAgentProperties(id);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agent Not Found</h1>
          <p className="text-gray-600 mt-2">This agent doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return <AgentProfileClient agent={agent} properties={properties} />;
}
