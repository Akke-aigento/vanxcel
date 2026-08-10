import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { ALL_COUNTRY_CODES, countryFlag, countryName, localizedCountryOptions } from "@/lib/countries";

export const getCountryFlag = (code: string) => countryFlag(code);
export const getCountryName = (code: string, locale = "nl") => countryName(code, locale);

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** ISO-2 codes to offer. Defaults to the full list. */
  codes?: string[];
}

export const CountrySelect = ({ value, onChange, className, codes }: CountrySelectProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language || "nl";
  const options = localizedCountryOptions(codes?.length ? codes : ALL_COUNTRY_CODES, locale);

  if (options.length === 1) {
    const only = options[0];
    return (
      <div className={`flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ${className || ""}`}>
        <span>{only.flag}</span>
        <span>{only.name}</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {value ? `${countryFlag(value)} ${countryName(value, locale)}` : ""}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="text-muted-foreground text-xs ml-auto">{c.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelect;
