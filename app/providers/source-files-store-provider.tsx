'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { createSourceFilesStore, defaultInitState, initSourceFilesStore, SourceFilesStore } from '../stores/source-files-store'

export type SourceFilesStoreApi = ReturnType<typeof createSourceFilesStore>

export const SourceFilesStoreContext = createContext<SourceFilesStoreApi | undefined>(
  undefined,
)

export interface SourceFilesStoreProviderProps {
  children: ReactNode
}

export const SourceFilesStoreProvider = ({
  children,
}: SourceFilesStoreProviderProps) => {
  const storeRef = useRef<SourceFilesStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createSourceFilesStore(initSourceFilesStore())
  }

 return (
  <SourceFilesStoreContext.Provider value={storeRef.current}>
    {children}
  </SourceFilesStoreContext.Provider>
)

}

export const useSourceFilesStore = <T,>(
  selector: (store: SourceFilesStore) => T,
): T => {
  const sourceFilesStoreContext = useContext(SourceFilesStoreContext)

  if (!sourceFilesStoreContext) {
    throw new Error(`useSourceFilesStore must be used within SourceFilesStoreProvider`)
  }

  return useStore(sourceFilesStoreContext, selector)
}