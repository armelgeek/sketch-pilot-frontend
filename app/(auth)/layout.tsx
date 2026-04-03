export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-zinc-950 selection:bg-amber-500/20 selection:text-amber-600 grain-overlay">
      {children}
    </div>
  );
}
