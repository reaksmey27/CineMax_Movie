/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const NotificationContext = createContext();

const readStoredNotifications = () => {
  try {
    const saved = localStorage.getItem("cinema_notifications");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredNotifications = (notifications) => {
  try {
    localStorage.setItem("cinema_notifications", JSON.stringify(notifications));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(() => readStoredNotifications());

  useEffect(() => {
    writeStoredNotifications(history);
  }, [history]);

  const unreadCount = useMemo(
    () => history.filter((notification) => !notification.read).length,
    [history],
  );

  const showNotification = useCallback((message, type = "success", movie) => {
    const id = crypto.randomUUID();
    const notificationMovie =
      movie?.id != null
        ? {
            id: movie.id,
            title: movie.title || "Movie",
            poster: movie.posterImage || movie.image || null,
          }
        : undefined;
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      ...(notificationMovie ? { movie: notificationMovie } : {}),
    };

    setNotifications((prev) => [
      ...prev,
      { ...newNotification, visible: false },
    ]);
    setHistory((prev) => [newNotification, ...prev].slice(0, 50));

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, visible: true }
            : notification,
        ),
      );
    }, 10);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, visible: false }
            : notification,
        ),
      );
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id),
        );
      }, 500);
    }, 5000);
  }, []);

  const markAllAsRead = useCallback(() => {
    setHistory((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  }, []);

  const markAsRead = useCallback((id) => {
    setHistory((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, visible: false }
          : notification,
      ),
    );
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    }, 500);
  }, []);

  const getIcon = useCallback((type, small = false) => {
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
  }, []);

  const getStyles = useCallback((type) => {
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
  }, []);

  const value = useMemo(
    () => ({
      showNotification,
      history,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearHistory,
      removeFromHistory,
      getIcon,
    }),
    [
      clearHistory,
      getIcon,
      history,
      markAsRead,
      markAllAsRead,
      removeFromHistory,
      showNotification,
      unreadCount,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[2000] flex flex-col gap-3 sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-sm sm:gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-2xl transition-all duration-500 transform sm:min-w-[320px] sm:gap-4 sm:px-6 sm:py-4 ${
              notification.visible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            } ${getStyles(notification.type)}`}
          >
            {notification.movie?.poster ? (
              <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
                <span className="absolute inset-0 flex items-center justify-center">
                  {getIcon(notification.type, true)}
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
              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            )}
            <p className="flex-1 text-sm font-bold text-white tracking-wide">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-white transition-colors p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
