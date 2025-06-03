import { db } from "@krain/db";
import { ambassadorTable, userTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";
import { AddAmbassadorForm } from "./components/AddAmbassadorForm";
import { AmbassadorList } from "./components/AmbassadorList";

export default async function Home() {
  const ambassadors = await db.query.ambassadorTable.findMany({
    with: {
      user: true,
    },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ambassador Management</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Add New Ambassador</h2>
          <AddAmbassadorForm />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Ambassador List</h2>
          <AmbassadorList ambassadors={ambassadors} />
        </section>
      </div>
    </main>
  );
} 