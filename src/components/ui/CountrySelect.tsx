import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
  { code: "BE", name: "België", flag: "🇧🇪" },
  { code: "NL", name: "Nederland", flag: "🇳🇱" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "AT", name: "Österreich", flag: "🇦🇹" },
  { code: "CH", name: "Schweiz", flag: "🇨🇭" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "DK", name: "Danmark", flag: "🇩🇰" },
  { code: "SE", name: "Sverige", flag: "🇸🇪" },
  { code: "NO", name: "Norge", flag: "🇳🇴" },
  { code: "PL", name: "Polska", flag: "🇵🇱" },
  { code: "CZ", name: "Česko", flag: "🇨🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "FI", name: "Suomi", flag: "🇫🇮" },
  { code: "GR", name: "Ελλάδα", flag: "🇬🇷" },
  { code: "HR", name: "Hrvatska", flag: "🇭🇷" },
  { code: "SI", name: "Slovenija", flag: "🇸🇮" },
  { code: "SK", name: "Slovensko", flag: "🇸🇰" },
  { code: "HU", name: "Magyarország", flag: "🇭🇺" },
  { code: "RO", name: "România", flag: "🇷🇴" },
  { code: "BG", name: "България", flag: "🇧🇬" },
];

export const getCountryFlag = (code: string) => COUNTRIES.find(c => c.code === code)?.flag || "";
export const getCountryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name || code;

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const CountrySelect = ({ value, onChange, className }: CountrySelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={className}>
      <SelectValue>
        {value ? `${getCountryFlag(value)} ${getCountryName(value)}` : "Land selecteren"}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {COUNTRIES.map((c) => (
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

export default CountrySelect;
