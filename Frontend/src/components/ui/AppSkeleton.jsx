export default function AppSkeleton() {
  return (
    <div className="app-shell min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="skeleton h-8 w-52" />
        <div className="skeleton h-4 w-80" style={{ opacity: 0.6 }} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-6">
          <div className="skeleton h-28 rounded-2xl" />
          <div className="skeleton h-28 rounded-2xl" style={{ animationDelay: "0.1s" }} />
          <div className="skeleton h-28 rounded-2xl" style={{ animationDelay: "0.2s" }} />
        </div>
        <div className="skeleton h-80 rounded-2xl mt-4" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
