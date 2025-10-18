"use client";

import { Button } from "@/components/ui/button";
import { Share2, Facebook, Factory } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Req from "@/app/utility/axois";
import { use, useEffect, useState } from "react";
import { set } from "date-fns";
import { Console } from "console";
interface data {
  title?: string;
  description?: string;
  thumbnail?: string;
}

export default function SharePage() {
  const { id } = useParams();
  const { base, app } = Req;
  const [property, setProperty] = useState<data>();

  const shareUrl = `https://agent-with-me-v2.vercel.app/properties/${id}`;

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        property?.title + "\n" + shareUrl
      )}`,
      "_blank"
    );
  };
  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await app.get(`${base}/v1/house/detail/${id}`);
        setProperty(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProperty();
  }, []);

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full text-center">
        <img
          src={property?.thumbnail || "/default-property?.jpg"}
          alt={property?.title}
          className="rounded-xl w-full h-80 object-cover shadow-lg mb-6"
        />
        <h1 className="text-4xl font-bold mb-4">{property?.title}</h1>
        <p className="text-lg text-gray-700 mb-8">{property?.description}</p>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={shareWhatsApp}
            className="flex items-center gap-2"
            variant="default"
          >
            <Factory /> Share on WhatsApp
          </Button>
          <Button
            onClick={shareFacebook}
            className="flex items-center gap-2"
            variant="default"
          >
            <Facebook /> Share on Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
