import { Suspense } from "react";
import { CreateListingForm } from "@/components/listings/CreateListingForm";

export default function NewListingPage() {
  return (
    <section className="page-shell flex flex-1 flex-col py-12">
      <Suspense fallback={<p className="muted-text text-sm">Loading listing form...</p>}>
        <CreateListingForm />
      </Suspense>
    </section>
  );
}
