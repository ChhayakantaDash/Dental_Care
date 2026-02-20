import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Role } from "@/app/generated/prisma/enums";

export { createToken, verifyToken } from "./jwt";
export type { SessionUser } from "./jwt";
import type { SessionUser } from "./jwt";
import { createToken, verifyToken } from "./jwt";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session-token");
}

export async function requireAuth(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (roles && !roles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isActive: true },
  });
  if (!user?.isActive) {
    throw new Error("Account disabled");
  }
  return session;
}
