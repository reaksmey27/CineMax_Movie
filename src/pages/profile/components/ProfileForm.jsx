import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ProfileForm = ({
  formData,
  isDirty,
  onFieldChange,
  onCancelEditing,
  onSubmit,
}) => {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-profile-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancelEditing();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 text-[var(--color-text)] shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="edit-profile-title" className="text-xl font-bold">
          Edit profile
        </h2>
        <button
          type="button"
          onClick={onCancelEditing}
          aria-label="Close edit profile"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Username</span>
          <input
            ref={inputRef}
            name="name"
            value={formData.name}
            onChange={onFieldChange}
            required
            maxLength={80}
            autoComplete="nickname"
            className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            readOnly
            aria-describedby="profile-email-help"
            className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 text-base text-[var(--color-text-muted)]"
          />
          <span
            id="profile-email-help"
            className="block text-xs text-[var(--color-text-muted)]"
          >
            Your email is managed by your sign-in account.
          </span>
        </label>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancelEditing}
            className="min-h-11 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold hover:bg-[var(--color-surface-2)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || !formData.name.trim()}
            className="min-h-11 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
};
export default ProfileForm;
