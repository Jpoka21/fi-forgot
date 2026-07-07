import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { FiInlineMessageTone } from "@/app/components/feedback/feedbackDomain";
import { getFiInlineMessageClassName } from "@/app/components/feedback/feedbackVariants";

function inlineIcon(tone: FiInlineMessageTone): ReactNode {
  switch (tone) {
    case "success":
      return <CheckCircle2 />;
    case "warning":
      return <AlertTriangle />;
    case "error":
      return <AlertCircle />;
    default:
      return <Info />;
  }
}

export interface FiInlineMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: FiInlineMessageTone;
  icon?: ReactNode;
  showIcon?: boolean;
}

export const FiInlineMessage = forwardRef<HTMLParagraphElement, FiInlineMessageProps>(
  (
    {
      tone = "info",
      icon,
      showIcon = true,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <p
      ref={ref}
      className={cn(getFiInlineMessageClassName({ tone, className }))}
      {...props}
    >
      {showIcon ? (
        <span className="fi-inline-message__icon" aria-hidden>
          {icon ?? inlineIcon(tone)}
        </span>
      ) : null}
      <span>{children}</span>
    </p>
  ),
);

FiInlineMessage.displayName = "FiInlineMessage";
