import { GraduationCap, Users, Building2, Activity, BarChart3, TrendingUp } from 'lucide-react'

const STATS = [
  // { icon: Users, label: 'Students', value: '10,000+' },
  // { icon: Building2, label: 'Schools', value: '500+' },
  // { icon: Activity, label: 'Uptime', value: '99.9%' },
]

export function BrandingPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative flex-col bg-primary overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary-foreground)/0.08)_0%,_transparent_60%)]" />

      <div className="relative z-10 flex flex-col h-full p-10 text-primary-foreground">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Deito School</span>
        </div>

        {/* Hero text */}
        <div className="mt-auto mb-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            School Management
          </h1>
          <p className="mt-4 text-base text-primary-foreground/75 leading-relaxed max-w-sm">
            Manage Students, Enrollment, Academic Operations, Billing and Finance from a single platform.
          </p>
        </div>

        {/* Dashboard preview illustration */}
        <div className="mb-8 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm overflow-hidden">
          <div className="p-4 border-b border-primary-foreground/15 flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-primary-foreground/30" />
            <div className="size-2.5 rounded-full bg-primary-foreground/30" />
            <div className="size-2.5 rounded-full bg-primary-foreground/30" />
            <span className="ml-2 text-xs text-primary-foreground/50 font-mono">dashboard.deito.school</span>
          </div>
          <div className="p-5 space-y-3">
            {/* Simulated stat row */}
            <div className="grid grid-cols-3 gap-2">
              {['1,240', '48', '$92K'].map((val, i) => (
                <div key={i} className="rounded-lg bg-primary-foreground/10 p-2.5">
                  <div className="text-[10px] text-primary-foreground/50 mb-1">
                    {['Students', 'Classes', 'Revenue'][i]}
                  </div>
                  <div className="text-sm font-bold text-primary-foreground">{val}</div>
                </div>
              ))}
            </div>
            {/* Simulated chart bars */}
            <div className="rounded-lg bg-primary-foreground/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-primary-foreground/50">Enrollment Trend</span>
                <BarChart3 className="size-3 text-primary-foreground/40" />
              </div>
              <div className="flex items-end gap-1 h-10">
                {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary-foreground/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            {/* Simulated activity rows */}
            <div className="space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-primary-foreground/20" />
                  <div className="h-2 flex-1 rounded bg-primary-foreground/15" />
                  <div className="h-2 w-10 rounded bg-primary-foreground/10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm p-3 text-center"
            >
              <Icon className="mx-auto mb-1.5 size-4 text-primary-foreground/70" />
              <div className="text-lg font-bold text-primary-foreground">{value}</div>
              <div className="text-[11px] text-primary-foreground/60">{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-6 flex items-center gap-2 text-xs text-primary-foreground/40">
          <TrendingUp className="size-3" />
          <span>Trusted by leading educational institutions</span>
        </div>
      </div>
    </div>
  )
}
