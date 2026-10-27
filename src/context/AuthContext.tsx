import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Shop, StorefrontThemeId } from '../types';
import { StorageService } from '../services/storageService';
import { ApiService } from '../services/apiService';

interface AuthContextType {
  currentUser: User | null;
  currentShop: Shop | null;
  role: 'seller' | 'admin' | 'guest' | 'customer';
  isLoading: boolean;
  loginAsUser: (userId: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginWithGoogle: (googleData: { name: string; email: string; avatar?: string; idToken?: string }) => User;
  registerCustomer: (data: { name: string; email: string; phone?: string; password?: string }) => User;
  registerSeller: (data: {
    ownerName: string;
    shopName: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    city: string;
    themeId: StorefrontThemeId;
    password?: string;
  }) => { user: User; shop: Shop };
  logout: () => void;
  refreshShop: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (userId: string): User | null => {
  if (!userId || userId === 'guest') return null;
  let user = StorageService.getUserById(userId) || null;
  if (!user && (userId === 'user-admin' || userId === 'user-1')) {
    user = StorageService.getUsers().find(u => u.id === userId) || null;
  }
  return user;
};

const getInitialShop = (user: User | null): Shop | null => {
  if (!user) return null;
  const allShops = StorageService.getShops();
  let shop = user.shopId ? allShops.find(s => s.id === user.shopId) : null;
  if (!shop) {
    shop = allShops.find(s => s.ownerId === user.id) || null;
  }
  if (!shop && user.email) {
    shop = allShops.find(s => s.contactDetails?.email?.toLowerCase() === user.email.toLowerCase()) || null;
  }
  if (!shop && user.role === 'admin') {
    shop = allShops[0] || null;
  }
  return shop;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>(() => StorageService.getCurrentUserId());
  
  // Synchronous initialization prevents session drop & redirects on F5 refresh
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const uid = StorageService.getCurrentUserId();
    return getInitialUser(uid);
  });

  const [currentShop, setCurrentShop] = useState<Shop | null>(() => {
    const uid = StorageService.getCurrentUserId();
    const user = getInitialUser(uid);
    return getInitialShop(user);
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = ApiService.getAuthToken();
    const uid = StorageService.getCurrentUserId();
    const initialUser = getInitialUser(uid);
    return Boolean(token && !initialUser);
  });

  const loadUserData = () => {
    let user = StorageService.getUserById(currentUserId) || null;
    if (!user && (currentUserId === 'user-admin' || currentUserId === 'user-1')) {
      user = StorageService.getUsers().find(u => u.id === currentUserId) || null;
    }

    setCurrentUser(user);

    if (user) {
      const allShops = StorageService.getShops();

      // 1. Try finding shop by user.shopId
      let shop = user.shopId ? allShops.find(s => s.id === user.shopId) : null;

      // 2. Fallback: match by ownerId
      if (!shop) {
        shop = allShops.find(s => s.ownerId === user.id) || null;
      }

      // 3. Fallback: match by email in contactDetails
      if (!shop && user.email) {
        shop = allShops.find(s => s.contactDetails?.email?.toLowerCase() === user.email.toLowerCase()) || null;
      }

      if (shop) {
        // Auto-heal shopId on user if it was desynced
        if (user.shopId !== shop.id) {
          user.shopId = shop.id;
          StorageService.updateUser(user);
        }
        setCurrentShop(shop);
      } else if (user.role === 'admin') {
        setCurrentShop(allShops[0] || null);
      } else {
        setCurrentShop(null);
      }
    } else {
      setCurrentShop(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = ApiService.getAuthToken();
    if (token) {
      ApiService.getMe()
        .then(async res => {
          if (!isMounted) return;
          if (res?.user) {
            StorageService.addUser(res.user);
            await StorageService.syncWithDatabase().catch(() => {});
            StorageService.setCurrentUserId(res.user.id);
            setCurrentUserId(res.user.id);
            setCurrentUser(res.user);

            const allShops = StorageService.getShops();
            let shop = res.user.shopId ? allShops.find(s => s.id === res.user.shopId) : null;
            if (!shop) {
              shop = allShops.find(s => s.ownerId === res.user.id || s.contactDetails?.email?.toLowerCase() === res.user.email?.toLowerCase()) || null;
            }
            if (shop) setCurrentShop(shop);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          // Token expired or invalid
          ApiService.clearAuthToken();
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const loginAsUser = (userId: string) => {
    StorageService.setCurrentUserId(userId);
    setCurrentUserId(userId);
  };

  const logout = () => {
    // Clear JWT session and reset to guest
    ApiService.clearAuthToken();
    StorageService.setCurrentUserId('guest');
    setCurrentUserId('guest');
    setCurrentUser(null);
    setCurrentShop(null);
  };

  const loginWithEmail = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with backend MongoDB Atlas
    try {
      const res = await ApiService.loginWithEmail(cleanEmail, password);
      if (res?.success && res.user) {
        StorageService.addUser(res.user);
        await StorageService.syncWithDatabase().catch(() => {});
        loginAsUser(res.user.id);
        loadUserData();
        return { success: true, user: res.user };
      }
    } catch (apiErr: any) {
      console.warn('Backend login attempt failed:', apiErr?.message);
      if (
        apiErr?.message &&
        (apiErr.message.toLowerCase().includes('password') ||
          apiErr.message.toLowerCase().includes('suspended'))
      ) {
        return { success: false, message: apiErr.message };
      }
    }

    // 2. Fallback to local storage (e.g. offline mode or demo users)
    const users = StorageService.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.password && password && existing.password !== password) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
      loginAsUser(existing.id);
      loadUserData();
      return { success: true, user: existing };
    }
    return {
      success: false,
      message: 'Invalid credentials or no account found with this email. Please check your credentials or register.',
    };
  };

  const loginWithGoogle = (googleData: { name: string; email: string; avatar?: string; idToken?: string }): User => {
    const cleanEmail = googleData.email.trim().toLowerCase();

    // If Google ID token is provided, verify with backend and acquire JWT
    if (googleData.idToken) {
      ApiService.loginWithGoogleToken(googleData.idToken).catch(() => {});
    }

    const users = StorageService.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      if (googleData.avatar && !user.avatar) {
        user.avatar = googleData.avatar;
        StorageService.addUser(user);
      }
      loginAsUser(user.id);
      return user;
    }

    // Auto-create customer with Google account
    const newCustomer: User = {
      id: `google-${Date.now()}`,
      name: googleData.name || 'Google User',
      email: cleanEmail,
      phone: '',
      role: 'customer',
      status: 'active',
      avatar: googleData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.name)}&background=10B981&color=fff`,
      createdAt: new Date().toISOString(),
    };
    StorageService.addUser(newCustomer);
    loginAsUser(newCustomer.id);

    return newCustomer;
  };

  const registerCustomer = (data: { name: string; email: string; phone?: string; password?: string }): User => {
    const cleanEmail = data.email.trim().toLowerCase();

    // Sync to MongoDB with password hashing
    ApiService.registerUser({
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      password: data.password,
      role: 'customer',
    }).catch(() => {});

    const users = StorageService.getUsers();
    let existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      loginAsUser(existing.id);
      return existing;
    }

    const newCustomer: User = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      role: 'customer',
      status: 'active',
      password: data.password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=10B981&color=fff`,
      createdAt: new Date().toISOString(),
    };
    StorageService.addUser(newCustomer);
    loginAsUser(newCustomer.id);

    return newCustomer;
  };

  const registerSeller = (data: {
    ownerName: string;
    shopName: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    city: string;
    themeId: StorefrontThemeId;
    password?: string;
  }) => {
    // Generate slug
    const baseSlug = data.shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug || `shop-${Date.now().toString().slice(-4)}`;

    // Ensure unique slug
    let counter = 1;
    while (StorageService.getShopBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const cleanWa = data.whatsappNumber.replace(/[^0-9]/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    const now = Date.now();
    const newUserId = `user-${now}`;
    const newShopId = `shop-${now}`;

    const newShop: Shop = {
      id: newShopId,
      ownerId: newUserId,
      name: data.shopName.trim(),
      slug,
      description: `Welcome to ${data.shopName.trim()}. Handcrafted goods and products delivered across Sri Lanka.`,
      logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
      coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
      whatsappNumber: cleanWa.startsWith('94') ? cleanWa : `94${cleanWa.replace(/^0+/, '')}`,
      displayPhone: data.phone,
      contactDetails: {
        email: cleanEmail,
        address: `${data.city}, Sri Lanka`,
        city: data.city,
        deliveryCoverage: 'Islandwide',
      },
      themeId: data.themeId,
      status: 'active',
      createdAt: new Date().toISOString(),
      subscriptionPlanId: 'free',
    };

    const newUser: User = {
      id: newUserId,
      name: data.ownerName.trim(),
      email: cleanEmail,
      phone: data.phone,
      role: 'seller',
      status: 'active',
      shopId: newShopId,
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    StorageService.addUser(newUser);
    StorageService.createShop(newShop);

    // Register on backend with bcrypt password and acquire JWT session
    ApiService.registerUser({
      name: data.ownerName.trim(),
      email: cleanEmail,
      phone: data.phone,
      password: data.password,
      role: 'seller',
      shopId: newShopId,
    }).catch(() => {});

    loginAsUser(newUserId);
    setCurrentUser(newUser);
    setCurrentShop(newShop);

    return { user: newUser, shop: newShop };
  };

  const refreshShop = () => {
    loadUserData();
  };

  const role = currentUser ? currentUser.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentShop,
        role,
        isLoading,
        loginAsUser,
        loginWithEmail,
        loginWithGoogle,
        registerCustomer,
        registerSeller,
        logout,
        refreshShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
