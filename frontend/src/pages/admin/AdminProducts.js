import AdminCrudList from "@/components/admin/AdminCrudList";
import { adminApi } from "@/lib/api";
import { COLLECTION_SCHEMAS } from "@/lib/collectionSchemas";

export default function AdminProducts() {
  return (
    <AdminCrudList
      title="Products"
      description="The Products & quick help carousel under Services: kits and short engagements sold on Gumroad or Stripe. Drag to reorder."
      schema={COLLECTION_SCHEMAS.products}
      emptyLabel="product"
      reorderKey="products"
      columns={[
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "kind", label: "Type" },
        { key: "is_published", label: "Published", render: (i) => (i.is_published ? "Yes" : "No") },
      ]}
      apiMethods={{
        list: adminApi.listProducts,
        create: adminApi.createProduct,
        update: adminApi.updateProduct,
        remove: adminApi.deleteProduct,
        reorder: (items) => adminApi.reorder("products", items),
      }}
    />
  );
}
