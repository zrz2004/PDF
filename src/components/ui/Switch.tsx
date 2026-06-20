export function Switch({ checked }: { checked?: boolean }) {
  return (
    <span className={`inline-flex h-6 w-11 items-center rounded-full border transition ${checked ? 'border-[#D97757]/40 bg-[#D97757]/80' : 'border-white/10 bg-white/[0.08]'}`}>
      <span className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </span>
  )
}
