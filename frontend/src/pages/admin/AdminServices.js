import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminServices() {
  return (
    <AdminCrudList
      title="Services"
      description="Shown in the Services room as capability dossiers."
      schema={COLLECTION_SCHEMAS.services}
      emptyLabel="service"
      reorderKey="services"
      columns={[
        { key: "title", label: "Title" },
        { key: "is_published", label: "Published", render: (i) => (i.is_published ? "Yes" : "No") },
      ]}
      apiMethods={{
        list: adminApi.listServices,
        create: adminApi.createService,
        update: adminApi.updateService,
        remove: adminApi.deleteService,
        reorder: (items) => adminApi.reorder("services", items),
      }}
    />
  );
}
