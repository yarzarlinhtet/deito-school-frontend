import { DocumentUploadItem } from '#/components/shared/document-upload'
import { useStudentDocuments, useUploadDocument } from '../hooks/useStudentDocuments'

interface StudentDocumentsTabProps {
  studentId: string
}

export function StudentDocumentsTab({ studentId }: StudentDocumentsTabProps) {
  const { data: documents, isLoading } = useStudentDocuments(studentId)
  const upload = useUploadDocument(studentId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (!documents?.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No documents on file.
      </p>
    )
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {documents.map((doc) => (
        <DocumentUploadItem
          key={doc.id}
          label={doc.label}
          required={doc.required}
          status={doc.status}
          fileName={doc.fileName}
          fileSize={doc.fileSize}
          onUpload={(file) => upload.mutate({ docId: doc.id, file })}
        />
      ))}
    </div>
  )
}
