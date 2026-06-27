import { useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WizardLayout, type WizardStep } from '#/components/shared/wizard'
import { Step1Personal } from '#/features/students/components/EnrollmentWizard/Step1Personal'
import { Step2Contact } from '#/features/students/components/EnrollmentWizard/Step2Contact'
import { Step3Parents } from '#/features/students/components/EnrollmentWizard/Step3Parents'
import { Step4Emergency } from '#/features/students/components/EnrollmentWizard/Step4Emergency'
import { Step5Academic } from '#/features/students/components/EnrollmentWizard/Step5Academic'
import { Step6Documents } from '#/features/students/components/EnrollmentWizard/Step6Documents'
import { Step7Review } from '#/features/students/components/EnrollmentWizard/Step7Review'
import { useEnrollWizard } from '#/features/students/hooks/useEnrollWizard'

export const Route = createFileRoute('/_app/students/new')({
  component: EnrollStudentPage,
})

const STEPS: WizardStep[] = [
  { label: 'Personal Info', description: 'Basic details & photo' },
  { label: 'Contact', description: 'Address & phone' },
  { label: 'Parent & Guardian', description: 'Father & mother details' },
  { label: 'Emergency Contact', description: 'Emergency contacts' },
  { label: 'Academic Info', description: 'Program & enrollment' },
  { label: 'Documents', description: 'Upload documents' },
  { label: 'Review & Submit', description: 'Confirm and enroll' },
]

function EnrollStudentPage() {
  const wizard = useEnrollWizard()
  const stepFormRef = useRef<{ submit: () => void } | null>(null)

  function handleNext() {
    if (wizard.state.currentStep < 6) {
      stepFormRef.current?.submit()
    } else {
      wizard.submit()
    }
  }

  const { currentStep } = wizard.state

  return (
    <WizardLayout
      title="Student Enrollment"
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={wizard.back}
      onSaveDraft={wizard.saveDraftNow}
      isSubmitting={wizard.isSubmitting}
      isLastStep={currentStep === 6}
    >
      {currentStep === 0 && (
        <Step1Personal
          defaultValues={wizard.state.step1}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step1', data); wizard.next() }}
        />
      )}
      {currentStep === 1 && (
        <Step2Contact
          defaultValues={wizard.state.step2}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step2', data); wizard.next() }}
        />
      )}
      {currentStep === 2 && (
        <Step3Parents
          defaultValues={wizard.state.step3}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step3', data); wizard.next() }}
        />
      )}
      {currentStep === 3 && (
        <Step4Emergency
          defaultValues={wizard.state.step4}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step4', data); wizard.next() }}
        />
      )}
      {currentStep === 4 && (
        <Step5Academic
          defaultValues={wizard.state.step5}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step5', data); wizard.next() }}
        />
      )}
      {currentStep === 5 && (
        <Step6Documents
          defaultValues={wizard.state.step6}
          formRef={stepFormRef}
          onSubmit={(data) => { wizard.update('step6', data); wizard.next() }}
        />
      )}
      {currentStep === 6 && (
        <Step7Review state={wizard.state} />
      )}
    </WizardLayout>
  )
}
