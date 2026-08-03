import { useState } from "react";
import type { Transaction, TransactionType } from "../domain/types";
import { CurrencyInput } from "./CurrencyInput";

const AMOUNT_PRESETS = [50_000, 100_000, 150_000, 200_000, 300_000, 400_000];

const typeLabels: Record<TransactionType, string> = {
  side_income: "Kiếm thêm",
  expense: "Chi tiêu",
  saving: "Tích góp",
};

export interface TransactionFormValue {
  date: string;
  type: TransactionType;
  amount: number;
  note: string | null;
}

interface TransactionFormProps {
  initial?: Transaction;
  defaultDate: string;
  onSubmit: (data: TransactionFormValue) => Promise<void>;
  onCancel?: () => void;
}

export function TransactionForm({ initial, defaultDate, onSubmit, onCancel }: TransactionFormProps) {
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [type, setType] = useState<TransactionType>(initial?.type ?? "side_income");
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setSaving(true);
    try {
      await onSubmit({ date, type, amount, note: note.trim() || null });
      if (!initial) {
        setAmount(0);
        setNote("");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="tx-form" onSubmit={handleSubmit}>
      <label className="tx-field">
        Ngày
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="tx-field">
        Loại
        <div className="tx-type-tabs">
          {(Object.keys(typeLabels) as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={t === type ? "active" : ""}
              onClick={() => setType(t)}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
      </label>
      <label className="tx-field">
        Số tiền (VND)
        <CurrencyInput value={amount} onChange={setAmount} placeholder="0" required autoFocus={!initial} />
        <div className="tx-amount-presets">
          {AMOUNT_PRESETS.map((preset) => (
            <button key={preset} type="button" onClick={() => setAmount(preset)}>
              {preset / 1000}K
            </button>
          ))}
        </div>
      </label>
      <label className="tx-field">
        Ghi chú
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuỳ chọn" />
      </label>
      <div className="tx-form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {initial ? "Lưu" : "Thêm"}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}

export default TransactionForm;
