import type { AppLocale } from "./types";

export interface AccountCopy {
  readonly langHeading: string;
  readonly themeHeading: string;
  readonly welcomeTitle: string;
  readonly welcomeSub: string;
  readonly loginBtn: string;
  readonly registerBtn: string;
  readonly memberLabel: string;
  readonly lineLinked: string;
  readonly lineConnect: string;
  readonly addressTitle: string;
  readonly addressSavedPrefix: string;
  readonly ordersTitle: string;
  readonly noOrders: string;
  readonly logoutBtn: string;
}

export const ACCOUNT_COPY: Record<AppLocale, AccountCopy> = {
  th: {
    langHeading: "ภาษาและสกุลเงินอ้างอิง (TH / EN / 中文)",
    themeHeading: "การแสดงผลหน้าจอ (Light / Dark Mode)",
    welcomeTitle: "ยินดีต้อนรับสู่ Tamadee",
    welcomeSub:
      "เข้าสู่ระบบเพื่อซิงค์ตะกร้าสินค้า จัดการที่อยู่จัดส่ง และติดตามออเดอร์แยกร้าน",
    loginBtn: "เข้าสู่ระบบ",
    registerBtn: "สมัครสมาชิก",
    memberLabel: "บัญชีสมาชิก Tamadee",
    lineLinked: "ผูกแจ้งเตือน LINE น้องทำมะดิแล้ว ✓",
    lineConnect: "+ เชื่อมต่อแจ้งเตือน LINE",
    addressTitle: "ที่อยู่จัดส่งในประเทศไทย",
    addressSavedPrefix: "บันทึกแล้ว",
    ordersTitle: "ประวัติคำสั่งซื้อ",
    noOrders:
      "ยังไม่มีรายการคำสั่งซื้อ เมื่อสั่งซื้อระบบจะแสดงสถานะแยกตามร้านที่นี่",
    logoutBtn: "ออกจากระบบ",
  },
  en: {
    langHeading: "Language & Reference Currency (TH / EN / 中文)",
    themeHeading: "Appearance (Light / Dark Mode)",
    welcomeTitle: "Welcome to Tamadee",
    welcomeSub:
      "Sign in to sync your shopping bag, manage delivery addresses, and track orders",
    loginBtn: "Sign In",
    registerBtn: "Create Account",
    memberLabel: "Tamadee Member",
    lineLinked: "LINE Notifications Linked ✓",
    lineConnect: "+ Connect LINE Alerts",
    addressTitle: "Delivery Addresses in Thailand",
    addressSavedPrefix: "Saved:",
    ordersTitle: "Order History",
    noOrders: "No orders yet. Multi-seller shipment tracking will appear here.",
    logoutBtn: "Sign Out",
  },
  zh: {
    langHeading: "语言与参考汇率 (TH / EN / 中文)",
    themeHeading: "界面外观 (Light / Dark Mode)",
    welcomeTitle: "欢迎来到 Tamadee",
    welcomeSub:
      "登录即可同步购物车、管理泰国收货地址并追踪各店铺包裹进度",
    loginBtn: "登录账号",
    registerBtn: "注册会员",
    memberLabel: "Tamadee 会员账号",
    lineLinked: "已绑定 LINE 通知 ✓",
    lineConnect: "+ 绑定 LINE 通知",
    addressTitle: "泰国收货地址管理",
    addressSavedPrefix: "已保存：",
    ordersTitle: "历史订单",
    noOrders: "暂无订单记录，下单后可在此按店铺追踪发货状态。",
    logoutBtn: "退出登录",
  },
};
