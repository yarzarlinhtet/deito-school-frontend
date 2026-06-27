import { useState } from 'react'
import { DocumentUploadItem, type DocumentStatus } from '#/components/shared/document-upload'
import type { Step6Data } from '../../hooks/useEnrollWizard'

interface DocDef {
  id: string
  label: string
  required: boolean
  hint?: string
}

const REQUIRED_DOCS: DocDef[] = [
  { id: 'student-photo', label: 'Student Photo', required: true, hint: 'Passport size, white background' },
  { id: 'birth-cert', label: 'Birth Certificate', required: true },
  { id: 'nrc-copy', label: 'NRC / ID Copy', required: true },
  { id: 'school-records', label: 'Previous School Records', required: true },
]

const OPTIONAL_DOCS: DocDef[] = [
  { id: 'passport-copy', label: 'Passport Copy', required: false },
  { id: 'medical-cert', label: 'Medical Certificate', required: false },
  { id: 'recommendation', label: 'Recommendation Letter', required: false },
]

interface DocState {
  file?: File
  status: DocumentStatus
  fileName?: string
  fileSize?: string
}

interface Step6DocumentsProps {
  defaultValues?: Partial<Step6Data>
  onSubmit: (data: Step6Data) => void
  formRef: React.RefObject<{ submit: () => void } | null>
}

export function Step6Documents({ defaultValues: _, onSubmit, formRef }: Step6DocumentsProps) {
  const [docStates, setDocStates] = useState<Record<string, DocState>>(
    [...REQUIRED_DOCS, ...OPTIONAL_DOCS].reduce(
      (acc, doc) => ({ ...acc, [doc.id]: { status: 'pending' as DocumentStatus } }),
      {}
    )
  )

  function handleUpload(docId: string, file: File) {
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        file,
        status: 'uploaded',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      },
    }))
  }

  function handleRemove(docId: string) {
    setDocStates((prev) => ({
      ...prev,
      [docId]: { status: 'pending' },
    }))
  }

  if (formRef) {
    (formRef as React.MutableRefObject<{ submit: () => void } | null>).current = {
      submit: () => {
        const documents = Object.entries(docStates)
          .filter(([, s]) => s.file)
          .map(([docId, s]) => ({ docId, file: s.file }))
        onSubmit({ documents })
      },
    }
  }

  const allDocs = [...REQUIRED_DOCS, ...OPTIONAL_DOCS]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">Upload required and optional supporting documents</p>
      </div>

      <div className="space-y-2">
        {allDocs.map((doc) => {
          const state = docStates[doc.id] ?? { status: 'pending' as DocumentStatus }
          return (
            <DocumentUploadItem
              key={doc.id}
              label={doc.label}
              required={doc.required}
              hint={doc.hint}
              status={state.status}
              fileName={state.fileName}
              fileSize={state.fileSize}
              onUpload={(file) => handleUpload(doc.id, file)}
              onRemove={state.status !== 'pending' ? () => handleRemove(doc.id) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
