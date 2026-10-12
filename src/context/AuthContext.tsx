import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  signInWithGoogle,
  logOut as fbLogOut,
  verifyOwnerAuthorization,
  CONFIGURED_OWNER_EMAIL,
} from '../config/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isOwner: boolean;
  configuredOwnerEmail: string;
  isFirebaseLive: boolean;
  loginWithGoogle: () => Promise<void>;
  simulateLoginAsOwner: () => void;
  simulateLoginAsUnauthorized: () => void;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is live, attach real auth listener
    if (isFirebaseConfigured && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          const isAuthorized = await verifyOwnerAuthorization(fbUser);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            role: isAuthorized ? 'owner' : 'none',
            isConfiguredOwner: (fbUser.email || '').toLowerCase().trim() === CONFIGURED_OWNER_EMAIL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local development session check
      const savedSession = sessionStorage.getItem('ons_admin_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setUser(parsed);
        } catch {
          sessionStorage.removeItem('ons_admin_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const fbUser = await signInWithGoogle();
        if (fbUser) {
          const isAuthorized = await verifyOwnerAuthorization(fbUser);
          const adminProfile: AdminUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            role: isAuthorized ? 'owner' : 'none',
            isConfiguredOwner: (fbUser.email || '').toLowerCase().trim() === CONFIGURED_OWNER_EMAIL,
          };
          setUser(adminProfile);
          if (!isAuthorized) {
            setAuthError(`الحساب (${fbUser.email}) غير مصرح له بالوصول لبيئة المالك. | Account (${fbUser.email}) is not authorized as the owner.`);
          }
        }
      } else {
        // Firebase credentials are not yet configured in env
        setAuthError(
          'مشروع Firebase لم يتم ربطه ببيانات اعتماد الإنتاج بعد. استخدم أزرار المحاكاة البيئية لاختبار التحقق من الهوية وصلاحيات المالك.'
        );
      }
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ أثناء تسجيل الدخول بحساب Google');
    } finally {
      setLoading(false);
    }
  };

  const simulateLoginAsOwner = () => {
    const ownerProfile: AdminUser = {
      uid: 'uid-verified-owner-100',
      email: CONFIGURED_OWNER_EMAIL,
      displayName: 'المالك المعتمد (ONS Owner)',
      role: 'owner',
      isConfiguredOwner: true,
    };
    setUser(ownerProfile);
    sessionStorage.setItem('ons_admin_session', JSON.stringify(ownerProfile));
    setAuthError(null);
  };

  const simulateLoginAsUnauthorized = () => {
    const guestProfile: AdminUser = {
      uid: 'uid-unauthorized-user-999',
      email: 'visitor.unauthorized@gmail.com',
      displayName: 'مستخدم تجريبي غير مصرح (Unauthorized)',
      role: 'none',
      isConfiguredOwner: false,
    };
    setUser(guestProfile);
    sessionStorage.setItem('ons_admin_session', JSON.stringify(guestProfile));
    setAuthError('وصول مرفوض: هذا الحساب ليس مالك النظام المعتمد. | Access Denied: This account lacks owner authorization.');
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await fbLogOut();
      }
      setUser(null);
      sessionStorage.removeItem('ons_admin_session');
      setAuthError(null);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const isOwner = Boolean(user && user.role === 'owner');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOwner,
        configuredOwnerEmail: CONFIGURED_OWNER_EMAIL,
        isFirebaseLive: isFirebaseConfigured,
        loginWithGoogle,
        simulateLoginAsOwner,
        simulateLoginAsUnauthorized,
        signOut,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
