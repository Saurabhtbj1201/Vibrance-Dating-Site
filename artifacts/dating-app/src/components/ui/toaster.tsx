import { Toaster as DefaultToaster } from "sonner";

export function Toaster() {
  return (
    <DefaultToaster 
      position="top-center"
      toastOptions={{
        className: "bg-card border-border text-foreground",
      }}
    />
  );
}
