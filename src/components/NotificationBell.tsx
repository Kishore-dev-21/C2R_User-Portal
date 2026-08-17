import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationBell = ({ unreadCount, onClick }: NotificationBellProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative p-2"
      aria-label="Messages"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBell;
