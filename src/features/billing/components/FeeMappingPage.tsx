import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Pencil,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { StatsCard } from '#/components/shared/stats-card'
import { StatusBadge } from '#/components/shared/status-badge/StatusBadge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  useMappings,
  useActivateMapping,
  useDeactivateMapping,
} from '../hooks/useMappings'
import { useActivePrograms } from '#/features/academic/hooks/usePrograms'
import { useProgramLevelsByProgram } from '#/features/academic/hooks/useProgramLevels'
import { useFeeTemplatesActive } from '#/features/fees/hooks/useFeeTemplates'
import { MappingModal } from './MappingModal'
import type { MappingResponse, ProgramLevelSummary } from '#/generated/model'

export function FeeMappingPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [preselectedLevelId, setPreselectedLevelId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<MappingResponse | null>(null)

  // Global stats — 3 small queries
  const { data: totalStats } = useMappings({ pagination: { page: 0, size: 1 } })
  const { data: activeStats } = useMappings({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })
  const { data: inactiveStats } = useMappings({
    filters: [{ field: 'status', operator: 'EQ', value: 'INACTIVE' }],
    pagination: { page: 0, size: 1 },
  })

  // Per-program data
  const { data: programs, isError: programsError } = useActivePrograms()
  const { data: levels } = useProgramLevelsByProgram(selectedProgramId)
  const { data: programMappings, isLoading: mappingsLoading } = useMappings(
    selectedProgramId
      ? {
          filters: [{ field: 'programId', operator: 'EQ', value: selectedProgramId }],
          pagination: { page: 0, size: 200 },
        }
      : { pagination: { page: 0, size: 0 } },
  )
  const { data: activeTemplates } = useFeeTemplatesActive()

  const activate = useActivateMapping()
  const deactivate = useDeactivateMapping()

  const templateMap = Object.fromEntries((activeTemplates ?? []).map((t) => [t.id, t]))
  const mappingByLevel = Object.fromEntries(
    (programMappings?.items ?? []).map((m) => [m.programLevelId!, m]),
  )

  const levelList = (levels ?? []) as ProgramLevelSummary[]
  const missingRules =
    selectedProgramId
      ? levelList.filter((l) => !mappingByLevel[l.id!]).length
      : 0

  const selectedProgram = (programs ?? []).find((p) => p.id === selectedProgramId)

  function openCreate(levelId?: string) {
    setPreselectedLevelId(levelId ?? null)
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(mapping: MappingResponse) {
    setEditTarget(mapping)
    setPreselectedLevelId(null)
    setModalOpen(true)
  }

  function handleModalClose(v: boolean) {
    setModalOpen(v)
    if (!v) {
      setEditTarget(null)
      setPreselectedLevelId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Mappings" value={totalStats?.total ?? 0} icon={BookOpen} />
        <StatsCard title="Active" value={activeStats?.total ?? 0} icon={CheckCircle2} />
        <StatsCard title="Inactive" value={inactiveStats?.total ?? 0} icon={XCircle} />
        <StatsCard
          title="Missing Rules"
          value={missingRules}
          icon={AlertTriangle}
        />
      </div>

      {programsError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load programs</AlertTitle>
          <AlertDescription>Could not connect to the server. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Split panel */}
      <div className="flex min-h-[500px] overflow-hidden rounded-lg border">
        {/* Left panel — program list */}
        <div className="w-[260px] shrink-0 overflow-y-auto border-r">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Programs</p>
          </div>
          {(programs ?? []).length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No active programs
            </p>
          ) : (
            (programs ?? []).map((program) => (
              <button
                key={program.id}
                type="button"
                onClick={() => setSelectedProgramId(program.id!)}
                className={cn(
                  'w-full border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50',
                  selectedProgramId === program.id &&
                    'border-l-2 border-l-primary bg-primary/5',
                )}
              >
                <p className="text-sm font-semibold">{program.name}</p>
                {program.code && (
                  <p className="text-xs text-muted-foreground">{program.code}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Right panel — mapping matrix */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!selectedProgramId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <BookOpen className="mx-auto mb-3 size-10 opacity-30" />
                <p className="text-sm font-medium">Select a program</p>
                <p className="text-xs">
                  Choose a program on the left to view its fee template mappings.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Right panel header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="font-semibold">
                    {selectedProgram?.name ?? ''} — Fee Template Mapping
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {levelList.length} level{levelList.length !== 1 ? 's' : ''} ·{' '}
                    {(programMappings?.total ?? 0)} mapping
                    {(programMappings?.total ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => openCreate()}>
                  <Plus className="size-3.5" />
                  Add Mapping
                </Button>
              </div>

              {/* Mapping table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5 text-left">Level</th>
                      <th className="px-4 py-2.5 text-left">Fee Template</th>
                      <th className="px-4 py-2.5 text-left">Effective Date</th>
                      <th className="px-4 py-2.5 text-left">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappingsLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : levelList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No levels found for this program.
                        </td>
                      </tr>
                    ) : (
                      levelList
                        .slice()
                        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                        .map((level) => {
                          const mapping = mappingByLevel[level.id!] as
                            | MappingResponse
                            | undefined
                          const template = mapping?.feeTemplateId
                            ? templateMap[mapping.feeTemplateId]
                            : undefined

                          return (
                            <tr
                              key={level.id}
                              className="border-b last:border-0 hover:bg-muted/30"
                            >
                              {/* Level */}
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                  {level.name}
                                </span>
                              </td>

                              {/* Fee Template */}
                              <td className="px-4 py-3">
                                {mapping ? (
                                  <span className="font-medium text-foreground">
                                    {template?.name ?? mapping.feeTemplateId ?? '—'}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <AlertTriangle className="size-3.5 text-amber-500" />
                                    No mapping set
                                  </span>
                                )}
                              </td>

                              {/* Effective Date */}
                              <td className="px-4 py-3 text-muted-foreground">
                                {mapping?.effectiveDate ?? '—'}
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3">
                                {mapping ? (
                                  <StatusBadge
                                    status={mapping.status === 'ACTIVE' ? 'active' : 'inactive'}
                                  />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-right">
                                {mapping ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="size-8">
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEdit(mapping)}>
                                        <Pencil className="mr-2 size-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {mapping.status === 'INACTIVE' && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            activate.mutate({ id: mapping.id!, existing: mapping })
                                          }
                                          disabled={activate.isPending}
                                        >
                                          <CheckCircle2 className="mr-2 size-4" />
                                          Activate
                                        </DropdownMenuItem>
                                      )}
                                      {mapping.status === 'ACTIVE' && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            deactivate.mutate({
                                              id: mapping.id!,
                                              existing: mapping,
                                            })
                                          }
                                          disabled={deactivate.isPending}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <XCircle className="mr-2 size-4" />
                                          Deactivate
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={() => openCreate(level.id!)}
                                  >
                                    <Plus className="size-3" />
                                    Add Mapping
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedProgramId && (
        <MappingModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          programId={selectedProgramId}
          preselectedLevelId={preselectedLevelId}
          editTarget={editTarget}
        />
      )}
    </div>
  )
}
