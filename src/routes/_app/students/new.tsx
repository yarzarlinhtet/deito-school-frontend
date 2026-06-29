import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { PageContainer } from '#/components/shared/page-layout'
import { PageHeader } from '#/components/shared/page-layout'
import { StudentForm } from '#/features/students/components/StudentForm'
import { useCreateStudent } from '#/features/students/hooks/useStudents'
import type { CreateStudentRequest } from '#/generated/model'

export const Route = createFileRoute('/_app/students/new')({
  component: CreateStudentPage,
})

function CreateStudentPage() {
  const navigate = useNavigate()
  const createStudent = useCreateStudent()

  function handleSubmit(data: CreateStudentRequest) {
    createStudent.mutate(data, {
      onSuccess: (student) => {
        navigate({ to: '/students/$studentId/profile' as any, params: { studentId: student.id! } as any })
      },
    })
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-muted-foreground" asChild>
        <Link to="/students">
          <ArrowLeft className="size-4" />
          Back to Students
        </Link>
      </Button>

      <PageHeader
        title="Add Student"
        description="Create a new student record with personal and contact information"
      />

      <StudentForm
        mode="create"
        onSubmit={(data) => handleSubmit(data as CreateStudentRequest)}
        onCancel={() => navigate({ to: '/students' as any })}
        isLoading={createStudent.isPending}
      />
    </PageContainer>
  )
}
