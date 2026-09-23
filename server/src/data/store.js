import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.js";
const dir = path.dirname(fileURLToPath(import.meta.url));
const file = process.env.PACECAR_DB_FILE
  ? path.resolve(process.env.PACECAR_DB_FILE)
  : path.join(dir, "db.json");
fs.mkdirSync(path.dirname(file), { recursive: true });

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(String(password), salt, 64).toString("hex")}`;
};

const migrateLegacyPasswords = (data) => {
  let changed = false;
  for (const user of data.users || []) {
    if (!user.passwordHash && typeof user.password === "string") {
      user.passwordHash = hashPassword(user.password);
      changed = true;
    }
    if (Object.hasOwn(user, "password")) {
      delete user.password;
      changed = true;
    }
  }
  return changed;
};

export function read() {
  if (!fs.existsSync(file))
    fs.writeFileSync(file, JSON.stringify(seed, null, 2));
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = migrateLegacyPasswords(data);
  data.notifications ||= [
    {
      id: 1,
      userId: 4,
      title: "Yêu cầu thuê xe mới",
      message: "Nguyễn Minh An muốn thuê Toyota Vios 2022.",
      type: "booking",
      read: false,
      createdAt: "2026-07-11T09:15:00.000Z",
    },
    {
      id: 2,
      userId: 1,
      title: "Booking đang chờ duyệt",
      message: "Yêu cầu #PC1 đã được gửi đến chủ xe.",
      type: "booking",
      read: false,
      createdAt: "2026-07-10T12:00:00.000Z",
    },
    {
      id: 3,
      userId: 4,
      title: "Cảnh báo GPS",
      message: "Tín hiệu GPS của Hyundai Accent 2022 bị gián đoạn.",
      type: "risk",
      read: false,
      createdAt: "2026-07-11T08:30:00.000Z",
    },
  ];
  data.auditLogs ||= [];
  data.sessions ||= [];
  const storedSessionCount = data.sessions.length;
  const activeSessions = data.sessions
    .filter((session) => new Date(session.expiresAt) > new Date())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const sessionCountByUser = new Map();
  data.sessions = activeSessions.filter((session) => {
    const count = sessionCountByUser.get(session.userId) || 0;
    sessionCountByUser.set(session.userId, count + 1);
    return count < 5;
  });
  if (data.sessions.length !== storedSessionCount) changed = true;
  data.uploadedAssets ||= [];
  data.favorites ||= [];
  data.quotes ||= [];
  data.promotions ||= [
    {
      id: 1,
      code: "PACECAR10",
      title: "Khởi hành tiết kiệm",
      description: "Giảm 10% tiền thuê cho đơn đủ điều kiện",
      type: "percentage",
      value: 10,
      maxDiscount: 300000,
      minRental: 1000000,
      active: true,
      expiresAt: "2027-12-31T23:59:59.000Z",
    },
    {
      id: 2,
      code: "WEEKEND200",
      title: "Cuối tuần rong chơi",
      description: "Giảm 200.000đ cho đơn từ 3 ngày",
      type: "fixed",
      value: 200000,
      maxDiscount: 200000,
      minDays: 3,
      active: true,
      expiresAt: "2027-12-31T23:59:59.000Z",
    },
  ];
  data.pricingPolicy ||= {
    version: "PC-2026.2",
    platformFeeRate: 0.1,
    insurancePerDay: 80000,
    weekendSurchargeRate: 0.15,
    driverFeePerDay: 350000,
    longRentalDiscounts: [
      { minDays: 7, rate: 0.1 },
      { minDays: 3, rate: 0.05 },
    ],
    quoteTtlMinutes: 15,
  };
  if (data.pricingPolicy.driverFeePerDay == null) {
    data.pricingPolicy.driverFeePerDay = 350000;
    changed = true;
  }
  if (data.pricingPolicy.version === "PC-2026.1") {
    data.pricingPolicy.version = "PC-2026.2";
    changed = true;
  }
  const welcomePromotion = data.promotions.find(
    (promotion) => promotion.code === "PACECAR10",
  );
  if (
    welcomePromotion &&
    welcomePromotion.description !== "Giảm 10% tiền thuê cho đơn đủ điều kiện"
  ) {
    welcomePromotion.description = "Giảm 10% tiền thuê cho đơn đủ điều kiện";
    changed = true;
  }
  data.reviews ||= [
    {
      id: 1,
      bookingId: 3,
      carId: 2,
      renterId: 1,
      rating: 5,
      comment: "Xe sạch, chủ xe hỗ trợ rất tốt.",
      createdAt: "2026-06-23T10:00:00.000Z",
    },
    {
      id: 2,
      bookingId: 7,
      carId: 9,
      renterId: 2,
      rating: 4,
      comment: "Xe đúng mô tả, giao nhận nhanh.",
      createdAt: "2026-04-05T10:00:00.000Z",
    },
  ];
  data.riskAlerts ||= [
    {
      id: 1,
      ownerId: 4,
      carId: 1,
      type: "GPS_LOST",
      severity: "High",
      message: "Tín hiệu GPS bị gián đoạn",
      status: "Open",
      createdAt: "2026-07-11T08:30:00.000Z",
    },
    {
      id: 2,
      ownerId: 4,
      bookingId: 2,
      type: "RENTER_RISK",
      severity: "Medium",
      message: "Người thuê có mức rủi ro trung bình",
      status: "Open",
      createdAt: "2026-07-10T08:30:00.000Z",
    },
    {
      id: 3,
      ownerId: 4,
      bookingId: 4,
      type: "LONG_DURATION",
      severity: "Medium",
      message: "Thời gian thuê vượt mức thông thường",
      status: "Resolved",
      createdAt: "2026-07-08T08:30:00.000Z",
    },
  ];
  data.cars = data.cars.map((car) => ({
    listingStatus: "Published",
    photos: car.imageUrl ? [car.imageUrl] : [],
    documents: [],
    amenities: [],
    rules: {
      mileageLimit: 300,
      lateFeePerHour: 120000,
      noSmoking: true,
      petsAllowed: false,
    },
    deliveryOptions: {
      ownerDelivery: true,
      pickupAtCar: true,
      deliveryFee: 150000,
    },
    minRentalDays: 1,
    maxRentalDays: 30,
    instantBooking: false,
    updatedAt: car.updatedAt || "2026-07-01T00:00:00.000Z",
    ...car,
  }));
  data.evidence ||= [];
  for (const evidence of data.evidence) {
    if (
      typeof evidence.notes === "string" &&
      (evidence.notes.includes("\uFFFD") ||
        /[A-Za-zÀ-ỹ]\?[A-Za-zÀ-ỹ]/u.test(evidence.notes))
    ) {
      const original = seed.evidence.find(
        (item) => item.bookingId === evidence.bookingId,
      );
      if (original) {
        evidence.notes = original.notes;
        changed = true;
      }
    }
  }
  if (changed) write(data);
  return data;
}
export function write(data) {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(temp, file);
  return data;
}
export function reset() {
  const data = structuredClone(seed);
  migrateLegacyPasswords(data);
  write(data);
}
