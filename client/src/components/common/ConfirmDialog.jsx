import { useState, useCallback } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * useConfirm — replaces window.confirm() with a styled modal
 *
 * Usage:
 *   const { ConfirmDialog, confirm } = useConfirm();
 *   // in JSX:
 *   <ConfirmDialog />
 *   // to trigger:
 *   const ok = await confirm('Delete this post?', 'This cannot be undone.');
 *   if (ok) { ... }
 */
export function useConfirm() {
  const [state, setState] = useState({
    open: false, title: '', message: '', resolve: null,
  });

  const confirm = useCallback((title, message = '') => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleResponse = (answer) => {
    state.resolve?.(answer);
    setState({ open: false, title: '', message: '', resolve: null });
  };

  const ConfirmDialog = () => {
    if (!state.open) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleResponse(false)} />
        <div className="relative card w-full max-w-sm p-6 fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <FiAlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{state.title}</h3>
              {state.message && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{state.message}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => handleResponse(false)}
              className="btn-secondary text-sm px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmDialog };
}
