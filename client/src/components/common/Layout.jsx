import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  FiHome, FiBriefcase, FiHeart, FiBookOpen,
  FiMessageSquare, FiUser, FiLogOut, FiSun, FiMoon, FiMenu,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from './Avatar';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import SuggestedUsers from './SuggestedUsers';

const navLinks = [
  { to: '/',       icon: FiHome,          label: 'Home',     emoji: '🏠' },
  { to: '/jobs',   icon: FiBriefcase,     label: 'Jobs',     emoji: '💼' },
  { to: '/rooms',  icon: FiHome,          label: 'Rooms',    emoji: '🛏️' },
  { to: '/dating', icon: FiHeart,         label: 'Dating',   emoji: '💘' },
  { to: '/blogs',  icon: FiBookOpen,      label: 'Blogs',    emoji: '✍️' },
  { to: '/chat',   icon: FiMessageSquare, label: 'Messages', emoji: '💬' },
  { to: '/profile',icon: FiUser,          label: 'Profile',  emoji: '👤' },
];

const WITH_RIGHT_SIDEBAR = ['/', '/jobs', '/rooms', '/blogs'];

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); onClose?.(); };

  return (
    <nav className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-primary-500 flex items-center justify-center text-xl shadow-lg">
          🇳🇵
        </div>
        <div>
          <p className="font-extrabold text-gray-900 dark:text-white leading-tight">UK ma Nepali</p>
          <p className="text-xs text-gray-400">Nepali Community UK</p>
        </div>
      </div>

      <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 mb-2 transition-all group">
        <Avatar src={user?.avatar} name={user?.name || '?'} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.location || 'United Kingdom'}</p>
        </div>
      </NavLink>

      <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

      <div className="flex-1 space-y-0.5">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="space-y-0.5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span>Settings</span>
        </NavLink>
        <button onClick={toggle} className="sidebar-link w-full">
          {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <FiLogOut size={20} /><span>Logout</span>
        </button>
      </div>

      <div className="mt-4 flex rounded-lg overflow-hidden h-1">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white dark:bg-gray-600" />
        <div className="flex-1 bg-blue-800" />
      </div>
    </nav>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showRightSidebar = WITH_RIGHT_SIDEBAR.some(
    (p) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <FiMenu size={22} />
          </button>
          <span className="lg:hidden text-xl">🇳🇵</span>
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <NotificationBell />
            <NavLink to="/profile" className="p-1">
              <Avatar src={user?.avatar} name={user?.name || '?'} size="xs" />
            </NavLink>
          </div>
        </header>

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className={`mx-auto px-4 py-5 ${showRightSidebar ? 'max-w-2xl' : 'max-w-3xl'}`}>
              <Outlet />
            </div>
          </main>

          {/* Right sidebar */}
          {showRightSidebar && (
            <aside className="hidden xl:flex flex-col w-72 shrink-0 p-4 gap-4 overflow-y-auto border-l border-gray-100 dark:border-gray-800">
              <div className="card p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">🌐 Community</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[['👥','2.4k','Members'],['🏙️','15+','Cities'],['💼','120+','Jobs'],['📰','48','Posts Today']].map(([icon,val,label]) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-xl mb-1">{icon}</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{val}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <SuggestedUsers />
              <div className="card p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">🔗 Quick Links</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['🇬🇧 UK Visa Info','https://www.gov.uk/browse/visas-immigration'],
                    ['🏥 NHS Registration','https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/'],
                    ['🎓 UKCISA Students','https://www.ukcisa.org.uk/'],
                    ['🇳🇵 Nepal Embassy UK','https://uk.nepalembassy.gov.np/'],
                  ].map(([label,href]) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                      className="block text-gray-500 hover:text-primary-500 transition-colors">{label}</a>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center pb-2">UK ma Nepali © {new Date().getFullYear()}<br/>Made with ❤️ for the community</p>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex z-40 safe-area-pb">
        {navLinks.map(({ to, emoji, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
              }`
            }>
            <span className="text-lg leading-none">{emoji}</span>
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
