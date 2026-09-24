import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage, isNetworkError } from "../lib/axios";

interface ApiRequestState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | undefined;
  reload: () => void;
  /** Accepts a value or an updater, like React's own setState. */
  setData: (update: T | ((previous: T | undefined) => T)) => void;
}

interface Settled<T> {
  /** Which request produced this result. */
  key: string;
  data?: T;
  error?: string;
}

/**
 * Runs a request on mount (and whenever `deps` change) and exposes
 * loading / error / data for the page to render.
 *
 * Loading is derived by comparing the settled result's key with the current
 * one, so the effect never has to call setState on the way in.
 */
export const useApiRequest = <T>(
  request: () => Promise<T>,
  deps: unknown[] = [],
): ApiRequestState<T> => {
  const { t } = useTranslation();

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // Plain value, not a memo: it is cheap and must change with `deps`.
  const key = `${reloadToken}:${JSON.stringify(deps)}`;

  const [settled, setSettled] = useState<Settled<T>>();

  // Keep the newest callback without making it an effect dependency;
  // declared first so it is assigned before the fetch effect below runs.
  const requestRef = useRef(request);
  useEffect(() => {
    requestRef.current = request;
  });

  useEffect(() => {
    let cancelled = false;

    requestRef
      .current()
      .then((data) => {
        if (!cancelled) setSettled({ key, data });
      })
      .catch((requestError) => {
        if (cancelled) return;
        setSettled({
          key,
          error: isNetworkError(requestError)
            ? t("common.networkError")
            : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [key, t]);

  const isCurrent = settled?.key === key;

  return {
    data: isCurrent ? settled?.data : undefined,
    error: isCurrent ? settled?.error : undefined,
    isLoading: !isCurrent,
    reload,
    setData: useCallback(
      (update: T | ((previous: T | undefined) => T)) =>
        setSettled((previous) => {
          const current = previous?.key === key ? previous.data : undefined;
          const data =
            typeof update === "function"
              ? (update as (value: T | undefined) => T)(current)
              : update;

          return { key, data };
        }),
      [key],
    ),
  };
};

/** Debounces a value — used by the ticket search box. */
export const useDebouncedValue = <T>(value: T, delay = 350): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
