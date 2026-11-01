import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const input = JSON.parse(readFileSync(0, "utf8"));
if (
  typeof input.account !== "string" ||
  typeof input.password !== "string" ||
  input.password.length < 16
)
  throw new Error(
    "Provide account and temporary password (at least 16 characters) as JSON on stdin.",
  );
const deployment = input.deployment ?? "prod";
const targetArgs = ["--deployment", deployment];
const cli = new URL(
  "../node_modules/convex/bin/main.js",
  import.meta.url,
).pathname.replace(/^\/(\w:)/, "$1");
function run(args, value) {
  const r = spawnSync(process.execPath, [cli, ...args, ...targetArgs], {
    input: value,
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.status !== 0)
    throw new Error(
      "Researcher provisioning failed. Check the deployment and account state.",
    );
}
try {
  run(["env", "set", "RESEARCHER_SETUP_ACCOUNT"], input.account);
  run(["env", "set", "RESEARCHER_SETUP_PASSWORD"], input.password);
  run([
    "run",
    input.reset ? "bootstrap:resetPassword" : "bootstrap:provision",
  ]);
  console.log(
    "Researcher account provisioned; first login requires a private password.",
  );
} finally {
  run(["env", "remove", "RESEARCHER_SETUP_PASSWORD"]);
  run(["env", "remove", "RESEARCHER_SETUP_ACCOUNT"]);
}
