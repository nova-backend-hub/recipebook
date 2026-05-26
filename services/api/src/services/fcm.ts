import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let fcmInitialized = false;

// Attempt to initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    fcmInitialized = true;
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } else {
    console.log("ℹ️ Firebase service account JSON not found. Operating FCM in developer Simulation Mode.");
  }
} catch (error) {
  console.warn("⚠️ Firebase Admin initialization errored. Falling back to Developer Simulation Mode:", error);
}

/**
 * Send a direct push notification to an FCM token.
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  console.log(`🔔 [FCM PUSH] Target Token: ${token.substring(0, 15)}... | Title: "${title}" | Body: "${body}"`);

  if (!fcmInitialized) {
    // Simulator Mode success
    return true;
  }

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
    });
    return true;
  } catch (error) {
    console.error("❌ Failed to send FCM push notification:", error);
    return false;
  }
}

/**
 * Broadcast a push notification to all users subscribed to a specific topic.
 */
export async function broadcastPushNotification(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  console.log(`📢 [FCM BROADCAST] Topic: "${topic}" | Title: "${title}" | Body: "${body}"`);

  if (!fcmInitialized) {
    // Simulator Mode success
    return true;
  }

  try {
    await admin.messaging().sendToTopic(topic, {
      notification: { title, body },
      data,
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to broadcast FCM push to topic "${topic}":`, error);
    return false;
  }
}
