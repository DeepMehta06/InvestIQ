import TopBar from '../TopBar/TopBar';
import ConfigPanel from '../ConfigPanel/ConfigPanel';
import ResultsArea from '../ResultsArea/ResultsArea';

/**
 * Root layout shell. Two-column layout: fixed config panel left, results right.
 */
export default function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-bg text-primary font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-border overflow-y-auto">
          <ConfigPanel />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <ResultsArea />
        </main>
      </div>
    </div>
  );
}
