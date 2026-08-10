import { useQuery } from "@tanstack/react-query";
import { checkoutAPI } from "@/integrations/sellqo/api";

export interface ShippingCountriesResult {
  codes: string[];
  unrestricted: boolean;
  defaultCountry: string | null;
  isLoading: boolean;
  /** true when the shop currently ships nowhere */
  blocked: boolean;
}

export function useShippingCountries(): ShippingCountriesResult {
  const { data, isLoading } = useQuery({
    queryKey: ["shipping-countries"],
    queryFn: () => checkoutAPI.getShippingCountries(),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = (data as any)?.data && typeof (data as any).data === "object" ? (data as any).data : data;
  const unrestricted = raw?.unrestricted === true;
  const codes: string[] = Array.isArray(raw?.countries)
    ? raw.countries.map((c: unknown) => String(c).trim().toUpperCase()).filter(Boolean)
    : [];

  return {
    codes,
    unrestricted,
    defaultCountry: raw?.default_country ? String(raw.default_country).toUpperCase() : null,
    isLoading,
    blocked: !isLoading && !unrestricted && codes.length === 0,
  };
}
