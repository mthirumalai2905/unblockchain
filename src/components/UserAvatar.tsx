import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  initials: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-6 h-6 text-[9px]",
  md: "w-7 h-7 text-[10px]",
  lg: "w-10 h-10 text-[13px]",
};

const UserAvatar = ({ avatarUrl, initials, size = "sm", className }: UserAvatarProps) => {
  return (
    <div className={cn("rounded-full bg-accent flex items-center justify-center font-semibold text-muted-foreground shrink-0 overflow-hidden", sizeClasses[size], className)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

export default UserAvatar;
