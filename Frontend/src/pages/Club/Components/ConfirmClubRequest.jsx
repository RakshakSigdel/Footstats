//Imported in - src/pages/Club/clubDetails.jsx

const ConfirmClubRequest = ({ isOpen, title, message, confirmLabel = "Confirm", confirmStyle = "red", onConfirm, onCancel }) => {
  if (!isOpen) return null;
  const btnClass =
    confirmStyle === "red"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : confirmStyle === "yellow"
      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
      : "bg-slate-800 hover:bg-slate-900 text-white";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmClubRequest;