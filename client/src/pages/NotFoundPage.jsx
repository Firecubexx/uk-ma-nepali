import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🏔️</div>
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4">
          Page not found
        </h2>
        <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-xs mx-auto">
          Looks like this page got lost somewhere between Nepal and the UK.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          🏠 Go back home
        </Link>
      </div>
    </div>
  );
}
