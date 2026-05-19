import crypto from "node:crypto";

export function nowIso() {
  return new Date().toISOString();
}

export function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function toNumber(value: string | number | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sameEmail(a: string, b: string) {
  return normalizeEmail(a) === normalizeEmail(b);
}
