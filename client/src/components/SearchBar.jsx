import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, useToast } from "./UI";
import {
  HANDOVER_POLICY,
  validateHandoverTimes,
} from "../services/rentalPolicy";
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const isoDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return formatLocalDate(date);
};
const locations = [
  "Hà Nội",
  "Hà Đông, Hà Nội",
  "Cầu Giấy, Hà Nội",
  "Mỹ Đình, Hà Nội",
  "Hòa Lạc, Hà Nội",
];
export default function SearchBar({ compact = false }) {
  const nav = useNavigate(),
    toast = useToast(),
    [params, setParams] = useSearchParams();
  const valuesFromParams = () => ({
    location: params.get("location") || "Hà Nội",
    destination: params.get("destination") || "",
    startDate: params.get("startDate") || isoDate(1),
    startTime: params.get("startTime") || "08:00",
    endDate: params.get("endDate") || isoDate(3),
    endTime: params.get("endTime") || "20:00",
    driverOption: params.get("driverOption") || "self",
  });
  const [form, setForm] = useState(valuesFromParams);
  const relevantParams = useMemo(
    () =>
      [
        "location",
        "destination",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "driverOption",
      ]
        .map((key) => params.get(key) || "")
        .join("|"),
    [params],
  );
  useEffect(() => {
    if (!compact) return;
    const next = new URLSearchParams(params);
    let changed = false;
    for (const [key, value] of Object.entries(form)) {
      if (!next.get(key)) {
        next.set(key, value);
        changed = true;
      }
    }
    if (changed) setParams(next, { replace: true });
  }, [compact, setParams]);
  useEffect(() => {
    setForm(valuesFromParams());
    // Unrelated filter parameters do not change this signature, so they cannot
    // overwrite dates a user is currently editing. Back/forward navigation can.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantParams]);
  function submit(e) {
    e.preventDefault();
    if (form.startDate < isoDate(0)) {
      toast.error("Ngày nhận xe không thể ở trong quá khứ");
      return;
    }
    const start = new Date(`${form.startDate}T${form.startTime}:00`),
      end = new Date(`${form.endDate}T${form.endTime}:00`);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      toast.error("Vui lòng chọn đủ ngày và giờ nhận, trả xe");
      return;
    }
    if (start < new Date()) {
      toast.error("Thời gian nhận xe không thể ở trong quá khứ");
      return;
    }
    if (end <= start) {
      toast.error("Thời gian trả xe phải sau thời gian nhận xe");
      return;
    }
    const handoverError = validateHandoverTimes(form.startTime, form.endTime);
    if (handoverError) {
      toast.error(handoverError);
      return;
    }
    const next = compact ? new URLSearchParams(params) : new URLSearchParams();
    Object.entries(form).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    next.delete("page");
    nav(`/cars?${next}`);
  }
  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl bg-white shadow-2xl ${compact ? "border p-3" : "p-4 sm:p-5"}`}
    >
      <div
        className="mb-4 flex w-fit rounded-xl bg-slate-100 p-1"
        role="group"
        aria-label="Hình thức thuê xe"
      >
        {[
          ["self", "Tự lái"],
          ["driver", "Có tài xế"],
        ].map(([value, label]) => (
          <button
            type="button"
            onClick={() => setForm({ ...form, driverOption: value })}
            aria-pressed={form.driverOption === value}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${form.driverOption === value ? "bg-brand-600 text-white shadow" : "text-slate-500"}`}
            key={value}
          >
            <UserRound className="mr-1 inline" size={15} />
            {label}
          </button>
        ))}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.25fr_1.25fr_auto]">
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="label">
            <MapPin className="mr-1 inline" size={16} />
            Khu vực nhận xe
          </span>
          <select
            className="input"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            {!locations.includes(form.location) && (
              <option value={form.location}>
                Khu vực hiện tại: {form.location}
              </option>
            )}
            {locations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-slate-400">
            Điểm hẹn cụ thể hiển thị trong trang xe
          </span>
        </label>
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="label">
            <MapPin className="mr-1 inline" size={16} />
            Điểm đến dự kiến
          </span>
          <input
            className="input"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder="Ví dụ: Hải Phòng"
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            Không phải địa điểm nhận xe
          </span>
        </label>
        <fieldset className="min-w-0">
          <span className="label">
            <CalendarDays className="mr-1 inline" size={16} />
            Nhận xe
          </span>
          <div className="flex min-w-0 gap-2">
            <input
              aria-label="Ngày nhận xe"
              type="date"
              min={isoDate(0)}
              required
              className="input min-w-0 flex-1 px-2"
              value={form.startDate}
              onChange={(e) => {
                const startDate = e.target.value;
                setForm({
                  ...form,
                  startDate,
                  endDate:
                    startDate && form.endDate < startDate
                      ? startDate
                      : form.endDate,
                });
              }}
            />
            <input
              aria-label="Giờ nhận xe"
              type="time"
              required
              className="input min-w-0 flex-1 px-2"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
        </fieldset>
        <fieldset className="min-w-0">
          <span className="label">
            <CalendarDays className="mr-1 inline" size={16} />
            Trả xe
          </span>
          <div className="flex min-w-0 gap-2">
            <input
              aria-label="Ngày trả xe"
              type="date"
              min={form.startDate || isoDate(0)}
              required
              className="input min-w-0 flex-1 px-2"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <input
              aria-label="Giờ trả xe"
              type="time"
              required
              className="input min-w-0 flex-1 px-2"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </fieldset>
        <Button className="col-span-1 mt-auto h-[50px] px-7 sm:col-span-2 lg:col-span-1">
          <Search size={18} />
          Tìm xe
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Bàn giao hỗ trợ {HANDOVER_POLICY.supportedFrom}–
        {HANDOVER_POLICY.supportedUntil}. Khung giờ tiêu chuẩn{" "}
        {HANDOVER_POLICY.standardFrom}–{HANDOVER_POLICY.standardUntil}; ngoài
        khung giờ này có phụ phí và được hiển thị trước khi đặt.
      </p>
    </form>
  );
}
