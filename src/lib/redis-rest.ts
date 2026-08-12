/** Upstash Redis REST — condiviso (poll, blog). */

function redisUrl() {
  let url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function redisToken() {
  let token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }
  return token;
}

export function isRedisConfigured() {
  return Boolean(redisUrl() && redisToken());
}

export async function redisCommand(
  command: (string | number)[],
): Promise<unknown> {
  const url = redisUrl();
  const token = redisToken();
  if (!url || !token) {
    throw new Error("Redis non configurato");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}
