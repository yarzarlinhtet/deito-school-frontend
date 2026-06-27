import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Progress } from '#/components/ui/progress'
import { cn } from '#/lib/utils'

export interface WizardStep {
  label: string
  description?: string
}

interface WizardLayoutProps {
  title: string
  steps: WizardStep[]
  currentStep: number
  children: ReactNode
  onNext: () => void
  onBack: () => void
  onSaveDraft?: () => void
  isSubmitting?: boolean
  isLastStep?: boolean
  canAdvance?: boolean
}

export function WizardLayout({
  title,
  steps,
  currentStep,
  children,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting = false,
  isLastStep = false,
  canAdvance = true,
}: WizardLayoutProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Left step nav */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-card border-r py-8 px-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
          {title}
        </h2>
        <nav className="flex flex-col gap-1">
          {steps.map((step, index) => {
            const isDone = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5',
                  isCurrent && 'bg-primary/10',
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    isDone
                      ? 'border-success bg-success text-success-foreground'
                      : isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="size-3" /> : index + 1}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-foreground' : isDone ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length} — {steps[currentStep]?.label}
            </p>
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>
          {onSaveDraft && (
            <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={isSubmitting}>
              Save Draft
            </Button>
          )}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
          {children}
        </div>

        {/* Footer navigation */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!canAdvance || isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : isLastStep
                ? 'Submit Enrollment'
                : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
