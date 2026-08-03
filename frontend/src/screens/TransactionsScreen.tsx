import { useState } from "react";
import type { Transaction, TransactionType } from "../domain/types";
import { createTransaction, updateTransaction, deleteTransaction } from "../api/client";
import { formatVND } from "../widgets/format";
import { TransactionForm, type TransactionFormValue } from "./TransactionForm";

const typeLabels: Record<TransactionType, string> = {
  side_income: "Kiếm thêm",
  expense: "Chi tiêu",
  saving: "Tích góp",
};

interface TransactionsScreenProps {
  transactions: Transaction[];
  today: string;
  onChanged: () => Promise<void>;
}

export function TransactionsScreen({ transactions, today, onChanged }: TransactionsScreenProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleCreate = async (data: TransactionFormValue) => {
    await createTransaction(data);
    await onChanged();
  };

  const handleUpdate = async (id: number, data: TransactionFormValue) => {
    await updateTransaction(id, data);
    setEditingId(null);
    await onChanged();
  };

  const handleDelete = async (id: number) => {
    await deleteTransaction(id);
    await onChanged();
  };

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return (
    <div className="screen">
      <h2 className="screen-title">Thêm giao dịch</h2>
      <TransactionForm defaultDate={today} onSubmit={handleCreate} />

      <h2 className="screen-title">Giao dịch tháng này</h2>
      <ul className="tx-list">
        {sorted.map((t) =>
          editingId === t.id ? (
            <li key={t.id} className="tx-row tx-row-editing">
              <TransactionForm
                initial={t}
                defaultDate={t.date}
                onSubmit={(data) => handleUpdate(t.id, data)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={t.id} className="tx-row">
              <div className="tx-row-main">
                <span className="tx-row-date">{t.date.slice(5)}</span>
                <span className="tx-row-type">{typeLabels[t.type]}</span>
                <span className="tx-row-amount">{formatVND(t.amount)}</span>
                <div className="tx-row-actions">
                  <button type="button" onClick={() => setEditingId(t.id)}>
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)}>
                    Xoá
                  </button>
                </div>
              </div>
              {t.note && <div className="tx-row-note">{t.note}</div>}
            </li>
          )
        )}
        {sorted.length === 0 && <li className="tx-empty">Chưa có giao dịch nào.</li>}
      </ul>
    </div>
  );
}

export default TransactionsScreen;
