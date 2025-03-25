"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface DynamicContainerProps
  extends React.ComponentProps<typeof motion.div> {
  width?: boolean;
  height?: boolean;
  children?: React.ReactNode;
}

function DynamicContainer({
  width = false,
  height = false,
  transition = { type: "spring", duration: 0.3 },
  className,
  children,
  ...props
}: DynamicContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [entry, setEntry] = React.useState<ResizeObserverEntry>();

  React.useEffect(() => {
    const node = containerRef?.current;
    if (!node) return;

    function updateEntry([entry]: ResizeObserverEntry[]): void {
      setEntry(entry);
    }

    const observer = new ResizeObserver(updateEntry);

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      animate={{
        width: width ? (entry?.contentRect?.width ?? "auto") : "auto",
        height: height ? (entry?.contentRect?.height ?? "auto") : "auto",
      }}
      transition={transition}
      {...props}
    >
      <div
        ref={containerRef}
        className={cn(height && "h-max", width && "w-max")}
      >
        {children}
      </div>
    </motion.div>
  );
}

export { DynamicContainer };
