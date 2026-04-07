// © 2026 Doctopal — All Rights Reserved

export type PermissionType = "notification" | "location" | "camera";
export type PermissionStatus = "not_asked" | "granted" | "denied" | "dismissed";

export interface PermissionState {
  notification: PermissionStatus;
  location: PermissionStatus;
  camera: PermissionStatus;
  preframe_shown: boolean;
  notification_dismissed_at?: string;
  location_dismissed_at?: string;
  camera_dismissed_at?: string;
  notification_dismiss_count?: number;
  location_dismiss_count?: number;
  camera_dismiss_count?: number;
}

const STORAGE_KEY = "doctopal_permissions";
const DISMISS_COOLDOWN_DAYS = 7;
const MAX_DISMISS_COUNT = 2;

function getDefault(): PermissionState {
  return {
    notification: "not_asked",
    location: "not_asked",
    camera: "not_asked",
    preframe_shown: false,
  };
}

export function getPermissionState(): PermissionState {
  if (typeof window === "undefined") return getDefault();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...getDefault(), ...JSON.parse(raw) } : getDefault();
  } catch {
    return getDefault();
  }
}

export function updatePermissionState(updates: Partial<PermissionState>): void {
  const current = getPermissionState();
  const next = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function shouldAskPermission(type: PermissionType): boolean {
  const state = getPermissionState();
  const status = state[type];

  if (status === "granted" || status === "denied") return false;

  if (status === "dismissed") {
    // Check max dismiss count
    const countKey = `${type}_dismiss_count` as keyof PermissionState;
    const count = (state[countKey] as number | undefined) ?? 0;
    if (count >= MAX_DISMISS_COUNT) return false;

    // Check 7-day cooldown
    const dismissedKey = `${type}_dismissed_at` as keyof PermissionState;
    const dismissedAt = state[dismissedKey] as string | undefined;
    if (!dismissedAt) return true;
    const daysSince = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= DISMISS_COOLDOWN_DAYS;
  }

  return true; // not_asked
}

export function dismissPermission(type: PermissionType): void {
  const state = getPermissionState();
  const countKey = `${type}_dismiss_count` as keyof PermissionState;
  const currentCount = (state[countKey] as number | undefined) ?? 0;

  updatePermissionState({
    [type]: "dismissed" as PermissionStatus,
    [`${type}_dismissed_at`]: new Date().toISOString(),
    [`${type}_dismiss_count`]: currentCount + 1,
  });
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    const result = await Notification.requestPermission();
    const status: PermissionStatus = result === "granted" ? "granted" : "denied";
    updatePermissionState({ notification: status });
    return status;
  } catch {
    updatePermissionState({ notification: "denied" });
    return "denied";
  }
}

export function requestLocationPermission(): Promise<PermissionStatus> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        updatePermissionState({ location: "granted" });
        resolve("granted");
      },
      () => {
        updatePermissionState({ location: "denied" });
        resolve("denied");
      },
      { timeout: 10000 }
    );
  });
}

export async function requestCameraPermission(): Promise<PermissionStatus> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop());
    updatePermissionState({ camera: "granted" });
    return "granted";
  } catch {
    updatePermissionState({ camera: "denied" });
    return "denied";
  }
}

export function isIOSWithoutPWA(): boolean {
  if (typeof window === "undefined") return false;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isIOS && !isStandalone;
}
