import { useSyncExternalStore } from 'react'

export type DiagnosisState = {
  companyName: string
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
  s1: string
  s2: string
  s3: string
  s4: string
  s5: string
  s6: string
  au1: string
  au2: string
  au3: string
  au4: string
  au5: string
  au6: string
  t1: number
  t2: number
  t3: number
  t4: string
  pdfUrl?: string
  scoringData?: any
  diagnosticoId?: string
  complemento?: string
}

let store: DiagnosisState = {
  companyName: '',
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
  s1: '',
  s2: '',
  s3: '',
  s4: '',
  s5: '',
  s6: '',
  au1: '',
  au2: '',
  au3: '',
  au4: '',
  au5: '',
  au6: '',
  t1: 5,
  t2: 5,
  t3: 5,
  t4: '',
  pdfUrl: undefined,
  scoringData: undefined,
  diagnosticoId: undefined,
  complemento: undefined,
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
      companyName: '',
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
      s1: '',
      s2: '',
      s3: '',
      s4: '',
      s5: '',
      s6: '',
      au1: '',
      au2: '',
      au3: '',
      au4: '',
      au5: '',
      au6: '',
      t1: 5,
      t2: 5,
      t3: 5,
      t4: '',
      pdfUrl: undefined,
      scoringData: undefined,
      diagnosticoId: undefined,
      complemento: undefined,
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
