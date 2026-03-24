import { useCallback } from "react";
import { useCustomerAuth, type Address } from "./CustomerAuthContext";
import { customerApiFetch } from "./customerClient";

export function useCustomerApi() {
  const { token, refreshProfile } = useCustomerAuth();

  const call = useCallback(
    (action: string, params: Record<string, unknown> = {}) =>
      customerApiFetch(action, params, token),
    [token]
  );

  return {
    // Orders
    getOrders: () => call("get_orders"),
    getOrder: (orderId: string) => call("get_order", { order_id: orderId }),

    // Addresses
    getAddresses: () => call("get_addresses"),
    addAddress: (address: Omit<Address, "id">) => call("add_address", { address }),
    updateAddress: (addressId: string, address: Partial<Address>) =>
      call("update_address", { address_id: addressId, address }),
    deleteAddress: (addressId: string) => call("delete_address", { address_id: addressId }),

    // Password
    changePassword: (currentPassword: string, newPassword: string) =>
      call("change_password", { current_password: currentPassword, new_password: newPassword }),
    requestPasswordReset: (email: string) =>
      customerApiFetch("request_password_reset", { email }),
    resetPassword: (email: string, resetToken: string, newPassword: string) =>
      customerApiFetch("reset_password", { email, reset_token: resetToken, new_password: newPassword }),

    // Wishlist
    getWishlist: () => call("wishlist_get"),
    addToWishlist: (productId: string) => call("wishlist_add", { product_id: productId }),
    removeFromWishlist: (productId: string) => call("wishlist_remove", { product_id: productId }),

    refreshProfile,
  };
}
