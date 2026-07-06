import { Generator } from './Generator';

export function Dashboard() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0a0f1e]">
      <div className="flex-1 min-w-0 h-full relative">
        <Generator />
      </div>
    </div>
  );
}
