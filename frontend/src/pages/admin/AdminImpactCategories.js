import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminImpactCategories() {
  return (
    <AdminCrudList
      title="Impact Categories"
      description="Tiles on the Media & Impact page. Order here is the order on the site."
      schema={COLLECTION_SCHEMAS.impact_categories}
      emptyLabel="category"
      reorderKey="impact_categories"
      moveOnDelete={{ value: "key", label: "label" }}
      columns={[
        { key: "label", label: "Label" },
        { key: "key", label: "Key" },
        { key: "icon", label: "Icon" },
        { key: "is_published", label: "Visible", render: (c) => (c.is_published ? "Yes" : "Hidden") },
      ]}
      apiMethods={{
        list: adminApi.listImpactCategories,
        create: adminApi.createImpactCategory,
        update: adminApi.updateImpactCategory,
        remove: adminApi.deleteImpactCategory,
        reorder: (items) => adminApi.reorder("impact_categories", items),
      }}
    />
  );
}
