/**
 * Dev-only layout - bypasses the normal admin SessionProvider
 * This ensures the dev page doesn't wrap children with auth
 */
export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

