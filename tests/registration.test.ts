import assert from "node:assert/strict";
import test from "node:test";
import {
  SCOOTER_REGISTRATION_PRICE_EUR,
  scooterRegistrationFormSchema,
  scooterRegistrationPaymentUrlSchema,
} from "../src/lib/registration";

test("normaliza y valida los datos de una solicitud", () => {
  const result = scooterRegistrationFormSchema.parse({
    holderName: "  Ana García  ",
    email: " ANA@EXAMPLE.COM ",
    phone: "+34 612 345 678",
    dni: "12345678-z",
    noCertificate: false,
    privacyAccepted: true,
  });

  assert.equal(result.holderName, "Ana García");
  assert.equal(result.email, "ana@example.com");
  assert.equal(result.dni, "12345678Z");
  assert.equal(result.phone, "+34 612 345 678");
});

test("acepta NIE y rechaza documentos con letra incorrecta", () => {
  const base = {
    holderName: "Ana García",
    email: "ana@example.com",
    phone: "612345678",
    noCertificate: true,
    privacyAccepted: true,
  };

  assert.equal(
    scooterRegistrationFormSchema.safeParse({
      ...base,
      dni: "X1234567L",
    }).success,
    true
  );
  assert.equal(
    scooterRegistrationFormSchema.safeParse({
      ...base,
      dni: "12345678A",
    }).success,
    false
  );
});

test("exige consentimiento de privacidad", () => {
  const result = scooterRegistrationFormSchema.safeParse({
    holderName: "Ana García",
    email: "ana@example.com",
    phone: "612345678",
    dni: "12345678Z",
    noCertificate: true,
    privacyAccepted: false,
  });

  assert.equal(result.success, false);
});

test("solo acepta Payment Links HTTPS de Stripe o un valor vacío", () => {
  assert.equal(
    scooterRegistrationPaymentUrlSchema.safeParse(
      "https://buy.stripe.com/test_123"
    ).success,
    true
  );
  assert.equal(scooterRegistrationPaymentUrlSchema.safeParse("").success, true);
  assert.equal(
    scooterRegistrationPaymentUrlSchema.safeParse(
      "https://buy.stripe.com/"
    ).success,
    false
  );
  assert.equal(
    scooterRegistrationPaymentUrlSchema.safeParse(
      "https://buy.stripe.com.evil.example/test_123"
    ).success,
    false
  );
  assert.equal(
    scooterRegistrationPaymentUrlSchema.safeParse(
      "http://buy.stripe.com/test_123"
    ).success,
    false
  );
});

test("mantiene fijo el precio mostrado de la gestión", () => {
  assert.equal(SCOOTER_REGISTRATION_PRICE_EUR, 19.5);
});
