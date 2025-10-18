// import { ImageResponse } from "next/og";
// import { readFile } from "node:fs/promises";
// import { join } from "node:path";

// // Image metadata
// export const alt = "About Acme";
// export const size = {
//   width: 1200,
//   height: 630,
// };

// export const contentType = "image/png";

// // Image generation
// export default async function Image() {
//   // Font loading, process.cwd() is Next.js project directory
//   const interSemiBold = await readFile(
//     join(process.cwd(), "assets/Inter-SemiBold.ttf")
//   );

//   return new ImageResponse(
//     (
//       // ImageResponse JSX element
//       <div
//         style={{
//           fontSize: 128,
//           background: "white",
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         About Acme
//       </div>
//     ),
//     // ImageResponse options
//     {
//       // For convenience, we can re-use the exported opengraph-image
//       // size config to also set the ImageResponse's width and height.
//       ...size,
//       fonts: [
//         {
//           name: "Inter",
//           data: interSemiBold,
//           style: "normal",
//           weight: 400,
//         },
//       ],
//     }
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { Badge, Bell, Home, Plus } from "lucide-react";
import Link from "next/link";
import router, { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Agent with me
            </span>
          </Link>
          {user?.isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up Free</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />

                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {[]}
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Avatar
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  <AvatarFallback>
                    {user?.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <a href="properties/add">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  List Property
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
