// Auth segment layout — deliberately renders no navigation (no Navbar,
// Sidebar, or MobileTabBar). Login / register are focused single-task
// screens; each page owns its own shell (see AuthFormSplitScreen).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
