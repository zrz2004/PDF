export function Toast({ message }: { message: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-sm text-[#F4F1EA] shadow-glow">{message}</div>
}
