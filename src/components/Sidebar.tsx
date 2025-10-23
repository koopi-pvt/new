"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingCart, Package, Users, BarChart, Settings, LogOut, ChevronDown, Globe, Star, Bell, X, Tags, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/promotions", label: "Promotions", icon: Tags },
  { href: "/dashboard/marketing-studio", label: "Marketing Studio", icon: Wand2 },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, showBadge: true },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isProUser = userProfile?.subscription?.plan === 'pro';

  // Listen for unread notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    if (user.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserName = () => {
    if (!user) return 'User';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    if (!user || !user.email) return '';
    return user.email;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed md:fixed top-0 left-0 ${isCollapsed ? 'w-20' : 'w-72 md:w-64'} h-screen bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-2xl text-gray-800 flex flex-col border-r border-white/30 shadow-2xl z-40 transform transition-all duration-300 ease-out md:translate-x-0 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-5 md:hidden border-b border-gray-200/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Koopi</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Desktop Brand */}
        <div className="hidden md:flex items-center justify-center p-5 border-b border-gray-200/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900">Koopi</h1>
                <p className="text-xs text-gray-600">E-Commerce Platform</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
              }`}
              title={isCollapsed ? link.label : ''}
            >
              <link.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} strokeWidth={2} />
              {!isCollapsed && (
                <span className="flex-1 flex items-center gap-2">
                  {link.label}
                </span>
              )}
              {!isCollapsed && link.showBadge && unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 animate-bounce">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {isCollapsed && link.showBadge && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Subscription */}
      <div className="px-3 pb-3 space-y-1 border-t border-gray-200/50 pt-3">
       <Link
         href="/dashboard/subscription"
         onClick={() => setIsOpen(false)}
         className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
           pathname === '/dashboard/subscription'
             ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30"
             : "text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 hover:text-amber-600"
         }`}
         title={isCollapsed ? "Subscription" : ''}
       >
         <Star className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-transform group-hover:scale-110 ${pathname === '/dashboard/subscription' ? 'animate-pulse' : ''}`} strokeWidth={2} />
         {!isCollapsed && 'Subscription'}
       </Link>
       <Link
         href="/dashboard/settings"
         onClick={() => setIsOpen(false)}
         className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
           pathname === '/dashboard/settings'
             ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
             : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
         }`}
         title={isCollapsed ? "Settings" : ''}
       >
         <Settings className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-transform group-hover:scale-110 group-hover:rotate-90 ${pathname === '/dashboard/settings' ? 'animate-spin' : ''}`} strokeWidth={2} />
         {!isCollapsed && 'Settings'}
       </Link>

       {/* Collapse/Expand Button - Desktop Only */}
       <button
         onClick={() => setIsCollapsed(!isCollapsed)}
         className="hidden md:flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
         title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
       >
         {isCollapsed ? (
           <ChevronRight className="w-5 h-5 transition-transform" strokeWidth={2} />
         ) : (
           <>
             <ChevronLeft className="w-5 h-5 mr-3 transition-transform" strokeWidth={2} />
             <span className="flex-1 text-left">Collapse</span>
           </>
         )}
       </button>
     </div>

      {/* User Profile Section at Bottom */}
      <div className="p-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown Menu */}
          {isDropdownOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50 animate-slideUp">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {getUserName()}
                </p>
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {getUserEmail()}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                <span>Log out</span>
              </button>
            </div>
          )}

          {/* Profile Button */}
          <button
            onClick={() => !isCollapsed && setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isDropdownOpen ? 'bg-white/90 shadow-lg scale-[0.98]' : 'hover:bg-white/70 hover:shadow-md'
            }`}
            title={isCollapsed ? getUserName() : ''}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
              {getUserInitial()}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-gray-600 truncate">View profile</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
