import { TopNav } from "./components/layout/TopNav";
import { PageRouter } from "./components/layout/PageRouter";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <TopNav />
      <main className="flex-1 min-h-0 overflow-hidden flex justify-center">
        <div className="w-full max-w-5xl h-full">
          <PageRouter />
        </div>
      </main>
    </div>
  );
}
