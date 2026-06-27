import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:top-4 sm:right-4 sm:max-w-[380px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const variantStyles = {
  default:     "border-border/60 bg-card text-foreground",
  success:     "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  destructive: "border-destructive/40 bg-destructive/10 text-red-300",
  warning:     "border-amber-500/30 bg-amber-500/10 text-amber-300",
  info:        "border-primary/30 bg-primary/10 text-primary",
};

const variantIcons = {
  default:     null,
  success:     CheckCircle2,
  destructive: AlertCircle,
  warning:     AlertTriangle,
  info:        Info,
};

const Toast = React.forwardRef(({ className, variant = "default", title, description, ...props }, ref) => {
  const Icon = variantIcons[variant];
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg shadow-black/20 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4 data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-0",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
        "transition-all duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="flex-1 space-y-0.5">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold leading-tight">
            {title}
          </ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="text-xs opacity-80 leading-relaxed">
            {description}
          </ToastPrimitives.Description>
        )}
      </div>
      <ToastPrimitives.Close className="shrink-0 rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100 focus:opacity-100 focus:outline-none">
        <X className="h-3.5 w-3.5" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export { ToastProvider, ToastViewport, Toast };
