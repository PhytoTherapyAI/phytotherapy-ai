// © 2026 DoctoPal — All Rights Reserved
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Camera, Smartphone } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import {
  type PermissionType,
  dismissPermission,
  requestNotificationPermission,
  requestLocationPermission,
  requestCameraPermission,
  isIOSWithoutPWA,
} from "@/lib/permission-state";

interface Props {
  type: PermissionType;
  open: boolean;
  onGranted: () => void;
  onDismissed: () => void;
}

const CONFIG: Record<PermissionType, { icon: typeof Bell; titleKey: string; descKey: string; primaryKey: string; secondaryKey: string }> = {
  notification: {
    icon: Bell,
    titleKey: "perm.notifTitle",
    descKey: "perm.notifDesc",
    primaryKey: "perm.notifAllow",
    secondaryKey: "perm.notifDismiss",
  },
  location: {
    icon: MapPin,
    titleKey: "perm.locationTitle",
    descKey: "perm.locationDesc",
    primaryKey: "perm.locationAllow",
    secondaryKey: "perm.locationManual",
  },
  camera: {
    icon: Camera,
    titleKey: "perm.cameraTitle",
    descKey: "perm.cameraDesc",
    primaryKey: "perm.cameraAllow",
    secondaryKey: "perm.cameraGallery",
  },
};

export function PermissionBottomSheet({ type, open, onGranted, onDismissed }: Props) {
  const { lang } = useLang();
  const config = CONFIG[type];
  const Icon = config.icon;

  // iOS notification fallback
  const showIOSFallback = type === "notification" && isIOSWithoutPWA();

  const handlePrimary = async () => {
    if (showIOSFallback) {
      onDismissed();
      return;
    }

    let result = "denied";
    if (type === "notification") {
      result = await requestNotificationPermission();
    } else if (type === "location") {
      result = await requestLocationPermission();
    } else if (type === "camera") {
      result = await requestCameraPermission();
    }

    if (result === "granted") {
      onGranted();
    } else {
      onDismissed();
    }
  };

  const handleSecondary = () => {
    dismissPermission(type);
    onDismissed();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            onClick={handleSecondary}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl safe-area-pb"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

            {showIOSFallback ? (
              /* iOS PWA fallback */
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
                  <Smartphone className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold">{tx("perm.iosPwaTitle", lang)}</h3>
                <p className="text-sm text-muted-foreground">{tx("perm.iosPwaDesc", lang)}</p>
                <Button onClick={handleSecondary} variant="outline" className="w-full">
                  {tx("perm.iosPwaGotIt", lang)}
                </Button>
              </div>
            ) : (
              /* Standard permission request */
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{tx(config.titleKey, lang)}</h3>
                <p className="text-sm text-muted-foreground">{tx(config.descKey, lang)}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handlePrimary} className="w-full bg-primary hover:bg-primary/90">
                    {tx(config.primaryKey, lang)}
                  </Button>
                  <Button onClick={handleSecondary} variant="ghost" className="w-full text-muted-foreground">
                    {tx(config.secondaryKey, lang)}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
