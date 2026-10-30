import { createContext, useContext } from 'react';
import { DEFAULT_CATALOG } from './subjectCatalog';
export const SubjectCatalogContext = createContext(DEFAULT_CATALOG);
export function useSubjectCatalog() { return useContext(SubjectCatalogContext); }
