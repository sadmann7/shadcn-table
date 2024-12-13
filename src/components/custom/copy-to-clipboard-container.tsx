import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export default function CopyToClipboardContainer({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  const onClick = () => {
    setCopied(true);
    const content = ref.current?.textContent;
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 w-6 h-6 hidden group-hover:flex"
        onClick={onClick}
      >
        {!copied ? <Copy className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      </Button>
      <div ref={ref} {...props}>
        {children}
      </div>
    </div>
  );
}
