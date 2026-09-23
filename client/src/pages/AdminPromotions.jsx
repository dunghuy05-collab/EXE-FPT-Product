import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  TicketCheck,
  Trash2,
} from "lucide-react";
import { api, date, money } from "../services/api";
import {
  Button,
  DashboardCard,
  DashboardShell,
  EmptyState,
  ErrorState,
  Modal,
  PageHead,
  PageLoading,
  useToast,
} from "../components/UI";

const localDateTime = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "";
  const offset = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
};

const blankPromotion = () => {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  expires.setHours(23, 59, 0, 0);
  return {
    code: "",
    title: "",
    description: "",
    type: "percentage",
    value: 10,
    maxDiscount: 300000,
    minRental: 0,
    minDays: 1,
    usageLimit: "",
    startsAt: "",
    expiresAt: localDateTime(expires),
    active: true,
  };
};

function statusFor(promotion) {
  if (!promotion.active) return ["Đang tắt", "bg-slate-100 text-slate-600"];
  if (promotion.startsAt && new Date(promotion.startsAt) > new Date())
    return ["Đã lên lịch", "bg-blue-50 text-blue-700"];
  if (new Date(promotion.expiresAt) <= new Date())
    return ["Hết hạn", "bg-amber-50 text-amber-700"];
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit)
    return ["Hết lượt", "bg-amber-50 text-amber-700"];
  return ["Đang áp dụng", "bg-emerald-50 text-emerald-700"];
}

export default function AdminPromotions() {
  const toast = useToast();
  const [promotions, setPromotions] = useState(null);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(blankPromotion);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setPromotions(await api("/admin/promotions"));
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const items = promotions || [];
    return {
      total: items.length,
      available: items.filter((item) => item.available).length,
      scheduled: items.filter(
        (item) =>
          item.active && item.startsAt && new Date(item.startsAt) > new Date(),
      ).length,
      used: items.reduce((sum, item) => sum + Number(item.usageCount || 0), 0),
    };
  }, [promotions]);

  function openCreate() {
    setEditor({ mode: "create" });
    setForm(blankPromotion());
  }
  function openEdit(promotion) {
    setEditor({ mode: "edit", id: promotion.id });
    setForm({
      ...promotion,
      startsAt: localDateTime(promotion.startsAt),
      expiresAt: localDateTime(promotion.expiresAt),
      usageLimit: promotion.usageLimit ?? "",
    });
  }
  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  async function save(event) {
    event?.preventDefault();
    setWorking(true);
    try {
      const path =
        editor.mode === "create"
          ? "/admin/promotions"
          : `/admin/promotions/${editor.id}`;
      await api(path, {
        method: editor.mode === "create" ? "POST" : "PUT",
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
          value: Number(form.value),
          maxDiscount: Number(form.maxDiscount || 0),
          minRental: Number(form.minRental || 0),
          minDays: Number(form.minDays || 1),
          usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
          startsAt: form.startsAt || null,
        }),
      });
      toast.success(
        editor.mode === "create" ? "Đã tạo ưu đãi" : "Đã cập nhật ưu đãi",
      );
      setEditor(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setWorking(false);
    }
  }
  async function toggle(promotion) {
    try {
      await api(`/admin/promotions/${promotion.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: !promotion.active }),
      });
      toast.success(promotion.active ? "Đã tạm dừng ưu đãi" : "Đã bật ưu đãi");
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }
  async function archive(promotion) {
    if (
      !window.confirm(
        `Lưu trữ ưu đãi ${promotion.code}? Mã này sẽ ngừng áp dụng.`,
      )
    )
      return;
    try {
      await api(`/admin/promotions/${promotion.id}`, { method: "DELETE" });
      toast.success("Đã lưu trữ ưu đãi");
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="py-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <PageHead
            eyebrow="Vận hành tăng trưởng"
            title="Quản lý ưu đãi"
            desc="Tạo mã giảm giá, kiểm soát thời gian áp dụng và giới hạn lượt sử dụng."
          />
          <Button onClick={openCreate} className="shrink-0">
            <Plus size={18} /> Tạo ưu đãi
          </Button>
        </div>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !promotions ? (
          <PageLoading />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                icon={BadgePercent}
                title="Tổng ưu đãi"
                value={stats.total}
              />
              <DashboardCard
                icon={CheckCircle2}
                title="Đang áp dụng"
                value={stats.available}
              />
              <DashboardCard
                icon={CalendarClock}
                title="Đã lên lịch"
                value={stats.scheduled}
              />
              <DashboardCard
                icon={TicketCheck}
                title="Lượt đã dùng"
                value={stats.used}
              />
            </div>
            <div className="card mt-7 overflow-hidden">
              {promotions.length === 0 ? (
                <EmptyState
                  icon={BadgePercent}
                  title="Chưa có ưu đãi"
                  desc="Tạo mã đầu tiên để hiển thị trên trang chủ."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-4">Ưu đãi</th>
                        <th className="p-4">Mức giảm</th>
                        <th className="p-4">Điều kiện</th>
                        <th className="p-4">Lượt dùng</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map((promotion) => {
                        const [label, statusClass] = statusFor(promotion);
                        return (
                          <tr className="border-t align-top" key={promotion.id}>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">
                                {promotion.title}
                              </div>
                              <code className="mt-1 inline-block rounded bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                                {promotion.code}
                              </code>
                              <div className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                                {promotion.description || "Không có mô tả"}
                              </div>
                            </td>
                            <td className="p-4 font-semibold">
                              {promotion.type === "percentage"
                                ? `${promotion.value}%`
                                : money(promotion.value)}
                              {promotion.type === "percentage" &&
                                promotion.maxDiscount > 0 && (
                                  <div className="mt-1 text-xs font-normal text-slate-500">
                                    Tối đa {money(promotion.maxDiscount)}
                                  </div>
                                )}
                            </td>
                            <td className="p-4 text-xs leading-5 text-slate-600">
                              Từ {promotion.minDays || 1} ngày
                              <br />
                              Đơn từ {money(promotion.minRental || 0)}
                              <br />
                              Hết hạn {date(promotion.expiresAt)}
                            </td>
                            <td className="p-4">
                              <b>{promotion.usageCount || 0}</b>
                              {promotion.usageLimit
                                ? ` / ${promotion.usageLimit}`
                                : " / ∞"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}
                              >
                                {label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEdit(promotion)}
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                  aria-label={`Sửa ${promotion.code}`}
                                >
                                  <Edit3 size={17} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggle(promotion)}
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                  aria-label={
                                    promotion.active
                                      ? `Tắt ${promotion.code}`
                                      : `Bật ${promotion.code}`
                                  }
                                >
                                  <Power size={17} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => archive(promotion)}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  aria-label={`Lưu trữ ${promotion.code}`}
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Modal
        open={Boolean(editor)}
        title={editor?.mode === "create" ? "Tạo ưu đãi" : "Chỉnh sửa ưu đãi"}
        onClose={() => !working && setEditor(null)}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setEditor(null)}
              disabled={working}
            >
              Hủy
            </Button>
            <Button onClick={save} disabled={working}>
              {working ? "Đang lưu..." : "Lưu ưu đãi"}
            </Button>
          </>
        }
      >
        <form id="promotion-form" onSubmit={save} className="grid gap-4">
          <label>
            <span className="label">Mã ưu đãi</span>
            <input
              className="input uppercase"
              name="code"
              value={form.code}
              onChange={updateField}
              maxLength={24}
              placeholder="PACECAR10"
              required
            />
          </label>
          <label>
            <span className="label">Tên chương trình</span>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={updateField}
              maxLength={120}
              required
            />
          </label>
          <label>
            <span className="label">Mô tả</span>
            <textarea
              className="input min-h-20"
              name="description"
              value={form.description}
              onChange={updateField}
              maxLength={500}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Loại giảm</span>
              <select
                className="input"
                name="type"
                value={form.type}
                onChange={updateField}
              >
                <option value="percentage">Theo phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </label>
            <label>
              <span className="label">Giá trị</span>
              <input
                className="input"
                type="number"
                name="value"
                value={form.value}
                onChange={updateField}
                min="1"
                max={form.type === "percentage" ? 100 : undefined}
                required
              />
            </label>
          </div>
          {form.type === "percentage" && (
            <label>
              <span className="label">Giảm tối đa (đ)</span>
              <input
                className="input"
                type="number"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={updateField}
                min="0"
                required
              />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Đơn tối thiểu (đ)</span>
              <input
                className="input"
                type="number"
                name="minRental"
                value={form.minRental}
                onChange={updateField}
                min="0"
              />
            </label>
            <label>
              <span className="label">Số ngày tối thiểu</span>
              <input
                className="input"
                type="number"
                name="minDays"
                value={form.minDays}
                onChange={updateField}
                min="1"
                max="365"
              />
            </label>
          </div>
          <label>
            <span className="label">Giới hạn lượt dùng</span>
            <input
              className="input"
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={updateField}
              min="1"
              placeholder="Không giới hạn"
            />
          </label>
          <label>
            <span className="label">Bắt đầu (không bắt buộc)</span>
            <input
              className="input"
              type="datetime-local"
              name="startsAt"
              value={form.startsAt}
              onChange={updateField}
            />
          </label>
          <label>
            <span className="label">Hết hạn</span>
            <input
              className="input"
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt}
              onChange={updateField}
              required
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={updateField}
            />
            <span className="font-semibold text-slate-700">
              Bật ưu đãi sau khi lưu
            </span>
          </label>
        </form>
      </Modal>
    </DashboardShell>
  );
}
