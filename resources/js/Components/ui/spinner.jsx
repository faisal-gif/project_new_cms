import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

// Pengganti daisyUI `loading loading-spinner`. Pakai: <Spinner /> atau <Spinner className="size-6" />.
function Spinner({ className, ...props }) {
  return (
    <Loader2
      role="status"
      aria-label="Memuat"
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Spinner }
