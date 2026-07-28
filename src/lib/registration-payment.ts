import "server-only";

import { prisma } from "@/lib/prisma";
import { scooterRegistrationPaymentUrlSchema } from "@/lib/registration";

export async function getRegistrationPaymentUrl(): Promise<string | null> {
  try {
    const settings = await prisma.scooterRegistrationSettings.findUnique({
      where: { id: "default" },
      select: { stripePaymentUrl: true },
    });
    const parsed = scooterRegistrationPaymentUrlSchema.safeParse(
      settings?.stripePaymentUrl ?? ""
    );

    return parsed.success && parsed.data ? parsed.data : null;
  } catch (error) {
    console.error(
      "[matriculaciones] error al leer el enlace de pago:",
      error instanceof Error ? error.name : "UnknownError"
    );
    return null;
  }
}
