import { AmazonShopRail } from "@/components/AmazonShopRail";

/** Alias home: rail Amazon ottimizzato al click. */
export function PartnerOffers({ compact = false }: { compact?: boolean }) {
  return (
    <AmazonShopRail
      limit={compact ? 6 : 6}
      title={compact ? "Shop Amazon" : "Offerte Amazon"}
    />
  );
}
