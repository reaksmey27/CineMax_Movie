import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function SignOutDialog({ onCancel, onConfirm }) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  const cancel = () => { if (!pendingRef.current) onCancel(); };
  const confirm = async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setFailed(false);
    try {
      if (await onConfirm()) onCancel();
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };
  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="sign-out-title" aria-describedby="sign-out-description" aria-busy={pending}
      onCancel={(event) => { event.preventDefault(); cancel(); }}
      onKeyDown={(event) => event.stopPropagation()}
      className="fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-(--color-border) bg-(--color-surface-1) p-6 text-(--color-text) shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      <h2 id="sign-out-title" className="text-xl font-bold">{t("Sign out?")}</h2>
      <p id="sign-out-description" className="mt-3 text-sm leading-6 text-(--color-text-subtle)">{t("Are you sure you want to sign out?")}</p>
      {failed && <p role="alert" className="mt-3 text-sm text-red-500">{t("We couldn't sign you out right now.")}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={pending} onClick={cancel} className="min-h-11 flex-1 rounded-xl border border-(--color-border) px-4 py-2 text-sm font-semibold disabled:opacity-50">{t("Cancel")}</button>
        <button type="button" disabled={pending} onClick={confirm} className="min-h-11 flex-1 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50">{pending ? t("Logging out...") : failed ? t("Try again") : t("Sign Out")}</button>
      </div>
    </dialog>, document.body,
  );
}
