import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: string
  options: EChartsOption
  height?: number
  isLoading?: boolean
  className?: string
}

export function ChartCard({
  title,
  subtitle,
  options,
  height = 280,
  isLoading = false,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {isLoading ? (
          <div className="px-6" style={{ height }}>
            <Skeleton className="h-full w-full rounded" />
          </div>
        ) : (
          <ReactECharts
            option={options}
            style={{ height }}
            opts={{ renderer: 'canvas' }}
            notMerge
            lazyUpdate
          />
        )}
      </CardContent>
    </Card>
  )
}
