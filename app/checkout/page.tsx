import { requireUser } from "@/lib/auth";
import { CheckoutView } from "./checkout-view";

export const metadata = { title: "Checkout — BlackNexus" };

export default async function CheckoutPage() {
  // Exige login antes de pagar.
  await requireUser("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Pagamento via Pix</h1>
      <CheckoutView />
    </div>
  );
}
