import { useSyncExternalStore } from 'react'

export type DiagnosisState = {
  cnpj: string
  adminEmail: string
  userName: string
  leadName: string
  leadEmail: string
  a1: string
  a2: string
  a3: string
  a4: string
  a5: string
  a6: string
}

let store: DiagnosisState = {
  cnpj: '',
  adminEmail: '',
  userName: '',
  leadName: '',
  leadEmail: '',
  a1: '',
  a2: '',
  a3: '',
  a4: '',
  a5: '',
  a6: '',
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return store
}

const useDiagnosisStore = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot)

  const updateData = (data: Partial<DiagnosisState>) => {
    store = { ...store, ...data }
    listeners.forEach((listener) => listener())
  }

  const resetData = () => {
    store = {
      cnpj: '',
      adminEmail: '',
      userName: '',
      leadName: '',
      leadEmail: '',
      a1: '',
      a2: '',
      a3: '',
      a4: '',
      a5: '',
      a6: '',
    }
    listeners.forEach((listener) => listener())
  }

  return {
    data: state,
    updateData,
    resetData,
  }
}

export default useDiagnosisStore
