import { cn } from "@/lib/utils";

export const DotBackground = ({
  className,
  fade = true,
  size = 22,
}: {
  className?: string;
  fade?: boolean;
  size?: number;
}) => {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.55]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground) / 0.14) 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 35%, transparent 10%, hsl(var(--background)) 72%)",
          }}
        />
      )}
    </div>
  );
};
