import { type NextRequest } from "next/server";

const upstreamBaseUrl =
  process.env.API_UPSTREAM_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://opengym-api.azurewebsites.net";

type ForwardedMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

function buildUpstreamUrl(path: string[], request: NextRequest) {
  const sanitizedBase = upstreamBaseUrl.replace(/\/$/, "");
  const sanitizedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const query = request.nextUrl.search;
  return `${sanitizedBase}/${sanitizedPath}${query}`;
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  return headers;
}

async function forwardRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: ForwardedMethod,
) {
  if (!upstreamBaseUrl.startsWith("http")) {
    return Response.json({ error: "API upstream URL is invalid" }, { status: 500 });
  }

  const { path } = await context.params;
  const url = buildUpstreamUrl(path, request);
  const headers = buildForwardHeaders(request);
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const response = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(request, context, "POST");
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(request, context, "PUT");
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(request, context, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context, "DELETE");
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(request, context, "HEAD");
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context, "OPTIONS");
}
