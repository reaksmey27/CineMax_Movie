import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  getNotificationIcon,
  getNotificationStyles,
} from "./notificationPresentation";

// ─── NotificationToasts: transient toast stack rendered by the provider ───────

const NotificationToasts = ({ notifications, onDismiss }) => (
  <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[2000] flex flex-col gap-3 sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-sm sm:gap-4">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-2xl transition-all duration-500 transform sm:min-w-[320px] sm:gap-4 sm:px-6 sm:py-4 ${
          notification.visible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-12"
        } ${getNotificationStyles(notification.type)}`}
      >
        {notification.movie?.poster ? (
          <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
            <span className="absolute inset-0 flex items-center justify-center">
              {getNotificationIcon(notification.type, true)}
            </span>
            <img
              src={notification.movie.poster}
              alt=""
              className="relative h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
        )}
        <p className="flex-1 text-sm font-bold text-white tracking-wide">
          {notification.message}
        </p>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-500 hover:text-white transition-colors p-1"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    ))}
  </div>
);

export default NotificationToasts;
