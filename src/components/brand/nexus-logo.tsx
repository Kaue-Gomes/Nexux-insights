import { cn } from "@/lib/utils";

const LOGO_SRC = "/assets/logonexus.png";

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
} as const;

export function NexusLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: keyof typeof sizeMap;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Nexus"
      className={cn("object-contain shrink-0", sizeMap[size], className)}
    />
  );
}
