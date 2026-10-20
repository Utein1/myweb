import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ledger_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

export type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
};

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-only-secret-please-change-in-production",
  );
}

export async function signSession(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT({ email: payload.email, name: payload.name ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : undefined,
    };
  } catch {
    return null;
  }
}
