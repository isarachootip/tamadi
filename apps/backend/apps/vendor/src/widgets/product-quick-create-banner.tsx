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
    <Container className="mb-4 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Heading level="h2">เพิ่มสินค้าพร้อมราคาและสต็อกในหน้าเดียว</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            สร้างสินค้าใหม่ ตัวเลือก ราคา (THB) และจำนวนสต็อกจบครบในขั้นตอนเดียว
            พร้อมตั้งค่าคลังสินค้าและค่าจัดส่งอัตโนมัติสำหรับร้านใหม่
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={() => navigate("/categories")}
          >
            <Tag />
            สร้างหมวดหมู่สินค้า
          </Button>
          <Button
            type="button"
            size="small"
            variant="primary"
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
