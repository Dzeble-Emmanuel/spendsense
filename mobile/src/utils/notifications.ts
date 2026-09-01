/**
 * Notification helper for SpendSense
 * Provides safe in-app alerts and notification stubs compatible with Expo Go.
 */

export async function sendLocalNotification(
  title: string,
  body: string
) {
  // In Expo Go or standard mobile environment, log and trigger in-app alert
  console.log(`[SpendSense Notification] ${title}: ${body}`);
}