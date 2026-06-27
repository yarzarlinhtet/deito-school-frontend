import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { axiosInstance } from '#/lib/axios'
import type {
  Address,
  GuardianInfo,
  EmergencyContact,
  AdmissionType,
  Gender,
} from '../types'

export interface Step1Data {
  photoFile?: File
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  nationality: string
  religion: string
  nrc: string
  passportNumber: string
  countryOfBirth: string
  medicalNotes: string
}

export interface Step2Data {
  residentialAddress: Address
  sameAsResidential: boolean
  homeCountryAddress?: Partial<Address>
  studentEmail: string
  studentPhone: string
}

export interface Step3Data {
  father: GuardianInfo
  mother: GuardianInfo
}

export interface Step4Data {
  primary: EmergencyContact
  secondary?: Partial<EmergencyContact>
}

export interface Step5Data {
  academicYearId: string
  intakeId: string
  majorId: string
  duration: string
  admissionDate: string
  admissionType: AdmissionType
  feeCategoryId: string
}

export interface Step6Data {
  documents: Array<{ docId: string; file?: File }>
}

export interface WizardState {
  currentStep: number
  step1?: Step1Data
  step2?: Step2Data
  step3?: Step3Data
  step4?: Step4Data
  step5?: Step5Data
  step6?: Step6Data
}

const DRAFT_KEY = 'deito-enroll-draft'

function loadDraft(): WizardState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw) as WizardState
  } catch {}
  return { currentStep: 0 }
}

function saveDraft(state: WizardState) {
  const { ...draftable } = state
  // Don't serialize File objects
  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    ...draftable,
    step1: draftable.step1 ? { ...draftable.step1, photoFile: undefined } : undefined,
    step6: draftable.step6 ? { ...draftable.step6, documents: draftable.step6.documents.map(d => ({ docId: d.docId })) } : undefined,
  }))
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function useEnrollWizard() {
  const [state, setState] = useState<WizardState>(loadDraft)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const submit = useMutation({
    mutationFn: async (wizardState: WizardState) => {
      const formData = new FormData()
      if (wizardState.step1?.photoFile) {
        formData.append('photo', wizardState.step1.photoFile)
      }
      formData.append('data', JSON.stringify({
        ...wizardState.step1,
        ...wizardState.step2,
        ...wizardState.step3,
        ...wizardState.step4,
        ...wizardState.step5,
      }))
      const res = await axiosInstance.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Upload documents after student is created
      if (wizardState.step6?.documents) {
        const studentId = res.data.id as string
        await Promise.all(
          wizardState.step6.documents
            .filter((d) => d.file)
            .map((d) => {
              const fd = new FormData()
              fd.append('file', d.file!)
              fd.append('documentId', d.docId)
              return axiosInstance.post(`/students/${studentId}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
            })
        )
      }

      return res.data
    },
    onSuccess: (student) => {
      clearDraft()
      qc.invalidateQueries({ queryKey: ['students', 'list'] })
      toast.success(`${student.fullName} enrolled successfully`)
      navigate({ to: '/students/$studentId/overview' as any, params: { studentId: student.id } as any })
    },
    onError: () => toast.error('Enrollment failed. Please try again.'),
  })

  function update<K extends keyof Omit<WizardState, 'currentStep'>>(
    key: K,
    value: WizardState[K]
  ) {
    setState((prev) => {
      const next = { ...prev, [key]: value }
      saveDraft(next)
      return next
    })
  }

  function goToStep(step: number) {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  function next() {
    setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }))
  }

  function back() {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }))
  }

  function saveDraftNow() {
    saveDraft(state)
    toast.success('Draft saved')
  }

  return {
    state,
    update,
    next,
    back,
    goToStep,
    saveDraftNow,
    submit: () => submit.mutate(state),
    isSubmitting: submit.isPending,
  }
}
