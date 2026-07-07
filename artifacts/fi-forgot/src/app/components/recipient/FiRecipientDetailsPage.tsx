import { FiRecipientPanel } from "@/app/components/recipient/FiRecipientPanel";

export interface FiRecipientDetailsPageProps {
  recipientId: string;
  onAddPerson?: () => void;
}

export function FiRecipientDetailsPage({ recipientId, onAddPerson }: FiRecipientDetailsPageProps) {
  return <FiRecipientPanel recipientId={recipientId} onAddPerson={onAddPerson} />;
}
