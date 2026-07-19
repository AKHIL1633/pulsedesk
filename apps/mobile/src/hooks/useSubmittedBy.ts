import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "pulsedesk:submittedBy";

/**
 * Persists the "submitted by" name/email locally so the submitter doesn't
 * retype it every time, and so "My Tickets" can filter without an auth
 * system (the app has no login — this identifier is entirely self-reported).
 */
export function useSubmittedBy() {
  const [submittedBy, setSubmittedByState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setSubmittedByState(value);
      setIsLoaded(true);
    });
  }, []);

  const setSubmittedBy = useCallback((value: string) => {
    setSubmittedByState(value);
    AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  return { submittedBy, setSubmittedBy, isLoaded };
}
