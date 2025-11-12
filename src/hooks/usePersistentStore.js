import { useCallback, useEffect, useRef, useState } from "react";
import { loadStore, normalizeStoreData, saveStore, storageKey } from "@/lib/data";

function serializeStore(store) {
  try {
    return JSON.stringify(store);
  } catch {
    return "";
  }
}

export function usePersistentStore() {
  const [store, rawSetStore] = useState(() => normalizeStoreData(loadStore()));
  const lastSerializedRef = useRef(serializeStore(store));

  useEffect(() => {
    const serialized = serializeStore(store);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;
    saveStore(store);
  }, [store]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key !== storageKey) return;
      const next = normalizeStoreData(loadStore());
      const serialized = serializeStore(next);
      if (serialized === lastSerializedRef.current) return;
      lastSerializedRef.current = serialized;
      rawSetStore(next);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setStore = useCallback((updater) => {
    rawSetStore(prev => {
      const candidate = typeof updater === "function" ? updater(prev) : updater;
      const normalized = normalizeStoreData(candidate);
      if (serializeStore(normalized) === serializeStore(prev)) {
        return prev;
      }
      return normalized;
    });
  }, []);

  const replaceStore = useCallback((nextStore) => {
    const normalized = normalizeStoreData(nextStore);
    rawSetStore(prev => {
      if (serializeStore(normalized) === serializeStore(prev)) {
        return prev;
      }
      return normalized;
    });
  }, []);

  return { store, setStore, replaceStore };
}
