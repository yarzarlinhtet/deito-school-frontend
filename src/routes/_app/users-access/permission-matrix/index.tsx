import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { PageContainer } from '#/components/shared/page-layout/PageContainer'
import { PageHeader } from '#/components/shared/page-layout/PageHeader'
import { PermissionGuard } from '#/components/shared/permission-guard'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { PERMISSIONS } from '#/constants/permissions'
import { RoleSelector } from '#/features/permission-matrix/components/RoleSelector'
import { PermissionMatrixTable } from '#/features/permission-matrix/components/PermissionMatrixTable'
import { SaveBar } from '#/features/permission-matrix/components/SaveBar'
import { useMatrix, useReplacePermissions } from '#/features/permission-matrix/hooks/usePermissionMatrix'

export const Route = createFileRoute('/_app/users-access/permission-matrix/')({
  component: PermissionMatrixPage,
})

function eqSets(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

function PermissionMatrixPage() {
  const { data: matrix, isLoading } = useMatrix()
  const { mutate: replace, isPending } = useReplacePermissions()

  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [pendingByRole, setPendingByRole] = useState<Record<string, Set<string>>>({})

  // Initialize pending state from server once matrix loads
  useEffect(() => {
    if (!matrix?.assignments || !matrix.roles) return
    const initial: Record<string, Set<string>> = {}
    for (const [id, perms] of Object.entries(matrix.assignments)) {
      initial[id] = new Set(perms)
    }
    setPendingByRole(initial)
    setSelectedRoleId((prev) => prev || matrix.roles?.[0]?.id || '')
  }, [matrix])

  const roles = matrix?.roles ?? []
  const groups = matrix?.permissionGroups ?? []
  const selectedRole = roles.find((r) => r.id === selectedRoleId)

  const originalIds = new Set<string>(matrix?.assignments?.[selectedRoleId] ?? [])
  const pendingIds: Set<string> = pendingByRole[selectedRoleId] ?? originalIds
  const isDirty = !eqSets(originalIds, pendingIds)

  const allPermIds = groups.flatMap((g) => g.permissions?.map((p) => p.id!).filter(Boolean) ?? [])
  const totalCount = allPermIds.length
  const assignedCount = [...pendingIds].filter((id) => allPermIds.includes(id)).length

  const handleToggle = useCallback((permId: string, checked: boolean) => {
    setPendingByRole((prev) => {
      const next = new Set(prev[selectedRoleId] ?? originalIds)
      checked ? next.add(permId) : next.delete(permId)
      return { ...prev, [selectedRoleId]: next }
    })
  }, [selectedRoleId, originalIds])

  const handleGrantAll = useCallback(() => {
    setPendingByRole((prev) => ({ ...prev, [selectedRoleId]: new Set(allPermIds) }))
  }, [selectedRoleId, allPermIds])

  const handleRevokeAll = useCallback(() => {
    setPendingByRole((prev) => ({ ...prev, [selectedRoleId]: new Set<string>() }))
  }, [selectedRoleId])

  const handleSave = useCallback(() => {
    if (!selectedRoleId) return
    replace({ roleId: selectedRoleId, permissionIds: [...pendingIds] })
  }, [selectedRoleId, pendingIds, replace])

  const handleDiscard = useCallback(() => {
    setPendingByRole((prev) => ({ ...prev, [selectedRoleId]: new Set(originalIds) }))
  }, [selectedRoleId, originalIds])

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN.PERMISSION_MATRIX.VIEW}>
      <div className="flex flex-col">
        <PageContainer>
          <div className="space-y-5 pb-6">
            <PageHeader
              title="Permission Matrix"
              description="Configure module-level permissions per role — changes require Save to apply."
              actions={
                <PermissionGuard permission={PERMISSIONS.ADMIN.PERMISSION_MATRIX.UPDATE}>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscard}
                      disabled={!isDirty || isPending}
                    >
                      Reset to Defaults
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!isDirty || isPending}
                    >
                      {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                      Save Permissions
                    </Button>
                  </div>
                </PermissionGuard>
              }
            />

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            ) : (
              <>
                {roles.length > 0 && (
                  <RoleSelector
                    roles={roles}
                    selectedId={selectedRoleId}
                    onChange={setSelectedRoleId}
                  />
                )}

                {groups.length > 0 && selectedRoleId && (
                  <PermissionGuard
                    permission={PERMISSIONS.ADMIN.PERMISSION_MATRIX.UPDATE}
                    fallback={
                      <PermissionMatrixTable
                        groups={groups}
                        assignedIds={pendingIds}
                        originalIds={originalIds}
                        roleName={selectedRole?.name ?? ''}
                        onToggle={handleToggle}
                        onGrantAll={handleGrantAll}
                        onRevokeAll={handleRevokeAll}
                        readOnly
                      />
                    }
                  >
                    <PermissionMatrixTable
                      groups={groups}
                      assignedIds={pendingIds}
                      originalIds={originalIds}
                      roleName={selectedRole?.name ?? ''}
                      onToggle={handleToggle}
                      onGrantAll={handleGrantAll}
                      onRevokeAll={handleRevokeAll}
                    />
                  </PermissionGuard>
                )}
              </>
            )}
          </div>
        </PageContainer>

        <PermissionGuard permission={PERMISSIONS.ADMIN.PERMISSION_MATRIX.UPDATE}>
          <SaveBar
            roleName={selectedRole?.name ?? ''}
            assignedCount={assignedCount}
            totalCount={totalCount}
            isDirty={isDirty}
            isPending={isPending}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        </PermissionGuard>
      </div>
    </PermissionGuard>
  )
}
