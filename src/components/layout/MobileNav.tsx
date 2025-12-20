
import {
    LayoutDashboard,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    FileText,
    UserCircle,
    Settings,
    Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onMenuClick: () => void;
}

export function MobileNav({ currentPage, onNavigate, onMenuClick }: MobileNavProps) {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'income', label: 'In', icon: ArrowDownLeft },
        { id: 'expenses', label: 'Out', icon: ArrowUpRight },
        { id: 'forecast', label: 'Forecast', icon: TrendingUp },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden pb-safe">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 rounded-lg w-16 h-14',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-full transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
