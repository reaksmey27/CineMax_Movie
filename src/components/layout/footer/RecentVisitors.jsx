import { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

function Avatar({ photoURL }) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);
  return (
    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-[var(--color-bg)] bg-purple-500/15 text-purple-400">
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
        <UserIcon aria-label={t("Visitor")} className="h-5 w-5" />
      )}
    </span>
  );
}

export default function RecentVisitors() {
  const { user } = useAuth();
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
    if (!user?.uid) return;
    let active = true;
    import("../../../firebase/publicVisitors")
      .then((storage) => {
        if (active) return storage.touchPublicVisitor(user.uid);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.uid]);
  if (!visitors.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">{t("Recent visitors")}</p>
      <ul
        aria-label={t("Recent visitors")}
        className="flex justify-center -space-x-1 md:justify-start"
      >
        {visitors.map((visitor) => (
          <li key={visitor.id}>
            <Avatar key={visitor.photoURL} photoURL={visitor.photoURL} />
          </li>
        ))}
      </ul>
    </div>
  );
}
