import {
  feedbackPayloadSchema,
  feedbackTypeLabels,
  type FeedbackPayload,
} from "@repo/feedback";

const supportEmailAddress = "support@uenroll.ca";

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });
}

function createFeedbackText(payload: FeedbackPayload) {
  const replyTo = payload.email || undefined;
  const typeLabel = feedbackTypeLabels[payload.type];

  return [
    `${typeLabel} submitted from uEnroll`,
    "",
    `Submitted at: ${new Date().toISOString()}`,
    payload.pageUrl ? `Page: ${payload.pageUrl}` : null,
    payload.userAgent ? `User agent: ${payload.userAgent}` : null,
    replyTo ? `Reply to: ${replyTo}` : null,
    "",
    "Message:",
    payload.message,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

async function sendFeedbackEmail(env: Env, payload: FeedbackPayload) {
  const replyTo = payload.email || undefined;
  const typeLabel = feedbackTypeLabels[payload.type];

  await env.SUPPORT_EMAIL.send({
    from: supportEmailAddress,
    to: supportEmailAddress,
    subject: `[uEnroll] ${typeLabel}`,
    replyTo,
    text: createFeedbackText(payload),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/feedback") {
      return json({ error: "Not found" }, { status: 404 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    const payload = feedbackPayloadSchema.safeParse(body);

    if (!payload.success) {
      return json({ error: "Invalid feedback payload" }, { status: 400 });
    }

    try {
      await sendFeedbackEmail(env, payload.data);
    } catch (error) {
      console.error("Failed to send feedback email", error);

      return json({ error: "Unable to send feedback" }, { status: 500 });
    }

    return json({ success: true });
  },
} satisfies ExportedHandler<Env>;
