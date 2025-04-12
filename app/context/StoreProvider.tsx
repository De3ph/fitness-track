// StoreProvider.tsx
'use client';

import React, { createContext, useContext, useEffect } from "react"
import { rootStore, RootStore } from "../stores/RootStore"

// Create a context for our store
export const StoreContext = createContext<RootStore | null>(null)

// Create a provider component
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Initialize stores when the app starts
  useEffect(() => {
    // Load all data from PocketBase
    rootStore
      .initializeStores()
      .catch((error) => console.error("Failed to initialize stores:", error))
  }, [])

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  )
}

// Create a hook to use the store context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};