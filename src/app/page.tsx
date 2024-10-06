"use client";
import dynamic from "next/dynamic";

const GoogleMaps = dynamic(() => import("@/components/GoogleMaps"), {
  ssr: false, // This disables SSR for the component
});

export default function Home() {
  return (
    <div>
      <GoogleMaps />
    </div>
  );
}
