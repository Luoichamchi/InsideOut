import { useState } from "react";
import type { MonthlyConfig, AppSettings } from "../domain/types";
import { upsertConfig, updateSettings } from "../api/client";
import { CurrencyInput } from "./CurrencyInput";

interface ConfigScreenProps {
  month: string;
  config: MonthlyConfig;
  settings: AppSettings;
  onSaved: () => Promise<void>;
}

const fields: { key: keyof Omit<MonthlyConfig, "month">; label: string }[] = [
  { key: "salary_amount", label: "Để dành" },
  { key: "side_goal", label: "Mục tiêu kiếm thêm" },
  { key: "budget", label: "Ngân sách chi tiêu" },
];

export function ConfigScreen({ month, config, settings, onSaved }: ConfigScreenProps) {
  const [values, setValues] = useState(config);
  const [saving, setSaving] = useState(false);
  const [savingsTarget, setSavingsTarget] = useState(settings.savings_target);
  const [savingTarget, setSavingTarget] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertConfig(values);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleSavingsTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTarget(true);
    try {
      await updateSettings({ savings_target: savingsTarget });
      await onSaved();
    } finally {
      setSavingTarget(false);
    }
  };

  return (
    <div className="screen">
      <h2 className="screen-title">Cấu hình tháng {month}</h2>
      <form className="tx-form" onSubmit={handleSubmit}>
        {fields.map(({ key, label }) => (
          <label className="tx-field" key={key}>
            {label} (VND)
            <CurrencyInput value={values[key]} onChange={(n) => setValues({ ...values, [key]: n })} required />
          </label>
        ))}
        <div className="tx-form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            Lưu cấu hình
          </button>
        </div>
      </form>

      <h2 className="screen-title">Mục tiêu tích góp</h2>
      <form className="tx-form" onSubmit={handleSavingsTargetSubmit}>
        <label className="tx-field">
          Mục tiêu tích góp (VND)
          <CurrencyInput value={savingsTarget} onChange={setSavingsTarget} required />
        </label>
        <div className="tx-form-actions">
          <button type="submit" className="btn-primary" disabled={savingTarget}>
            Lưu mục tiêu
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfigScreen;
