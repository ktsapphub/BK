import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";
import { Badge } from "@/components/ui/badge";

export default function AdminProjects() {
  return (
    <AdminCrudList
      title="Projects"
      description="Shown in the Projects room and on individual case-study pages."
      schema={COLLECTION_SCHEMAS.projects}
      emptyLabel="project"
      reorderKey="projects"
      columns={[
        { key: "title", label: "Title" },
        { key: "status", label: "Status", render: (i) => <Badge variant="outline">{i.status}</Badge> },
        { key: "is_published", label: "Published", render: (i) => (i.is_published ? "Yes" : "No") },
      ]}
      apiMethods={{
        list: adminApi.listProjects,
        create: adminApi.createProject,
        update: adminApi.updateProject,
        remove: adminApi.deleteProject,
        reorder: (items) => adminApi.reorder("projects", items),
      }}
    />
  );
}
