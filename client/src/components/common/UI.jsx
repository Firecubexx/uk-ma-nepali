export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-4 border-primary-200 dark:border-primary-900 border-t-primary-500 rounded-full animate-spin`} />
  );
}

export function SpinnerPage() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
