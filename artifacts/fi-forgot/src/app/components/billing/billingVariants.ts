export function getFiBillingClassName(className?: string): string {
  return ["fi-billing", className].filter(Boolean).join(" ");
}

export function getFiSubscribeShellClassName(className?: string): string {
  return ["fi-subscribe-shell", className].filter(Boolean).join(" ");
}
