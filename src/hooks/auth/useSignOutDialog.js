import { useEffect, useRef, useState } from "react";

export default function useSignOutDialog({ onCancel, onConfirm }) {
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
  const cancel = () => {
    if (!pendingRef.current) onCancel();
  };
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
  return { dialogRef, pending, failed, cancel, confirm };
}
