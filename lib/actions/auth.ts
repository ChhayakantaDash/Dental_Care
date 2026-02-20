"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession, getSession } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      password: hashedPassword,
      role: "PATIENT",
    },
  });

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await setSession(sessionUser);
  redirect("/patient");
}

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return { error: "Invalid email or password" };
  }
  if (!user.isActive) {
    return { error: "Account has been disabled" };
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.password);
  if (!validPassword) {
    return { error: "Invalid email or password" };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await setSession(sessionUser);

  switch (user.role) {
    case "ADMIN":
      redirect("/admin");
    case "DOCTOR":
      redirect("/doctor");
    default:
      redirect("/patient");
  }
}

export async function logoutAction() {
  await clearSession();
  return { success: true };
}

export async function getCurrentUser() {
  return getSession();
}
