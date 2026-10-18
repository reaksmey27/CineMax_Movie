import { useState } from "react";
import { FaCoffee } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import DonationModal from "./DonationModal";

const DonationButton = () => {
  const { t } = useLanguage();
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDonationOpen(true)}
        className="fixed bottom-[4.75rem] right-5 z-[120] inline-flex min-h-12 items-center gap-2.5 rounded-full border border-amber-200/70 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-4 text-slate-950 shadow-[0_8px_28px_rgba(245,158,11,0.4)] ring-1 ring-amber-100/50 transition-all duration-300 hover:-translate-y-1 hover:from-amber-200 hover:to-orange-300 hover:shadow-[0_10px_32px_rgba(245,158,11,0.55)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:bottom-[5.5rem] sm:right-6"
        aria-label={t("Buy me a coffee")}
        title={t("Buy me a coffee")}
      >
        <FaCoffee className="h-5 w-5" aria-hidden="true" />
      </button>
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </>
  );
};

export default DonationButton;
