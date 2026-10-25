const MAX_REPORT_BYTES = 10_000;

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }
  const body = await request.text();
  console.warn(
    `[csp-report] report received (${Math.min(body.length, MAX_REPORT_BYTES)} bytes)`,
  );
  return new Response(null, { status: 204 });
}
