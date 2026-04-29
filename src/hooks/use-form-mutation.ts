"use client";

import { useState, useCallback } from "react";

interface UseFormMutationOptions<T> {
  createFn: (data: T) => Promise<unknown>;
  updateFn: (id: string, data: T) => Promise<unknown>;
  onSuccess?: () => void;
}

export function useFormMutation<T>({
  createFn,
  updateFn,
  onSuccess,
}: UseFormMutationOptions<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submit = useCallback(
    async (data: T, id?: string) => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          await updateFn(id, data);
        } else {
          await createFn(data);
        }
        onSuccess?.();
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [createFn, updateFn, onSuccess],
  );

  return { loading, error, submit };
}
