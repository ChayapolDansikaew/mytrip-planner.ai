"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [isStoringUser, setIsStoringUser] = useState(false);
  const lastSyncedUserId = useRef<string | null>(null);

  const clerkId = user?.id;
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "";
  const name = user?.fullName ?? user?.username ?? primaryEmail;
  const imageUrl = user?.imageUrl;

  useEffect(() => {
    if (!isLoaded) return;

    let isCurrent = true;

    if (!isSignedIn || !clerkId) {
      lastSyncedUserId.current = null;
      queueMicrotask(() => {
        if (isCurrent) {
          setConvexUserId(null);
          setIsStoringUser(false);
        }
      });
      return () => {
        isCurrent = false;
      };
    }

    if (!primaryEmail || lastSyncedUserId.current === clerkId) {
      return;
    }

    lastSyncedUserId.current = clerkId;
    queueMicrotask(() => {
      if (isCurrent) {
        setIsStoringUser(true);
      }
    });

    createOrUpdateUser({
      clerkId,
      name: name || primaryEmail,
      email: primaryEmail,
      imageUrl: imageUrl || undefined,
    })
      .then((storedUserId) => {
        if (isCurrent) {
          setConvexUserId(storedUserId);
        }
      })
      .catch((error: unknown) => {
        lastSyncedUserId.current = null;
        console.error("Failed to sync Clerk user to Convex", error);
      })
      .finally(() => {
        if (isCurrent) {
          setIsStoringUser(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [clerkId, createOrUpdateUser, imageUrl, isLoaded, isSignedIn, name, primaryEmail]);

  return {
    convexUserId,
    isLoading: !isLoaded || isStoringUser,
  };
}
