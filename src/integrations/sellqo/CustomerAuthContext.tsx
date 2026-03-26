import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { customerApiFetch } from "./customerClient";

const TOKEN_KEY = "storefront_token_vanxcel";

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  vat_number?: string;
  vat_verified?: boolean;
  newsletter_opted_in?: boolean;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  house_number?: string;
  postal_code: string;
  city: string;
  country: string;
  is_default?: boolean;
  company?: string;
  first_name?: string;
  last_name?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string; company_name?: string; vat_number?: string; newsletter_opt_in?: boolean }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<Customer, "first_name" | "last_name" | "phone" | "company_name" | "vat_number">> & { newsletter_opt_in?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
};

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const saveToken = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await customerApiFetch("get_profile", {}, token);
      setCustomer(profile);
    } catch {
      saveToken(null);
      setCustomer(null);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      customerApiFetch("get_profile", {}, token)
        .then((profile) => setCustomer(profile))
        .catch(() => { saveToken(null); setCustomer(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const result = await customerApiFetch("login", { email, password });
    saveToken(result.token);
    setCustomer(result.customer);
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string; company_name?: string; vat_number?: string; newsletter_opt_in?: boolean }) => {
    const result = await customerApiFetch("register", data);
    saveToken(result.token);
    setCustomer(result.customer);
  };

  const logout = () => {
    saveToken(null);
    setCustomer(null);
  };

  const updateProfile = async (data: Partial<Pick<Customer, "first_name" | "last_name" | "phone" | "company_name" | "vat_number">> & { newsletter_opt_in?: boolean }) => {
    if (!token) return;
    const updated = await customerApiFetch("update_profile", data, token);
    setCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!customer,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};
