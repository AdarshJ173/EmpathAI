// Dashboard layout without authentication requirements

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication check needed
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}