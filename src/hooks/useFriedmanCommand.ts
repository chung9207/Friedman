import { useState, useCallback } from "react";
import { useOutputStore } from "../stores/outputStore";

interface CommandState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => Promise<T | null>;
}

export function useFriedmanCommand<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commandFn: (...args: any[]) => Promise<T>,
  label: string,
): CommandState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addLine = useOutputStore((s) => s.addLine);

  const execute = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      addLine("info", `Running ${label}...`);
      try {
        const result = await commandFn(...args);
        setData(result);
        addLine("success", `${label} completed.`);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        addLine("error", `${label} failed: ${msg}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [commandFn, label, addLine],
  );

  return { data, loading, error, execute };
}
