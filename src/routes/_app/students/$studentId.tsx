import { createFileRoute, Outlet, Link, useParams, useMatchRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { PageContainer } from '#/components/shared/page-layout'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentProfileCard } from '#/features/students/components/StudentProfileCard'
import { useStudent, useDeactivateStudent } from '#/features/students/hooks/useStudents'

export const Route = createFileRoute('/_app/students/$studentId')({
  component: StudentProfileLayout,
})

const TABS = [
  { label: 'Overview', path: 'overview' },
  { label: 'Academic', path: 'academic' },
  { label: 'Finance', path: 'finance' },
  { label: 'Documents', path: 'documents' },
  { label: 'Visa', path: 'visa' },
  { label: 'Activity', path: 'activity' },
] as const

function StudentProfileLayout() {
  const { studentId } = useParams({ from: '/_app/students/$studentId' })
  const { data: student, isLoading } = useStudent(studentId)
  const deactivate = useDeactivateStudent()
  const matchRoute = useMatchRoute()

  const activeTab = TABS.find((t) =>
    matchRoute({ to: `/students/${studentId}/${t.path}` as any })
  )?.path ?? 'overview'

  return (
    <PageContainer>
      {/* Back link */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-muted-foreground" asChild>
        <Link to="/students">
          <ArrowLeft className="size-4" />
          Back to Students
        </Link>
      </Button>

      <div className="flex gap-6">
        {/* Left sidebar profile card */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col rounded-xl border bg-card p-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="size-20 rounded-full mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
          ) : student ? (
            <StudentProfileCard
              student={student}
              onDeactivate={() => deactivate.mutate(student.id)}
            />
          ) : null}
        </aside>

        {/* Right tab content */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab}>
            <TabsList className="mb-4 w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-0">
              {TABS.map((tab) => (
                <Link
                  key={tab.path}
                  to={`/students/${studentId}/${tab.path}` as any}
                >
                  <TabsTrigger
                    value={tab.path}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
                  >
                    {tab.label}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
            <Outlet />
          </Tabs>
        </div>
      </div>
    </PageContainer>
  )
}
