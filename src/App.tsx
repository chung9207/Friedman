import { TopNav } from "./components/layout/TopNav";
import { PageRouter } from "./components/layout/PageRouter";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <TopNav />
      <main className="flex-1 min-h-0 overflow-hidden">
        <PageRouter />
      </main>
    </div>
  );
}
