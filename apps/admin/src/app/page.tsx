"use client"

import Image from "next/image";
import { AmbassadorList } from "@/components/AmbassadorList";
import { AddAmbassadorForm } from "@/components/AddAmbassadorForm";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Ambassador Management</h1>
      <AddAmbassadorForm onAdded={() => setRefreshKey((k) => k + 1)} />
      <AmbassadorList refreshKey={refreshKey} />
    </div>
  );
}
