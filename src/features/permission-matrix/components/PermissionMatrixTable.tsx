import { Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import type { PermissionGroupInfo, PermissionInfo } from '#/generated/model'

interface PermissionMatrixTableProps {
  groups: PermissionGroupInfo[]
  assignedIds: Set<string>
  originalIds: Set<string>
  roleName: string
  onToggle: (permId: string, checked: boolean) => void
  onGrantAll: () => void
  onRevokeAll: () => void
  readOnly?: boolean
}

const ACTION_ORDER = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT']
const ACTION_LABELS: Record<string, string> = { UPDATE: 'Edit' }

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? (action.charAt(0) + action.slice(1).toLowerCase())
}

function formatResource(resource: string): string {
  return resource
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function deriveActions(groups: PermissionGroupInfo[]): string[] {
  const seen = new Set<string>()
  for (const g of groups) {
    for (const p of g.permissions ?? []) {
      if (p.action) seen.add(p.action)
    }
  }
  return [...seen].sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a)
    const ib = ACTION_ORDER.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b)
  })
}

function groupByResource(perms: PermissionInfo[]): Map<string, Map<string, PermissionInfo>> {
  const map = new Map<string, Map<string, PermissionInfo>>()
  for (const p of perms) {
    const res = p.resource ?? 'Unknown'
    if (!map.has(res)) map.set(res, new Map())
    if (p.action) map.get(res)!.set(p.action, p)
  }
  return map
}

interface CheckboxCellProps {
  perm: PermissionInfo | undefined
  assignedIds: Set<string>
  originalIds: Set<string>
  onToggle: (permId: string, checked: boolean) => void
  readOnly: boolean
}

function CheckboxCell({ perm, assignedIds, originalIds, onToggle, readOnly }: CheckboxCellProps) {
  if (!perm?.id) {
    return (
      <td className="px-3.5 py-[11px] border-b border-border/40 text-center">
        <div className="flex items-center justify-center">
          <span className="text-border select-none">—</span>
        </div>
      </td>
    )
  }

  const isChecked = assignedIds.has(perm.id)
  const wasChecked = originalIds.has(perm.id)
  const isModified = isChecked !== wasChecked

  return (
    <td className="px-3.5 py-[11px] border-b border-border/40 text-center">
      <div className="flex items-center justify-center">
        <button
          disabled={readOnly}
          onClick={() => onToggle(perm.id!, !isChecked)}
          className={cn(
            'size-5 rounded flex items-center justify-center border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            isChecked
              ? 'bg-primary border-primary'
              : 'bg-background border-border hover:border-primary/60',
            isModified && isChecked && 'ring-2 ring-green-500 ring-offset-1',
            isModified && !isChecked && 'ring-2 ring-red-400/70 ring-offset-1',
            readOnly && 'cursor-default opacity-70'
          )}
          title={perm.description ?? perm.code}
        >
          {isChecked && <Check className="size-3 text-white stroke-[3]" />}
        </button>
      </div>
    </td>
  )
}

export function PermissionMatrixTable({
  groups,
  assignedIds,
  originalIds,
  roleName,
  onToggle,
  onGrantAll,
  onRevokeAll,
  readOnly = false,
}: PermissionMatrixTableProps) {
  const actions = deriveActions(groups)

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card">
        <p className="text-[13px] font-bold text-foreground">
          Module Permissions —{' '}
          <span className="text-primary">{roleName}</span>
        </p>
        {!readOnly && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onGrantAll}>
              Grant All
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onRevokeAll}>
              Revoke All
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground border-b-2 border-border bg-muted/30 whitespace-nowrap w-[200px]">
                Module / Feature
              </th>
              {actions.map((action) => (
                <th
                  key={action}
                  className="px-3.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground border-b-2 border-border bg-muted/30 whitespace-nowrap"
                >
                  {formatAction(action)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const byResource = groupByResource(group.permissions ?? [])
              return (
                <>
                  {/* Module section header */}
                  <tr key={`section-${group.module}`}>
                    <td
                      colSpan={actions.length + 1}
                      className="px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted-foreground bg-muted/20 border-b border-border/60"
                    >
                      {group.module}
                    </td>
                  </tr>
                  {/* Resource rows */}
                  {[...byResource.entries()].map(([resource, actionMap]) => (
                    <tr
                      key={`${group.module}-${resource}`}
                      className="hover:[&>td]:bg-primary/5 hover:[&>td:first-child]:bg-primary/10 transition-colors"
                    >
                      <td className="px-3.5 py-[11px] border-b border-border/40 text-[13.5px] font-semibold text-foreground bg-card border-r border-border whitespace-nowrap">
                        {formatResource(resource)}
                      </td>
                      {actions.map((action) => (
                        <CheckboxCell
                          key={action}
                          perm={actionMap.get(action)}
                          assignedIds={assignedIds}
                          originalIds={originalIds}
                          onToggle={onToggle}
                          readOnly={readOnly}
                        />
                      ))}
                    </tr>
                  ))}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
