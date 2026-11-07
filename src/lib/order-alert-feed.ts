import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { orderTotalCents, paidOrderStates } from "./order-display";

const PAGE_SIZE = 50;
const OVERLAP_MS = 30_000;
const isoDate = z.string().refine(value => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
});
const cursorSchema = z.object({
  v: z.literal(1),
  since: isoDate,
  until: isoDate.optional(),
  after: z.object({ paidAt: isoDate, id: z.string().min(1).max(160) }).strict().optional(),
  baseline: z.boolean().optional(),
}).strict();
type Cursor = z.infer<typeof cursorSchema>;

export type OrderAlert = {
  id: string;
  totalCents: number;
  currency: string;
  paidAt: string;
};
export type OrderAlertFeed = {
  orders: OrderAlert[];
  cursor: string;
  hasMore: boolean;
  /** Seed the client's seen IDs without ringing for existing payments. */
  baseline: boolean;
};
export class OrderAlertCursorError extends Error {
  constructor() { super("Cursor de pedidos no válido."); }
}

const encode = (value: Cursor) => Buffer.from(JSON.stringify(value)).toString("base64url");

function decode(value: string, now: Date): Cursor {
  try {
    if (value.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error();
    const cursor = cursorSchema.parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    const since = Date.parse(cursor.since);
    const until = cursor.until ? Date.parse(cursor.until) : undefined;
    if (since < Date.UTC(2020, 0, 1) || since > now.getTime() + 300_000) throw new Error();
    if ((cursor.until === undefined) !== (cursor.after === undefined)) throw new Error();
    if (cursor.baseline !== undefined && until === undefined) throw new Error();
    if (until !== undefined && (until < since || until > now.getTime() + 300_000)) throw new Error();
    if (cursor.after && (Date.parse(cursor.after.paidAt) < since || Date.parse(cursor.after.paidAt) > until!)) throw new Error();
    return cursor;
  } catch {
    throw new OrderAlertCursorError();
  }
}

/** Read-only, bounded feed. The client must deduplicate IDs between rounds.
 * A 30-second inclusive overlap catches equal timestamps and transactions that
 * started before the previous read but committed shortly afterwards. Pagination
 * keeps a fixed upper bound so baseline pages never absorb later new payments. */
export async function readOrderAlertFeed(
  db: Pick<PrismaClient, "order">,
  params: URLSearchParams,
  now = new Date(),
): Promise<OrderAlertFeed> {
  if ([...params.keys()].some(key => key !== "cursor") || params.getAll("cursor").length > 1) throw new OrderAlertCursorError();
  const rawCursor = params.get("cursor");
  const previous = rawCursor === null ? null : decode(rawCursor, now);
  const since = previous?.since ?? new Date(now.getTime() - OVERLAP_MS).toISOString();
  const until = previous?.until ?? now.toISOString();
  const baseline = previous ? previous.baseline === true : true;
  const where: Prisma.OrderWhereInput = {
    status: { in: paidOrderStates },
    paidAt: { gte: new Date(since), lte: new Date(until) },
    ...(previous?.after ? { OR: [
      { paidAt: { gt: new Date(previous.after.paidAt) } },
      { paidAt: new Date(previous.after.paidAt), id: { gt: previous.after.id } },
    ] } : {}),
  };
  const rows = await db.order.findMany({
    where,
    orderBy: [{ paidAt: "asc" }, { id: "asc" }],
    take: PAGE_SIZE + 1,
    select: { id: true, totalCents: true, total: true, currency: true, paidAt: true },
  });
  const hasMore = rows.length > PAGE_SIZE;
  const orders = rows.slice(0, PAGE_SIZE).map(row => ({
    id: row.id, totalCents: orderTotalCents(row), currency: row.currency, paidAt: row.paidAt!.toISOString(),
  }));
  const last = orders.at(-1);
  const cursor = hasMore && last
    ? encode({ v: 1, since, until, after: { paidAt: last.paidAt, id: last.id }, baseline })
    : encode({ v: 1, since: new Date(Math.max(Date.parse(since), Date.parse(until) - OVERLAP_MS)).toISOString() });
  return { orders, cursor, hasMore, baseline };
}
