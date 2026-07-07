import { cardCreationDefaults } from "@/app/card-creation/cardCreationDomain";

export function FiCardCreationHeader() {
  return (
    <header className="fi-card-creation__header">
      <h1 className="fi-card-creation__title">{cardCreationDefaults.title}</h1>
      <p className="fi-card-creation__subtitle">{cardCreationDefaults.description}</p>
    </header>
  );
}
