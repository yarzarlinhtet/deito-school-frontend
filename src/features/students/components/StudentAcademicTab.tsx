import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { PERMISSIONS } from '#/constants/permissions'
import { useStudentEnrollments } from '#/features/students/hooks/useStudentEnrollments'
import { useAcademicYears } from '#/features/enrollment/hooks/useAcademicYears'
import { useActivePrograms } from '#/features/academic/hooks/usePrograms'
import { useIntakes } from '#/features/enrollment/hooks/useIntakes'
import { useBatches } from '#/features/enrollment/hooks/useBatches'
import { useClasses } from '#/features/academic/hooks/useClasses'
import { programControllerListLevels } from '#/generated/program-controller/program-controller'
import { EnrollmentCard } from '#/features/students/components/enrollment/EnrollmentCard'
import { EnrollmentDialog } from '#/features/students/components/enrollment/EnrollmentDialog'
import type { EnrollmentLookups } from '#/features/students/components/enrollment/GraduateDialog'

type MapItem = { id?: string; name?: string }

function buildMap(items?: MapItem[]): Record<string, string> {
  if (!items) return {}
  return Object.fromEntries(
    (items as MapItem[])
      .filter((item): item is { id: string; name: string } => !!item.id && !!item.name)
      .map((item) => [item.id, item.name]),
  )
}

interface StudentAcademicTabProps {
  studentId: string
}

export function StudentAcademicTab({ studentId }: StudentAcademicTabProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments(studentId)
  const { data: academicYearsData } = useAcademicYears({ page: 0, size: 100 })
  const { data: programsData } = useActivePrograms()
  const { data: intakesData } = useIntakes({ pagination: { page: 0, size: 200 } })
  const { data: batchesData } = useBatches({ pagination: { page: 0, size: 200 } })
  const { data: classesData } = useClasses({ pagination: { page: 0, size: 200 } })

  const enrollmentList = enrollments ?? []
  const uniqueProgramIds = [
    ...new Set(enrollmentList.map((e) => e.programId).filter((id): id is string => !!id)),
  ]

  const programLevelQueries = useQueries({
    queries: uniqueProgramIds.map((programId) => ({
      queryKey: ['program-levels', programId],
      queryFn: () => programControllerListLevels(programId),
    })),
  })

  const programLevelMap: Record<string, string> = {}
  programLevelQueries.forEach((q) => {
    ;(q.data ?? []).forEach((level) => {
      if (level.id && level.name) programLevelMap[level.id] = level.name
    })
  })

  const lookups: EnrollmentLookups = {
    academicYearMap: buildMap(academicYearsData?.items),
    programMap: buildMap(Array.isArray(programsData) ? programsData : []),
    programLevelMap,
    intakeMap: buildMap(intakesData?.items),
    batchMap: buildMap(batchesData?.items),
    classMap: buildMap(classesData?.items),
  }

  const sorted = [...enrollmentList].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return db - da
  })

  if (enrollmentsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Enrollment History</h3>
        <PermissionGuard permission={PERMISSIONS.STUDENT.ENROLLMENT.CREATE}>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create Enrollment
          </Button>
        </PermissionGuard>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No enrollment records found.</p>
          <PermissionGuard permission={PERMISSIONS.STUDENT.ENROLLMENT.CREATE}>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Create Enrollment
            </Button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              studentId={studentId}
              lookups={lookups}
            />
          ))}
        </div>
      )}

      <EnrollmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        studentId={studentId}
      />
    </div>
  )
}
