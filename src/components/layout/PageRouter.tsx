import React, { Suspense } from "react";
import { useNavigationStore } from "../../stores/navigationStore";
import { LoadingSpinner } from "../common/LoadingSpinner";

const DataPage = React.lazy(() => import("../../pages/DataPage"));
const JournalPage = React.lazy(() => import("../../pages/JournalPage"));
const ResultPage = React.lazy(() => import("../../pages/ResultPage"));
const BacklogPage = React.lazy(() => import("../../pages/BacklogPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size={32} />
    </div>
  );
}

export function PageRouter() {
  const activePage = useNavigationStore((s) => s.activePage);

  return (
    <Suspense fallback={<PageFallback />}>
      {activePage === "data" && <DataPage />}
      {activePage === "journal" && <JournalPage />}
      {activePage === "result" && <ResultPage />}
      {activePage === "backlog" && <BacklogPage />}
    </Suspense>
  );
}
