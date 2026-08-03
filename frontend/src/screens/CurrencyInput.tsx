interface CurrencyInputProps {
  value: number;
  onChange: (n: number) => void;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

function parseDigits(s: string): number {
  const digits = s.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

// Vietnamese locale groups thousands with "." (100.000), which is exactly
// the display format asked for — no need to hand-roll the grouping logic.
export function CurrencyInput({ value, onChange, required, autoFocus, placeholder }: CurrencyInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9.]*"
      value={value ? value.toLocaleString("vi-VN") : ""}
      onChange={(e) => onChange(parseDigits(e.target.value))}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
    />
  );
}

export default CurrencyInput;
