'use client';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="border-b border-slate-200">
            <nav className="flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
