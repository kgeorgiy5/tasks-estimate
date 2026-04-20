const { performance } = require("perf_hooks");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ITERATIONS = Number(process.env.ITERATIONS || 20);
const CONCURRENCY = Number(process.env.CONCURRENCY || 5);
let AUTH_TOKEN = process.env.AUTH_TOKEN;

const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function obtainTokenInteractively() {
  const email = await ask("Auth email: ");
  const password = await ask("Auth password: ");

  const res = await fetch(`${BASE_URL}/users/auth/sign-in`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`auth failed: ${res.status}`);
  }

  const body = await res.json();
  // support both { access_token: '...' } and { access_token: '...' } or { token: '...' }
  const token = body.access_token || body.token || body?.accessToken;
  if (!token) throw new Error("auth response did not contain token");
  AUTH_TOKEN = token;
  return token;
}

function authHeaders() {
  const h = { "content-type": "application/json" };
  if (AUTH_TOKEN) h.authorization = `Bearer ${AUTH_TOKEN}`;
  return h;
}

async function createProject(i) {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title: `perf-project-${Date.now()}-${i}` }),
  });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`createProject failed: ${res.status}`);
  const body = await res.json();
  return { id: body._id || body.id || body._doc?._id, duration };
}

async function createWorkflow(projectId) {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/projects/workflows`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      projectId,
      domain: "perf",
      title: `wf-${Date.now()}`,
      description: "perf test",
      categories: [],
    }),
  });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`createWorkflow failed: ${res.status}`);
  const body = await res.json();
  return { id: body._id || body.id || body._doc?._id, duration };
}

async function runOne(i) {
  const start = performance.now();
  const p = await createProject(i);
  const w = await createWorkflow(p.id);
  const total = performance.now() - start;
  return { projectMs: p.duration, workflowMs: w.duration, totalMs: total };
}

// Listing scenario helpers
async function listTasks(limit) {
  const start = performance.now();
  const url = new URL(`${BASE_URL}/tasks`);
  if (limit) url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`listTasks failed: ${res.status}`);
  const body = await res.json();
  return { body, duration };
}

async function listProjects() {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}/projects`, { headers: authHeaders() });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`listProjects failed: ${res.status}`);
  const body = await res.json();
  return { body, duration };
}

async function listWorkflows(projectId) {
  const start = performance.now();
  const url = new URL(`${BASE_URL}/projects/workflows`);
  if (projectId) url.searchParams.set("projectId", String(projectId));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`listWorkflows failed: ${res.status}`);
  const body = await res.json();
  return { body, duration };
}

async function listMarketplace(domain) {
  const start = performance.now();
  const url = new URL(`${BASE_URL}/projects/workflows/marketplace`);
  if (domain) url.searchParams.set("domain", domain);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`listMarketplace failed: ${res.status}`);
  const body = await res.json();
  return { body, duration };
}

async function runListingOne(i, maxLimit, domain) {
  // Ensure we have projects to query against
  const projectsRes = await listProjects();
  const projectId = projectsRes.body?.[0]?._id || projectsRes.body?.[0]?.id;

  const t1 = await listTasks(maxLimit);
  const t2 = await listWorkflows(projectId);
  const t3 = await listMarketplace(domain);

  return {
    tasksMs: t1.duration,
    workflowsMs: t2.duration,
    marketplaceMs: t3.duration,
  };
}

async function run() {
  console.log(
    `BASE_URL=${BASE_URL} ITERATIONS=${ITERATIONS} CONCURRENCY=${CONCURRENCY}`,
  );

  if (!AUTH_TOKEN) {
    try {
      await obtainTokenInteractively();
      console.log("Obtained auth token via sign-in.");
    } catch (err) {
      console.error("Failed to obtain auth token:", String(err));
      process.exit(1);
    }
  }

  const scenario = process.env.SCENARIO || "listing";
  const maxLimit = process.env.MAX_LIMIT
    ? Number(process.env.MAX_LIMIT)
    : undefined;
  const domain = process.env.DOMAIN || undefined;
  const results = [];

  const queue = Array.from({ length: ITERATIONS }, (_, i) => i);

  async function worker() {
    while (queue.length) {
      const i = queue.shift();
      try {
        let r;
        if (scenario === "listing") {
          r = await runListingOne(i, maxLimit, domain);
        } else {
          r = await runOne(i);
        }
        results.push(r);
        process.stdout.write(".");
      } catch (err) {
        results.push({ error: String(err) });
        process.stdout.write("E");
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, () =>
    worker(),
  );
  await Promise.all(workers);

  console.log("\nRun finished. Computing stats...");

  const succ = results.filter((r) => !r.error);
  const errors = results.filter((r) => r.error);

  function stats(arr, key) {
    const values = arr.map((r) => r[key]).sort((a, b) => a - b);
    const sum = values.reduce((s, v) => s + v, 0);
    const avg = values.length ? sum / values.length : 0;
    const p95 = values.length
      ? values[Math.floor(values.length * 0.95) - 1] ||
        values[values.length - 1]
      : 0;
    return {
      count: values.length,
      avg,
      min: values[0] || 0,
      max: values[values.length - 1] || 0,
      p95,
    };
  }

  console.log(`success: ${succ.length}, errors: ${errors.length}`);
  if (succ.length) {
    if (scenario === "listing") {
      console.log("List tasks:", stats(succ, "tasksMs"));
      console.log("List workflows:", stats(succ, "workflowsMs"));
      console.log("List marketplace:", stats(succ, "marketplaceMs"));
    } else {
      console.log("Project create:", stats(succ, "projectMs"));
      console.log("Workflow create:", stats(succ, "workflowMs"));
      console.log("Total per iteration:", stats(succ, "totalMs"));
    }
  }
  if (errors.length) {
    console.log("Sample errors:", errors.slice(0, 5));
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
