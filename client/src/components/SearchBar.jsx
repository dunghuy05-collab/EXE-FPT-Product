import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, useToast } from "./UI";
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
const addDays = (value, amount) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
};
export default function SearchBar({ compact = false }) {
  const nav = useNavigate(),
    toast = useToast(),
    [params, setParams] = useSearchParams();
  const valuesFromParams = () => ({
    location: params.get("location") || "Hà Nội",
    startDate: params.get("startDate") || isoDate(1),
    endDate: params.get("endDate") || isoDate(3),
    driverOption: params.get("driverOption") || "self",
  });
  const [form, setForm] = useState(valuesFromParams);
  const relevantParams = useMemo(
    () =>
      ["location", "startDate", "endDate", "driverOption"]
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
    if (form.endDate <= form.startDate) {
      toast.error("Ngày trả xe phải sau ngày nhận");
      return;
    }
    const next = compact ? new URLSearchParams(params) : new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => next.set(key, value));
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.15fr_1fr_1fr_auto]">
        <label className="relative col-span-2 lg:col-span-1">
          <span className="label">
            <MapPin className="mr-1 inline" size={16} />
            Địa điểm nhận xe
          </span>
          <select
            className="input"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            <option>Hà Nội</option>
            <option>Hà Đông, Hà Nội</option>
            <option>Cầu Giấy, Hà Nội</option>
            <option>Mỹ Đình, Hà Nội</option>
            <option>Hòa Lạc, Hà Nội</option>
          </select>
        </label>
        <label>
          <span className="label">
            <CalendarDays className="mr-1 inline" size={16} />
            Ngày nhận xe
          </span>
          <input
            type="date"
            min={isoDate(0)}
            required
            className="input"
            value={form.startDate}
            onChange={(e) => {
              const startDate = e.target.value;
              setForm({
                ...form,
                startDate,
                endDate:
                  startDate && form.endDate <= startDate
                    ? addDays(startDate, 1)
                    : form.endDate,
              });
            }}
          />
        </label>
        <label>
          <span className="label">
            <CalendarDays className="mr-1 inline" size={16} />
            Ngày trả xe
          </span>
          <input
            type="date"
            min={addDays(form.startDate, 1) || isoDate(1)}
            required
            className="input"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </label>
        <Button className="col-span-2 mt-auto h-[50px] px-7 lg:col-span-1">
          <Search size={18} />
          Tìm xe
        </Button>
      </div>
    </form>
  );
}
