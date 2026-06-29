import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentForm } from '#/features/students/components/StudentForm'
import { useStudentDetail, useUpdateStudent } from '#/features/students/hooks/useStudents'
import type { UpdateStudentRequest } from '#/generated/model'

export const Route = createFileRoute('/_app/students/$studentId/edit')({
  component: EditStudentPage,
})

function EditStudentPage() {
  const { studentId } = useParams({ from: '/_app/students/$studentId/edit' })
  const navigate = useNavigate()
  const { data: student, isLoading } = useStudentDetail(studentId)
  const updateStudent = useUpdateStudent()

  function handleSubmit(data: UpdateStudentRequest) {
    updateStudent.mutate(
      { id: studentId, req: data },
      {
        onSuccess: () => {
          navigate({ to: '/students/$studentId/profile' as any, params: { studentId } as any })
        },
      }
    )
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-muted-foreground" asChild>
        <Link to="/students/$studentId/profile" params={{ studentId }}>
          <ArrowLeft className="size-4" />
          Back to Profile
        </Link>
      </Button>

      <PageHeader
        title="Edit Student"
        description={student?.fullName ?? 'Edit student information'}
      />

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : student ? (
        <StudentForm
          mode="edit"
          defaultValues={student}
          onSubmit={(data) => handleSubmit(data as UpdateStudentRequest)}
          onCancel={() =>
            navigate({ to: '/students/$studentId/profile' as any, params: { studentId } as any })
          }
          isLoading={updateStudent.isPending}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Student not found.</p>
      )}
    </PageContainer>
  )
}
