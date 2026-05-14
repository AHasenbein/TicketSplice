import { ListingDetail } from "@/components/listings/ListingDetail";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;

  return (
    <section className="page-shell flex flex-1 flex-col py-12">
      <ListingDetail listingId={id} />
    </section>
  );
}
