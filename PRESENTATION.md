# Restroflow — Restaurant Management System
# Restroflow — ระบบจัดการร้านอาหาร
# Restroflow — 레스토랑 관리 시스템

---

## System Overview | ภาพรวมระบบ | 시스템 개요

```
┌─────────────────────────────────────────────────────────┐
│                    RESTROFLOW                           │
│              Restaurant Management System               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │ 🍽️ Orders │  │ 🪑 Queue  │  │ 📋 Menu   │             │
│   │ สั่งอาหาร  │  │ คิว&โต๊ะ   │  │  เมนู     │             │
│   │ 주문관리    │  │ 대기&테이블 │  │ 메뉴관리   │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │ 📦 Stock  │  │ 📊 Reports│  │ 👥 Staff  │             │
│   │ สต๊อก     │  │  รายงาน   │  │ จัดการทีม  │             │
│   │ 재고관리    │  │  보고서    │  │ 직원관리   │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│   ┌──────────┐  ┌──────────────────────────┐           │
│   │ 📱 QR    │  │ 🌐 Multi-language (4)    │           │
│   │ คิวอาร์โค้ด│  │ TH / EN / JA / KO       │           │
│   │ QR코드    │  │ ไทย / อังกฤษ / ญี่ปุ่น / เกาหลี │           │
│   └──────────┘  └──────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Order Management | ระบบสั่งอาหาร | 주문 관리

```
Customer scans QR → Views menu → Places order → Kitchen prepares → Served
ลูกค้าสแกน QR → ดูเมนู → สั่งอาหาร → ครัวเตรียม → เสิร์ฟ
고객 QR 스캔 → 메뉴 확인 → 주문 → 주방 조리 → 서빙

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PENDING │ →  │PREPARING │ →  │  READY   │ →  │COMPLETED │
│  รอดำเนินการ│    │ กำลังทำ    │    │  พร้อมเสิร์ฟ│    │  เสร็จแล้ว  │
│  대기 중    │    │  조리 중    │    │  준비 완료  │    │   완료     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Features | ฟีเจอร์ | 기능:**

| EN | TH | KO |
|---|---|---|
| Dine-in / Takeaway / Delivery | ทานที่ร้าน / สั่งกลับบ้าน / เดลิเวอรี่ | 매장 / 포장 / 배달 |
| Real-time status tracking | ติดตามสถานะแบบ real-time | 실시간 상태 추적 |
| QR code ordering (customer self-service) | สั่งอาหารผ่าน QR code (ลูกค้าสั่งเอง) | QR코드 주문 (셀프 서비스) |
| Kitchen display with status buttons | หน้าจอครัวพร้อมปุ่มอัพเดทสถานะ | 주방 디스플레이 + 상태 버튼 |
| Checkout with multiple payment methods | เช็คบิลรองรับหลายวิธีจ่ายเงิน | 다양한 결제 수단 |
| Auto print receipt | พิมพ์ใบเสร็จอัตโนมัติ | 영수증 자동 출력 |

---

## 2. Queue & Table Management | ระบบคิวและโต๊ะ | 대기 & 테이블 관리

```
┌─────────────── Floor Map ───────────────┐
│                แผนผังร้าน                  │
│                좌석 배치도                   │
│                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │ T1 │ │ T2 │ │ T3 │ │ T4 │  Regular   │
│  │ 2p │ │ 2p │ │ 4p │ │ 6p │  Tables    │
│  │ ✓  │ │ ●  │ │ ✓  │ │ ◆  │  โต๊ะทั่วไป  │
│  └────┘ └────┘ └────┘ └────┘  일반 테이블  │
│                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │ T5 │ │ T6 │ │ T7 │ │ T8 │            │
│  │ 2p │ │ 4p │ │ 4p │ │ 6p │            │
│  └────┘ └────┘ └────┘ └────┘            │
│                                          │
│  🏛️ Banquet Rooms | ห้องจัดเลี้ยง | 연회장  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ R1   │ │ R2   │ │ R3   │ │ R4   │   │
│  │ 8p   │ │ 10p  │ │ 20p  │ │ 40p  │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                          │
│  ✓ Available  ● Occupied  ◆ Reserved    │
│    ว่าง         มีลูกค้า      จอง          │
│    빈자리        사용중         예약          │
└──────────────────────────────────────────┘
```

**Features | ฟีเจอร์ | 기능:**

| EN | TH | KO |
|---|---|---|
| 12 regular tables (2-8 seats) | โต๊ะปกติ 12 ตัว (2-8 ที่นั่ง) | 일반 테이블 12개 (2-8석) |
| 4 banquet rooms (8-40 seats) | ห้องจัดเลี้ยง 4 ห้อง (8-40 ที่นั่ง) | 연회장 4개 (8-40석) |
| Smart capacity validation | ตรวจสอบจำนวนที่นั่งอัตโนมัติ | 좌석 수 자동 검증 |
| Reservation with time slot | จองโต๊ะพร้อมระบุเวลา | 시간대별 예약 |
| Auto-cancel expired reservations | ยกเลิกจองอัตโนมัติเมื่อเลยเวลา | 만료 예약 자동 취소 |
| Reservation summary dashboard | สรุปรายการจองในหน้าเดียว | 예약 현황 대시보드 |
| Queue system with call & seat | ระบบคิว เรียก-เข้านั่ง | 대기 시스템 (호출 & 착석) |

---

## 3. Menu Management | ระบบจัดการเมนู | 메뉴 관리

```
┌─────────────────────────────────────────┐
│  📋 Menu Item                           │
│  ┌─────────────────┐                    │
│  │   🖼️ Food Photo  │  Multi-language   │
│  │   รูปอาหารจริง    │  หลายภาษา         │
│  │   실제 음식 사진    │  다국어 지원        │
│  └─────────────────┘                    │
│                                          │
│  TH: ข้าวผัดกุ้ง                           │
│  EN: Shrimp Fried Rice                   │
│  JA: エビチャーハン                          │
│  KO: 새우볶음밥                             │
│                                          │
│  ฿120  ⭐ Featured  ✅ Available         │
│  Recipe: 🍚 Rice 200g + 🦐 Shrimp 100g  │
└─────────────────────────────────────────┘
```

**Features | ฟีเจอร์ | 기능:**

| EN | TH | KO |
|---|---|---|
| Multi-language menu (TH/EN/JA/KO) | เมนูหลายภาษา (ไทย/อังกฤษ/ญี่ปุ่น/เกาหลี) | 다국어 메뉴 (태국어/영어/일본어/한국어) |
| Upload food photos | อัพโหลดรูปอาหารจริง | 음식 사진 업로드 |
| Category management | จัดหมวดหมู่ | 카테고리 관리 |
| Toggle available/unavailable | เปิด-ปิดขายได้ทันที | 판매 상태 전환 |
| Featured items highlight | ไฮไลท์เมนูแนะนำ | 추천 메뉴 하이라이트 |
| Recipe & ingredient linking | เชื่อมสูตรอาหารกับวัตถุดิบ | 레시피 & 재료 연동 |

---

## 4. Inventory Management | ระบบสต๊อก | 재고 관리

```
Material Tracking Flow | กระบวนการติดตามวัตถุดิบ | 재료 추적 흐름

  📦 Receive Stock        🍳 Order Placed         📉 Low Stock Alert
  รับของเข้าสต๊อก           สั่งอาหาร → ตัดสต๊อก      แจ้งเตือนสต๊อกต่ำ
  재고 입고                주문 → 재고 차감            재고 부족 알림

  ┌────────┐    ┌────────┐    ┌────────┐
  │ Stock  │ →  │  Auto  │ →  │  Low   │
  │  IN    │    │ Deduct │    │ Stock  │
  │  +50   │    │  -3    │    │  ⚠️    │
  └────────┘    └────────┘    └────────┘
```

---

## 5. Reports & Analytics | รายงาน | 보고서

| Feature | ฟีเจอร์ | 기능 |
|---|---|---|
| Daily revenue chart (7/30 days) | กราฟยอดขายรายวัน (7/30 วัน) | 일별 매출 차트 (7/30일) |
| Top selling items ranking | อันดับเมนูขายดี | 인기 메뉴 순위 |
| Hourly sales heatmap | ยอดขายตามชั่วโมง | 시간대별 매출 |
| Order history with details | ประวัติออเดอร์ย้อนหลัง | 주문 이력 상세 |

---

## 6. Staff & Access Control | จัดการทีมงาน | 직원 관리

```
┌────────────────────────────────────────────────────────┐
│  Role-Based Access Control (RBAC)                      │
│  ระบบสิทธิ์ตามตำแหน่ง | 역할 기반 접근 제어                  │
├──────────┬────────┬────────┬──────────┬────────────────┤
│   Role   │ Orders │ Queue  │ Inventory│   Menu         │
│  ตำแหน่ง  │ สั่งอาหาร│ คิว&โต๊ะ │  สต๊อก    │   เมนู         │
│   역할    │  주문   │ 대기    │   재고    │   메뉴         │
├──────────┼────────┼────────┼──────────┼────────────────┤
│ 👑 Owner │   ✅   │   ✅   │    ✅    │     ✅         │
│ เจ้าของร้าน│        │        │          │                │
│ 점장      │        │        │          │                │
├──────────┼────────┼────────┼──────────┼────────────────┤
│ 🙋 Front │   ✅   │   ✅   │    ❌    │     ❌         │
│ พนง.หน้าร้าน│        │        │          │                │
│ 홀 직원    │        │        │          │                │
├──────────┼────────┼────────┼──────────┼────────────────┤
│ 👨‍🍳Kitchen│   ✅*  │   ❌   │    ❌    │     ❌         │
│ พนง.ครัว  │ *สถานะเท่านั้น│        │          │                │
│ 주방 직원   │ *상태만  │        │          │                │
├──────────┼────────┼────────┼──────────┼────────────────┤
│ 📦 Stock │   ❌   │   ❌   │    ✅    │     ❌         │
│ พนง.สต๊อก │        │        │          │                │
│ 재고 직원   │        │        │          │                │
└──────────┴────────┴────────┴──────────┴────────────────┘
```

---

## 7. QR Code System | ระบบ QR Code | QR코드 시스템

```
┌────────────────────────────────────┐
│  Customer Flow | ขั้นตอนลูกค้า | 고객 흐름  │
│                                     │
│  📱 Scan QR on table               │
│     สแกน QR ที่โต๊ะ                   │
│     테이블 QR 스캔                     │
│         │                           │
│         ▼                           │
│  🌐 Choose language (TH/EN/JA/KO)  │
│     เลือกภาษา                        │
│     언어 선택                         │
│         │                           │
│         ▼                           │
│  📋 Browse menu with photos         │
│     ดูเมนูพร้อมรูปอาหาร                │
│     사진이 있는 메뉴 탐색                │
│         │                           │
│         ▼                           │
│  🛒 Add to cart + notes             │
│     เพิ่มลงตะกร้า + หมายเหตุ           │
│     장바구니 추가 + 메모                │
│         │                           │
│         ▼                           │
│  ✅ Place order → Kitchen           │
│     สั่งอาหาร → ส่งเข้าครัว            │
│     주문 완료 → 주방 전달               │
└────────────────────────────────────┘
```

---

## Tech Stack | เทคโนโลยี | 기술 스택

| Layer | Technology | Description |
|---|---|---|
| Frontend | **Next.js 16** + React 19 | App Router, Server/Client Components |
| Styling | **Tailwind CSS v4** | Dark/Light theme, CSS variables |
| Database | **Supabase** (PostgreSQL) | REST API, Real-time, Auth |
| Storage | **Supabase Storage** | Food photo uploads (5MB limit) |
| Auth | **Supabase Auth** | Email/Password + Role metadata |
| i18n | Custom context | 4 languages (TH/EN/JA/KO) |
| Deploy | **Vercel** | Auto-deploy from GitHub |

---

## Architecture | สถาปัตยกรรม | 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js 16  │────▶│   Supabase   │
│   เบราว์เซอร์  │     │  (Vercel)    │     │  (PostgreSQL)│
│   브라우저     │     │              │     │              │
│             │     │  ┌─────────┐ │     │  ┌─────────┐ │
│  📱 Mobile  │     │  │ App     │ │     │  │ REST API│ │
│  💻 Desktop │     │  │ Router  │ │     │  │ Auth    │ │
│  🖥️ Tablet  │     │  │ API     │ │     │  │ Storage │ │
│             │     │  │ Routes  │ │     │  │ Realtime│ │
│             │     │  └─────────┘ │     │  └─────────┘ │
└─────────────┘     └──────────────┘     └──────────────┘
```

---

## Database Schema | โครงสร้างฐานข้อมูล | 데이터베이스 스키마

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ MenuCategory │     │   MenuItem   │     │  RecipeItem  │
│──────────────│     │──────────────│     │──────────────│
│ id           │◀───┐│ id           │◀───┐│ id           │
│ name         │    ││ name         │    ││ menuItemId   │
│ order        │    ││ price        │    ││ inventoryId  │
└──────────────┘    ││ image        │    ││ quantity     │
                    ││ translations │    │└──────────────┘
                    ││ categoryId ──┘    │
                    │└──────────────┘    │
                    │                    │
┌──────────────┐    │┌──────────────┐    │┌──────────────┐
│    Table     │    ││    Order     │    ││InventoryItem │
│──────────────│    ││──────────────│    ││──────────────│
│ id           │◀──┐││ id           │    ││ id           │
│ number       │   │││ orderNumber  │    ││ name         │
│ capacity     │   │││ type         │    ││ currentStock │
│ status       │   │││ status       │    ││ minStock     │
│ reservedBy   │   │││ tableId ─────┘    ││ costPerUnit  │
│ reservedTime │   ││└──────────────┘    │└──────────────┘
└──────────────┘   ││                    │
                   ││┌──────────────┐    │
┌──────────────┐   │││  OrderItem   │    │
│  QueueEntry  │   ││├──────────────│    │
│──────────────│   │││ orderId      │    │
│ id           │   │││ menuItemId ──┼────┘
│ queueNumber  │   │││ quantity     │
│ customerName │   │││ unitPrice    │
│ partySize    │   │││ note         │
│ status       │   ││└──────────────┘
│ tableId ─────┼───┘│
└──────────────┘    │
                    │
┌──────────────┐    │
│StockMovement │    │
│──────────────│    │
│ id           │    │
│ inventoryId ─┼────┘
│ type (IN/OUT)│
│ quantity     │
└──────────────┘
```

---

## Key Highlights | จุดเด่น | 주요 특징

### EN
1. **Full Restaurant Workflow** — From customer ordering to kitchen to checkout
2. **Multi-language** — Thai, English, Japanese, Korean for international tourists
3. **QR Self-Ordering** — Customers scan & order from their phone, no app install needed
4. **Smart Table Management** — Capacity validation, reservations with auto-cancel
5. **Role-Based Access** — 4 staff roles with appropriate permissions
6. **Real Food Photos** — Upload actual dish photos for better customer experience
7. **Inventory Integration** — Auto-deduct stock when orders are placed
8. **Dark/Light Theme** — Modern UI that works on mobile, tablet, and desktop

### TH — ภาษาไทย
1. **ครบวงจรการจัดการร้านอาหาร** — ตั้งแต่ลูกค้าสั่งอาหาร ส่งครัว จนเช็คบิล
2. **รองรับ 4 ภาษา** — ไทย อังกฤษ ญี่ปุ่น เกาหลี เหมาะกับร้านที่มีลูกค้าต่างชาติ
3. **สั่งอาหารผ่าน QR Code** — ลูกค้าสแกนแล้วสั่งเองผ่านมือถือ ไม่ต้องลงแอพ
4. **ระบบโต๊ะอัจฉริยะ** — ตรวจสอบจำนวนที่นั่ง จองโต๊ะพร้อมเวลา ยกเลิกอัตโนมัติ
5. **ระบบสิทธิ์ตามตำแหน่ง** — 4 ตำแหน่ง เจ้าของ/หน้าร้าน/ครัว/สต๊อก
6. **รูปอาหารจริง** — อัพโหลดรูปจริงให้ลูกค้าเห็นหน้าตาอาหาร
7. **เชื่อมต่อสต๊อก** — ตัดวัตถุดิบอัตโนมัติเมื่อมีออเดอร์
8. **ธีมมืด/สว่าง** — UI ทันสมัย ใช้ได้ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์

### KO — 한국어
1. **레스토랑 전체 워크플로우** — 고객 주문부터 주방 조리, 결제까지
2. **4개 언어 지원** — 태국어, 영어, 일본어, 한국어로 외국인 관광객 대응
3. **QR 셀프 주문** — 고객이 스마트폰으로 스캔 후 직접 주문, 앱 설치 불필요
4. **스마트 테이블 관리** — 좌석 수 검증, 시간대별 예약, 자동 취소
5. **역할 기반 접근 제어** — 점장/홀/주방/재고 4가지 역할별 권한
6. **실제 음식 사진** — 실제 요리 사진 업로드로 고객 경험 향상
7. **재고 연동** — 주문 시 재료 자동 차감
8. **다크/라이트 테마** — 모바일, 태블릿, 데스크톱 모두 지원하는 모던 UI

---

## Deployment | การ Deploy | 배포

```
GitHub Repository → Vercel (Auto Deploy) → Live URL
                                          ↓
                              Supabase (Database + Auth + Storage)
```

**Steps | ขั้นตอน | 단계:**
1. Push code to GitHub | อัพโค้ดขึ้น GitHub | GitHub에 코드 푸시
2. Connect Vercel to GitHub repo | เชื่อม Vercel กับ GitHub | Vercel을 GitHub 저장소에 연결
3. Set environment variables | ตั้งค่า environment variables | 환경 변수 설정
4. Deploy! | Deploy! | 배포!

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

---

## Contact | ติดต่อ | 연락처

**Project:** Restroflow
**Developer:** duandara.s@ubu.ac.th
**Repository:** github.com/bimcute1984/restroflow
