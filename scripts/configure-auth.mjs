import { spawnSync } from "node:child_process";
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
const deployment = process.argv[2] ?? "prod";
const targetArgs = ["--deployment", deployment];
const cli = new URL("../node_modules/convex/bin/main.js", import.meta.url);
const run = (args, input) => {
  const r = spawnSync(
    process.execPath,
    [cli.pathname.replace(/^\/(\w:)/, "$1"), ...args, ...targetArgs],
    { input, encoding: "utf8", windowsHide: true },
  );
  if (r.status !== 0)
    throw new Error(
      "Convex configuration command failed. Check deployment access.",
    );
  return r.stdout;
};
const names = run(["env", "list", "--names-only"]);
const hasPrivate = /\bJWT_PRIVATE_KEY\b/.test(names),
  hasPublic = /\bJWKS\b/.test(names);
if (hasPrivate !== hasPublic)
  throw new Error(
    "Signing-key configuration is incomplete. Existing keys were left unchanged.",
  );
if (!hasPrivate) {
  const keys = await generateKeyPair("RS256", { extractable: true });
  const privateKey = await exportPKCS8(keys.privateKey);
  const publicKey = await exportJWK(keys.publicKey);
  run(
    ["env", "set", "JWT_PRIVATE_KEY"],
    privateKey.trimEnd().replace(/\n/g, " "),
  );
  run(
    ["env", "set", "JWKS"],
    JSON.stringify({ keys: [{ use: "sig", ...publicKey }] }),
  );
  console.log(
    "Configured authentication signing keys for the selected deployment.",
  );
} else console.log("Existing authentication signing keys preserved.");
