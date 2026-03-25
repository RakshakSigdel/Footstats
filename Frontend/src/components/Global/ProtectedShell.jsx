import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AppSkeleton from "../ui/AppSkeleton";
import PageTransition from "../ui/PageTransition";
import ProtectedContentBoundary from "../ui/ProtectedContentBoundary";

export default function ProtectedShell() {
  const location = useLocation();
  const transitionKey = location.key || `${location.pathname}${location.search}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto">
          <ProtectedContentBoundary>
            <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={transitionKey} className="min-h-full flex flex-col">
                <Suspense fallback={<AppSkeleton mode="content" />}>
                  <Outlet />
                </Suspense>
              </PageTransition>
            </AnimatePresence>
          </ProtectedContentBoundary>
        </div>
      </div>
    </div>
  );
}
