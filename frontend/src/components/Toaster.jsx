import { ToastProvider, ToastViewport, Toast } from "@/components/ui/toast";
import { useToastStore } from "@/hooks/useToast";

/**
 * Drop <Toaster /> once anywhere in your app (inside App.jsx).
 * It renders all active toasts and auto-dismisses them after 4 s.
 */
export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <ToastProvider duration={4000} swipeDirection="right">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onOpenChange={(open) => {
            if (!open) removeToast(t.id);
          }}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
