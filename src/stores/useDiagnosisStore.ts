import { useSyncExternalStore } from 'react'

export type DiagnosisState = {
  cnpj: string
  adminEmail: string
  userName: string
  leadName: string
  leadEmail: string
}

let store: DiagnosisState = {
  cnpj: '',
  adminEmail: '',
  userName: '',
  leadName: '',
  leadEmail: '',
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
