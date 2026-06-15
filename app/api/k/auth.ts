import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { getSessionCookieOptions } from "../lib/cookies";
import { signSessionToken, verifySessionToken } from "./session";
import { findUserByEmail, createUser, findUserById } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) throw Errors.forbidden("Invalid authentication token.");

  const claim = await verifySessionToken(token);
  if (!claim) throw Errors.forbidden("Invalid authentication token.");

  const user = await findUserById(claim.userId); // number now
  if (!user) throw Errors.forbidden("User not found. Please re-login.");
  return user;
}

export function createLoginHandler() {
  return async (c: Context) => {
    try {
      const { email, password } = await c.req.json<{ email: string; password: string }>();
      if (!email || !password)
        return c.json({ error: "Email and password are required." }, 400);

      const user = await findUserByEmail(email);
      if (!user) return c.json({ error: "Invalid email or password." }, 401);

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return c.json({ error: "Invalid email or password." }, 401);

      const token = await signSessionToken({ userId: user.id, email: user.email });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.json({ ok: true });
    } catch (err) {
      console.error("[auth] Login failed", err);
      return c.json({ error: "Login failed." }, 500);
    }
  };
}

export function createRegisterHandler() {
  return async (c: Context) => {
    try {
      const { email, password, name } = await c.req.json<{
        email: string;
        password: string;
        name?: string;
      }>();
      if (!email || !password)
        return c.json({ error: "Email and password are required." }, 400);

      const existing = await findUserByEmail(email);
      if (existing) return c.json({ error: "Email already in use." }, 409);

      const passwordHash = await bcrypt.hash(password, 12);
      await createUser({ email, passwordHash, name: name ?? email.split("@")[0] });

      return c.json({ ok: true }, 201);
    } catch (err) {
      console.error("[auth] Register failed", err);
      return c.json({ error: "Registration failed." }, 500);
    }
  };
}