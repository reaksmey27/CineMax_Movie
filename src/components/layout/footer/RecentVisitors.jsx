import { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

function Avatar({ photoURL, guest = false }) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);
  return (
    <span
      title={t(guest ? "Guest visitor" : "Visitor")}
      className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-[var(--color-bg)] bg-purple-500/15 text-purple-400"
    >
      {photoURL && !failed ? (
        <img
          src={photoURL}
          alt={t("Visitor")}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserIcon
          role="img"
          aria-hidden={false}
          aria-label={t(guest ? "Guest visitor" : "Visitor")}
          className="h-5 w-5"
        />
      )}
    </span>
  );
}

export default function RecentVisitors() {
  const { user, loading: authLoading } = useAuth();
  const showGuest = !authLoading && !user;
  const uid = user?.uid;
  const avatar = user?.avatar;
  const photoURL = user?.photoURL;
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState([]);
  useEffect(() => {
    let active = true;
    let unsubscribe;
    import("../../../firebase/publicVisitors")
      .then((storage) => {
        if (active)
          unsubscribe = storage.subscribeVisitors(setVisitors, () =>
            setVisitors([]),
          );
      })
      .catch(() => {});
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  useEffect(() => {
    if (!uid) return;
    let active = true;
    import("../../../firebase/publicVisitors")
      .then((storage) => {
        if (active)
          return storage.publishPublicVisitor({ uid, avatar, photoURL });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [uid, avatar, photoURL]);
  if (!visitors.length && !showGuest) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">{t("Recent visitors")}</p>
      <ul
        aria-label={t("Recent visitors")}
        className="flex justify-center -space-x-1 md:justify-start"
      >
        {showGuest && (
          <li>
            <Avatar guest />
          </li>
        )}
        {visitors.slice(0, showGuest ? 5 : 6).map((visitor) => (
          <li key={visitor.id}>
            <Avatar key={visitor.photoURL} photoURL={visitor.photoURL} />
          </li>
        ))}
      </ul>
    </div>
  );
}
