import { OrderConfirmation } from "@/components/shop/OrderConfirmation";
export const metadata = { title: "Confirmación del pedido", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page({ searchParams }: { searchParams: { token?: string | string[] } }) { return <OrderConfirmation token={typeof searchParams.token === "string" ? searchParams.token : ""} />; }
