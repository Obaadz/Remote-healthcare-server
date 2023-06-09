import { signalClient } from "../index.js";

export async function sendNotificationToAdmins(title, content) {
  const res = await signalClient.createNotification({
    headings: {
      en: title,
    },
    contents: { en: content },
    included_segments: ["Subscribed Users"],
  });
}
