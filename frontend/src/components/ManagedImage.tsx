import React, { useEffect, useState } from "react";
import { Image, ImageProps } from "react-native";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";

// Relative library references survive a change of backend host during deployment.
export function ManagedImage(props: ImageProps) {
  const { user } = useAuth();
  const original =
    props.source &&
    !Array.isArray(props.source) &&
    typeof props.source !== "number"
      ? props.source.uri
      : undefined;
  const managed = original?.startsWith("/api/media/");
  const [preview, setPreview] = useState<{ key: string; uri: string } | null>(
    null,
  );
  const key = `${user?.id || "public"}:${original}`;
  useEffect(() => {
    const controller = new AbortController();
    setPreview(null);
    if (managed && user) {
      api
        .get(original!.replace(/^\/api/, "") + "/preview", {
          signal: controller.signal,
        })
        .then((r) => {
          if (!controller.signal.aborted) setPreview({ key, uri: r.data.uri });
        })
        .catch(() => {});
    }
    return () => controller.abort();
  }, [key, managed]);
  if (!managed) return <Image {...props} />;
  const uri = user
    ? preview?.key === key
      ? preview.uri
      : undefined
    : `${process.env.EXPO_PUBLIC_BACKEND_URL || ""}${original}`;
  return <Image {...props} source={uri ? { uri } : undefined} />;
}
