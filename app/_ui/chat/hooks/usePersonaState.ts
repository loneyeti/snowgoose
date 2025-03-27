import { Persona } from "@prisma/client";
import { useState } from "react";

interface UsePersonaStateProps {
  personas: Persona[];
  initialPersonaId?: number;
}

interface PersonaState {
  selectedPersona: string;
}

export function usePersonaState({
  personas,
  initialPersonaId,
}: UsePersonaStateProps): PersonaState & {
  updateSelectedPersona: (personaId: string) => void;
} {
  const [selectedPersona, setSelectedPersona] = useState<string>(
    initialPersonaId?.toString() ??
      (personas.length > 0 ? personas[0].id.toString() : "")
  );

  const updateSelectedPersona = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  return {
    selectedPersona,
    updateSelectedPersona,
  };
}
