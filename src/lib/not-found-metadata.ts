import type { Metadata } from "next";
export const missingMetadata: Metadata = {
  title: { absolute: "404 · Monkey" },
  robots: { index: false, follow: true },
};
export function isNotFound(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      error.digest === "NEXT_NOT_FOUND",
  );
}
/** Next 14's metadata notFound escalates beyond a root-layout group. Let the
 * page throw the 404, with valid metadata already available for its shell. */
export async function safeMetadata(
  resolve: () => Metadata | Promise<Metadata>,
): Promise<Metadata> {
  try {
    return await resolve();
  } catch (error) {
    if (isNotFound(error)) return missingMetadata;
    throw error;
  }
}
