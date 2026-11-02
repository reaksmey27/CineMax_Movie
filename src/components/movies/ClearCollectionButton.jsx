import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import useConfirmationDialog from "../../hooks/useConfirmationDialog";

function ClearDialog({ userId, collection, ids, onCancel }) {
  const { t } = useLanguage();
  const { dialogRef, pending, failed, cancel, confirm } = useConfirmationDialog(
    {
      onCancel,
      onConfirm: async () => {
        const [{ db }, { clearSavedMovies }] = await Promise.all([
          import("../../firebase/firestore"),
          import("../../firebase/clearSavedMovies"),
        ]);
        await clearSavedMovies(db, userId, collection, ids);
        return true;
      },
    },
  );
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="clear-collection-title"
      aria-describedby="clear-collection-description"
      aria-busy={pending}
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      className="fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-(--color-border) bg-(--color-bg-elevated) p-6 text-(--color-text) shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <h2 id="clear-collection-title" className="text-xl font-bold">
        {t("Clear {collection}?", {
          collection: t(collection === "favorites" ? "Favorites" : "Watchlist"),
        })}
      </h2>
      <p
        id="clear-collection-description"
        className="mt-3 text-sm leading-6 text-(--color-text-subtle)"
      >
        {t("Remove {count} saved movies? This cannot be undone.", {
          count: ids.length,
        })}
      </p>
      {failed && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {t("Could not clear saved movies. Please try again.")}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={cancel}
          className="min-h-11 flex-1 rounded-xl border border-(--color-border) px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={confirm}
          className="min-h-11 flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {pending ? t("Clearing...") : failed ? t("Try again") : t("Remove")}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}

function Session({ userId, collection, movies }) {
  const { t } = useLanguage();
  const [ids, setIds] = useState(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setIds(movies.map((movie) => movie.id))}
        className="mb-6 min-h-11 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-red-400"
      >
        {t("Clear {collection}?", {
          collection: t(collection === "favorites" ? "Favorites" : "Watchlist"),
        })}
      </button>
      {ids && (
        <ClearDialog
          userId={userId}
          collection={collection}
          ids={ids}
          onCancel={() => setIds(null)}
        />
      )}
    </>
  );
}

export default function ClearCollectionButton(props) {
  const { user } = useAuth();
  return user && props.movies.length > 0 ? (
    <Session key={user.uid} userId={user.uid} {...props} />
  ) : null;
}
