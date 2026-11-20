import { Plus, Tag } from "@medusajs/icons";
import { Button, Container, Heading, Text } from "@medusajs/ui";
import { defineWidgetConfig } from "@mercurjs/dashboard-sdk";
import { useNavigate } from "react-router-dom";

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default function ProductQuickCreateBanner() {
  const navigate = useNavigate();

  return (
    <Container className="mb-4 px-4 py-4 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="space-y-0.5">
          <Heading level="h2">เพิ่มสินค้าพร้อมราคาและสต็อกในหน้าเดียว</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            สร้างสินค้าใหม่ ตัวเลือก ราคา (THB) และจำนวนสต็อกจบครบในขั้นตอนเดียว
            พร้อมตั้งค่าคลังสินค้าและค่าจัดส่งอัตโนมัติสำหรับร้านใหม่
          </Text>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="small"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => navigate("/categories")}
          >
            <Tag />
            สร้างหมวดหมู่สินค้า
          </Button>
          <Button
            type="button"
            size="small"
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => navigate("/quick-product")}
          >
            <Plus />
            เพิ่มสินค้าด่วน (ราคา + สต็อก)
          </Button>
        </div>
      </div>
    </Container>
  );
}
