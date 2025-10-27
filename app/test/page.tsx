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
  return <div></div>;
};
export default Header;
