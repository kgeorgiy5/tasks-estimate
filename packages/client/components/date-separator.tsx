"use client"

type DateSeparatorProps = {
  label: string;
};

export default function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center my-3">
      <div className="flex-1 h-px bg-zinc-200" />
      <div className="mx-3 text-sm text-zinc-500">{label}</div>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
}
