import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
import { getEmailFromKV } from "@/db/email-kv.ts";
import { EmailMessage } from "@/models/email.ts";
import { TelegramMessage } from "@/models/telegram.ts";
import { getTelegramFromKV } from "@/db/telegram-kv.ts";
import { emailMessageHtmlRoute} from "@/components/emails.tsx";
import { tgMessageHtmlRoute } from "@/components/telegrams.tsx";

const messageRoute = new Hono<AppBindings>();

messageRoute.post("/email", async (c) => {
  try {
    const body = await c.req.json();
    const emailClient = EmailMessage.fromRequestBody(body);

    // Handle validation errors
    if (emailClient.type === "error") {
      return c.json(
        {
          type: "error",
          message: emailClient.message,
          error: emailClient.error,
        },
        emailClient.statusCode
      );
    }

    // Send the email
    const result = await emailClient.client.send();
    if (!result.success) {
      return c.json({ 
        type: "error",
        message: result.message,
        error: result.message,
       },
       result.statusCode);
    }

    return c.json(
      {
        type: "success",
        message: result.message,
      },
      200
    );
  } catch (error) {
    c.var.logger.error(error, "Error caught while sending email");
    console.error("Error sending email:", error);

    return c.json(
      {
        type: "error",
        message: "Error sending email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.post("/tg", async (c) => {
  try {
    const body = await c.req.json();
    const messageClient = await TelegramMessage.fromRequestBody(body);
    // Handle validation errors
    if (messageClient.type === "error") {
      return c.json(
        {
          type: "error",
          message: messageClient.message,
          error: messageClient.error,
        },
        messageClient.statusCode
      );
    }
    // Send the message
    const result = await messageClient.client.send();
    if (!result.success) {
      return c.json({ 
        type: "error",
        message: result.message,
        error: result.message,
       },
       result.statusCode);
    }
    return c.json(
      {
        type: "success",
        message: result.message,
        error: result.error,
      },
      result.statusCode
    );
  } catch (error) {
    c.var.logger.error(error, "Error caught while sending Telegram message");
    console.error("Error sending Telegram message:", error);
    return c.json(
      {
        message: "Error sending Telegram message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.get("/email", async (c) => {
const { clientName, sent, subject, from } = c.req.query()
  try {
    const emails = await getEmailFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      subject: subject,
      from: from,
      type: "email",
    });
    return c.json(emails);
  } catch (error) {
    c.var.logger.error(error, "Error catched while getting emails");
    console.error("Error getting emails:", error);
    return c.json(
      {
        message: "Error getting emails",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.get("/tg", async (c) => {
const { clientName, sent } = c.req.query()
  try {
    const emails = await getTelegramFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
       type: "telegram",
    });
    return c.json(emails);
  } catch (error) {
    c.var.logger.error(error, "Error catched while getting emails");
    console.error("Error getting emails:", error);
    return c.json(
      {
        message: "Error getting emails",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.route("/email/html",emailMessageHtmlRoute)
messageRoute.route("/tg/html",tgMessageHtmlRoute)



export default messageRoute;
