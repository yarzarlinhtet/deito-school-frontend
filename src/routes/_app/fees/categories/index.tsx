import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Tags, CheckCircle2, FileText } from 'lucide-react'
import { PageContainer, PageHeader } from '#/components/shared/page-layout'
import { StatsCard } from '#/components/shared/stats-card'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { FeeCategoryTable } from '#/features/fees/components/FeeCategoryTable'
import { FeeCategoryModal } from '#/features/fees/components/FeeCategoryModal'
import { FeeTemplateTable } from '#/features/fees/components/FeeTemplateTable'
import { FeeTemplateModal } from '#/features/fees/components/FeeTemplateModal'
import { useFeeCategories } from '#/features/fees/hooks/useFeeCategories'
import { useFeeTemplates } from '#/features/fees/hooks/useFeeTemplates'

export const Route = createFileRoute('/_app/fees/categories/')({
  component: FeeCategoriesPage,
})

function FeeCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories')
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)

  const { data: allCategories } = useFeeCategories({ size: 1 })
  const { data: activeCategories } = useFeeCategories({ status: 'ACTIVE', size: 1 })
  const { data: allTemplates } = useFeeTemplates({ pagination: { page: 0, size: 1 } })
  const { data: activeTemplates } = useFeeTemplates({
    filters: [{ field: 'status', operator: 'EQ', value: 'ACTIVE' }],
    pagination: { page: 0, size: 1 },
  })

  return (
    <PageContainer>
      <PageHeader
        title="Fee Categories & Templates"
        description="Manage fee structures, categories, and reusable templates"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCreateTemplateOpen(true)} className="w-full gap-2 sm:w-auto">
              <Plus className="size-4" />
              New Template
            </Button>
            <Button onClick={() => setCreateCategoryOpen(true)} className="w-full gap-2 sm:w-auto">
              <Plus className="size-4" />
              New Category
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Categories" value={allCategories?.total ?? 0} icon={Tags} />
        <StatsCard title="Active Categories" value={activeCategories?.total ?? 0} icon={CheckCircle2} />
        <StatsCard title="Total Templates" value={allTemplates?.total ?? 0} icon={FileText} />
        <StatsCard title="Active Templates" value={activeTemplates?.total ?? 0} icon={CheckCircle2} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-5">
          <TabsTrigger value="categories">Fee Categories</TabsTrigger>
          <TabsTrigger value="templates">Fee Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <FeeCategoryTable />
        </TabsContent>

        <TabsContent value="templates">
          <FeeTemplateTable />
        </TabsContent>
      </Tabs>

      <FeeCategoryModal open={createCategoryOpen} onOpenChange={setCreateCategoryOpen} />
      <FeeTemplateModal open={createTemplateOpen} onOpenChange={setCreateTemplateOpen} />
    </PageContainer>
  )
}
