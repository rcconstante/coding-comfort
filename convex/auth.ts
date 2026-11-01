import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        if (
          params.flow !== "signIn" ||
          typeof params.email !== "string" ||
          params.email.length > 254
        )
          throw new Error("Invalid credentials");
        return { email: params.email.trim().toLowerCase() };
      },
    }),
  ],
  session: {
    totalDurationMs: 8 * 60 * 60 * 1000,
    inactiveDurationMs: 60 * 60 * 1000,
  },
  signIn: { maxFailedAttempsPerHour: 5 },
  jwt: { durationMs: 15 * 60 * 1000 },
});
