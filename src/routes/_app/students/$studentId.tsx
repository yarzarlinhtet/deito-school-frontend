import { createFileRoute, Outlet, Link, useParams, useNavigate, useMatchRoute } from '@tanstack/react-router'
import { ArrowLeft, Pencil, UserX } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { PageContainer } from '#/components/shared/page-layout'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { StudentProfileCard } from '#/features/students/components/StudentProfileCard'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import { useStudentDetail, useUpdateStudentStatus } from '#/features/students/hooks/useStudents'

export const Route = createFileRoute('/_app/students/$studentId')({
  component: StudentProfileLayout,
})

const TABS = [
  { label: 'Overview',         path: 'profile' },
  { label: 'Academic',         path: 'enrollment-history' },
  { label: 'Finance',          path: 'finance' },
  // { label: 'Documents',        path: 'documents' },
  { label: 'Visa Information', path: 'visa' },
  { label: 'Activity',         path: 'audit' },
] as const

function StudentProfileLayout() {
  const { studentId } = useParams({ from: '/_app/students/$studentId' })
  const { data: student, isLoading } = useStudentDetail(studentId)
  const updateStatus = useUpdateStudentStatus()
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()

  const activeTab =
    TABS.find((t) =>
      matchRoute({ to: `/students/${studentId}/${t.path}` as any })
    )?.path ?? 'profile'

  const status = student?.status ?? ''

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" asChild>
          <Link to="/students">
            <ArrowLeft className="size-4" />
            Back to Students
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate({ to: '/students/$studentId/edit' as any, params: { studentId } as any })}
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Button>
          </PermissionGuard>
          {status === 'ACTIVE' && (
            <PermissionGuard permission={PERMISSIONS.STUDENT.PROFILE.UPDATE}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-warning border-warning/30 hover:bg-warning/10"
                onClick={() => updateStatus.mutate({ id: studentId, status: 'SUSPENDED' })}
              >
                <UserX className="size-3.5" />
                Deactivate
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

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
            <StudentProfileCard student={student} />
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
