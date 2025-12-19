import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsPopover } from './NotificationsPopover';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onAddTransaction?: () => void;
  onNavigate: (page: string) => void;
}

export function Header({ title, subtitle, onMenuClick, onAddTransaction, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onAddTransaction && (
          <Button onClick={onAddTransaction} className="hidden sm:flex">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        )}
        {onAddTransaction && (
          <Button onClick={onAddTransaction} size="icon" className="sm:hidden">
            <Plus className="h-5 w-5" />
          </Button>
        )}
        <NotificationsPopover />
        <ProfileDropdown businessName={subtitle || 'My Business'} onNavigate={onNavigate} />
      </div>
    </header>
  );
}
