import Image from "next/image";
import { AmbassadorList } from "@/components/AmbassadorList";
import { AddAmbassadorForm } from "@/components/AddAmbassadorForm";

export default function Home() {
  return (
    <div>
      <AddAmbassadorForm />
      {/* <AmbassadorList /> */}
    </div>
  );
}
