import { cn } from '#/lib/utils'
import type { RoleInfo } from '#/generated/model'

interface RoleSelectorProps {
  roles: RoleInfo[]
  selectedId: string
  onChange: (id: string) => void
}

export function RoleSelector({ roles, selectedId, onChange }: RoleSelectorProps) {
  return (
    <div className="rounded-lg border bg-card px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          Editing role:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => onChange(r.id!)}
              className={cn(
                'px-3 py-1 rounded-full text-[12.5px] font-semibold border transition-all',
                r.id === selectedId
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
