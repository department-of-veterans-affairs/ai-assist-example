import type Client from 'fhirclient/lib/Client';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

interface FhirClientContextType {
  client: Client | undefined;
}

const FhirClientContext = createContext<FhirClientContextType>({
  client: undefined,
});

interface FhirClientProviderProps {
  client: Client | undefined;
  children: ReactNode;
}

export function FhirClientProvider({
  client,
  children,
}: FhirClientProviderProps) {
  return (
    <FhirClientContext.Provider value={{ client }}>
      {children}
    </FhirClientContext.Provider>
  );
}

export function useFhirClient() {
  return useContext(FhirClientContext);
}
