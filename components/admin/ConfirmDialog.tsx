'use client';

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = '実行',
  onConfirm,
  onCancel,
  destructive,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-4 space-y-3">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded border border-neutral-300"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm rounded text-white ${
              destructive ? 'bg-red-600' : 'bg-neutral-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
