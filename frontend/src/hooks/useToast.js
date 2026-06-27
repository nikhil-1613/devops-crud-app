import { useState, useCallback } from "react";

let _dispatch = null;

/**
 * Internal store — lets toast() be called from anywhere without a hook.
 */
export function useToastStore() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register the dispatch so imperative toast() calls work
  _dispatch = addToast;

  return { toasts, removeToast };
}

/**
 * useToast — use inside React components.
 *
 * const { toast } = useToast();
 * toast.success("Saved!", "Your changes have been saved.");
 */
export function useToast() {
  const toast = {
    show:        (title, description, variant = "default") => _dispatch?.({ title, description, variant }),
    success:     (title, description) => _dispatch?.({ title, description, variant: "success" }),
    error:       (title, description) => _dispatch?.({ title, description, variant: "destructive" }),
    warning:     (title, description) => _dispatch?.({ title, description, variant: "warning" }),
    info:        (title, description) => _dispatch?.({ title, description, variant: "info" }),
  };
  return { toast };
}

/**
 * Imperative toast() — call from outside React (e.g. axios interceptors).
 */
export const toast = {
  show:        (title, description, variant = "default") => _dispatch?.({ title, description, variant }),
  success:     (title, description) => _dispatch?.({ title, description, variant: "success" }),
  error:       (title, description) => _dispatch?.({ title, description, variant: "destructive" }),
  warning:     (title, description) => _dispatch?.({ title, description, variant: "warning" }),
  info:        (title, description) => _dispatch?.({ title, description, variant: "info" }),
};
