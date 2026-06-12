import { z } from "zod";

/** JWT compact format: header.payload.signature */
export const jwtTokenSchema = z
  .string()
  .min(20, "Token ausente")
  .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, "Formato JWT inválido");

export const accessTokenSchema = z.object({
  accessToken: jwtTokenSchema,
});

export type AccessTokenInput = z.infer<typeof accessTokenSchema>;

/** Safe string for DB text fields — strips control chars, limits length */
export function sanitizeText(value: string, maxLength = 500): string {
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** UUID allowlist — never interpolate into raw SQL */
export const uuidSchema = z.string().uuid("Identificador inválido");

/** Safe enum validation — prevents injection via unexpected status values */
export function assertEnum<T extends string>(value: string, allowed: readonly T[]): T {
  if (!allowed.includes(value as T)) {
    throw new Error("Valor não permitido.");
  }
  return value as T;
}
