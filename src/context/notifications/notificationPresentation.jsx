import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// ─── Helpers: icon & style lookup by notification type ────────────────────────

export const getNotificationIcon = (type, small = false) => {
  const size = small ? "h-5 w-5" : "h-6 w-6";
  switch (type) {
    case "success":
      return <CheckCircleIcon className={`${size} text-emerald-400`} />;
    case "error":
      return <XCircleIcon className={`${size} text-red-400`} />;
    case "warning":
      return <ExclamationTriangleIcon className={`${size} text-amber-400`} />;
    default:
      return <InformationCircleIcon className={`${size} text-blue-400`} />;
  }
};

export const getNotificationStyles = (type) => {
  switch (type) {
    case "success":
      return "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10";
    case "error":
      return "bg-red-500/10 border-red-500/20 shadow-red-500/10";
    case "warning":
      return "bg-amber-500/10 border-amber-500/20 shadow-amber-500/10";
    default:
      return "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10";
  }
};
