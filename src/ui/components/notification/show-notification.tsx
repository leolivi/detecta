import ReactDOM from "react-dom/client";
import {toast, Toaster} from "sonner";

let root: ReactDOM.Root | null = null;

export function ensureToaster() {
  if (!root) {
    if (!document.body) {
      console.debug("document.body not ready, waiting...");
      setTimeout(ensureToaster, 50);
      return;
    }

    const container = document.createElement("div");
    container.id = "sonner-toast-root";
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
    root.render(<Toaster richColors expand={false} position="top-right" />);
  }
}

export function showSonnerNotification(
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) {
  ensureToaster();

  setTimeout(() => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
        toast.info(message);
        break;
      default:
        toast(message);
    }
  }, 150);
}
