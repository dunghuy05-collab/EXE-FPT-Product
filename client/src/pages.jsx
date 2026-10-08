import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  Car as CarIcon,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileSignature,
  Fuel,
  Gauge,
  Heart,
  KeyRound,
  MapPin,
  Search,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Truck,
  Zap,
  Users,
  UserPlus,
  Wallet,
} from "lucide-react";
import { api, date, dateTime, money } from "./services/api";
import DriftScene from "./components/DriftScene";
import {
  Button,
  CarCard,
  DashboardCard,
  DashboardShell,
  EmptyState,
  ErrorState,
  EvidenceUploader,
  Modal,
  PageHead,
  PageLoading,
  PriceBreakdown,
  RiskBadge,
  StatusBadge,
  TrustBreakdown,
  TrustScoreBadge,
  VerifiedBadge,
  useToast,
} from "./components/UI";
import { useAuth } from "./auth/AuthContext";
import SearchBar from "./components/SearchBar";
import { HANDOVER_POLICY } from "./services/rentalPolicy";
const Load = PageLoading;
const localIsoDate = (offsetDays = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  const year = value.getFullYear(),
    month = String(value.getMonth() + 1).padStart(2, "0"),
    day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const useFetch = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((value) => value + 1);
  useEffect(() => {
    let active = true,
      timer;
    setError("");
    setLoading(true);
    setData(null);
    const request = async (attempt = 0) => {
      try {
        const result = await api(path);
        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (requestError) {
        if (!active) return;
        if (attempt < 2 && (!requestError.status || requestError.status >= 500))
          timer = setTimeout(() => request(attempt + 1), 500 * 2 ** attempt);
        else {
          setError(requestError.message);
          setLoading(false);
        }
      }
    };
    request();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [path, version]);
  return { data, error, loading, reload };
};
function Reveal({ children, className = "", delay = 0 }) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={elementRef}
      className={`reveal-on-scroll ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
export function Landing() {
  const [pageVisible, setPageVisible] = useState(
    () => document.visibilityState === "visible",
  );
  useEffect(() => {
    const updateVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);
  const { data: cars } = useFetch("/cars");
  const { data: promotions } = useFetch("/promotions");
  const ratedCars =
    cars?.filter(
      (car) => car.reviewCount > 0 && Number.isFinite(Number(car.rating)),
    ) || [];
  const averageRating = ratedCars.length
    ? (
        ratedCars.reduce((sum, car) => sum + Number(car.rating), 0) /
        ratedCars.length
      ).toFixed(1)
    : "—";
  const benefits = [
    [
      ShieldCheck,
      "Giá minh bạch",
      "Mọi chi phí được hiển thị trước khi đặt xe.",
    ],
    [
      CheckCircle2,
      "Xe & chủ xe xác thực",
      "Hồ sơ và giấy tờ được đối soát rõ ràng.",
    ],
    [FileSignature, "Hợp đồng số", "Điều khoản rõ ràng, ký kết thuận tiện."],
    [
      Gauge,
      "GPS & cảnh báo rủi ro",
      "Theo dõi hành trình và phát hiện bất thường.",
    ],
    [
      Clock3,
      "Hỗ trợ tranh chấp 24–72h",
      "Quy trình dựa trên bằng chứng, công bằng.",
    ],
  ];
  return (
    <>
      <section
        className={`relative isolate overflow-hidden bg-gradient-to-br from-[#101832] via-brand-950 to-[#183b8d] py-9 text-white sm:py-14 lg:py-20 ${pageVisible ? "" : "page-motion-inactive"}`}
      >
        <div className="surface-grid pointer-events-none absolute inset-0" />
        <div className="landing-orb pointer-events-none absolute -right-40 -top-48 h-[32rem] w-[32rem] rounded-full bg-brand-400/20 blur-3xl" />
        <div className="container-app relative grid items-center gap-4 sm:gap-7 xl:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.98fr)]">
          <div className="min-w-0">
            <span className="motion-enter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-100 sm:text-sm">
              <Sparkles size={15} className="text-signal-400" /> NỀN TẢNG THUÊ
              XE AN TOÀN
            </span>
            <h1 className="motion-enter motion-delay-1 mt-5 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Thuê xe minh bạch,
              <br />
              <span className="relative inline-block text-blue-200">
                an toàn hơn.
                <span className="absolute -bottom-1 left-0 h-1 w-2/3 rounded-full bg-signal-400/90 sm:-bottom-2 sm:h-1.5" />
              </span>
            </h1>
            <p className="motion-enter motion-delay-2 mt-5 max-w-xl text-base leading-7 text-blue-100 sm:mt-6 sm:text-lg sm:leading-8">
              Chọn xe ưng ý với chi phí rõ ràng, hồ sơ xác thực và hợp đồng số —
              để mỗi hành trình bắt đầu bằng sự an tâm.
            </p>
            <div className="motion-enter motion-delay-3 mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                to="/cars"
                className="btn-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-brand-700 shadow-lg shadow-black/10 hover:bg-blue-50 hover:shadow-xl"
              >
                Tìm xe ngay <ArrowRight size={18} />
              </Link>
              <Link
                to="/register?role=owner"
                className="btn-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 font-semibold text-white hover:border-white/40 hover:bg-white/10"
              >
                Bạn có xe? Đăng cho thuê
              </Link>
            </div>
            <div className="motion-enter motion-delay-4 mt-7 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-5 text-xs text-blue-100 sm:mt-9 sm:gap-6 sm:pt-6 sm:text-sm">
              <span>
                <b className="block text-xl font-extrabold text-white sm:text-2xl">
                  {cars?.length ?? "—"}
                </b>
                xe sẵn sàng
              </span>
              <span>
                <b className="block text-xl font-extrabold text-white sm:text-2xl">
                  {averageRating}/5
                </b>
                đánh giá trung bình
              </span>
              <span>
                <b className="block text-xl font-extrabold text-white sm:text-2xl">
                  {promotions?.length ?? "—"}
                </b>
                ưu đãi hiện có
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[580px] min-w-0 px-1 pb-1 sm:px-5 xl:px-0">
            <DriftScene />
          </div>
        </div>
      </section>
      <div className="motion-enter motion-delay-4 container-app relative z-20 -mt-10">
        <SearchBar />
      </div>
      <section className="container-app pt-16">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="max-w-3xl">
            <p className="font-bold text-brand-600">MÔ HÌNH HOẠT ĐỘNG</p>
            <h2 className="section-title mt-2">
              PaceCar đứng ở đâu trong giao dịch?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              PaceCar là nền tảng kết nối và hỗ trợ giao dịch. Hợp đồng thuê xe
              được ký trực tiếp giữa người thuê và chủ xe; PaceCar cung cấp báo
              giá, hợp đồng số, bằng chứng giao nhận và quy trình hỗ trợ tranh
              chấp.
            </p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              [
                FileSignature,
                "Hợp đồng giữa hai bên",
                "Chủ xe cho thuê trực tiếp; người thuê chịu trách nhiệm theo hợp đồng đã ký.",
              ],
              [
                Wallet,
                "Phí nền tảng minh bạch",
                "Người thuê trả phí nền tảng 10% trên tiền thuê sau điều chỉnh; toàn bộ được tách dòng trong báo giá.",
              ],
              [
                ShieldCheck,
                "Hỗ trợ bằng chứng",
                "PaceCar đối chiếu hồ sơ, ảnh giao nhận và hỗ trợ xử lý sự cố; không phải chủ sở hữu xe.",
              ],
            ].map(([Icon, title, description]) => (
              <article className="rounded-2xl bg-slate-50 p-5" key={title}>
                <Icon className="text-brand-600" />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Giao dịch ngoài PaceCar không được bảo vệ bởi báo giá, hợp đồng số,
            bằng chứng giao nhận hoặc quy trình hỗ trợ của nền tảng.
          </p>
        </div>
      </section>
      <section className="container-app pt-16">
        <div className="text-center">
          <p className="font-bold text-brand-600">ƯU ĐÃI ĐANG CÓ</p>
          <h2 className="section-title mt-2">
            Bắt đầu hành trình với giá tốt hơn
          </h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {promotions?.map((promo, i) => (
            <Reveal key={promo.id} delay={i * 90}>
              <div
                className={`interactive-card overflow-hidden rounded-2xl p-6 text-white shadow-soft ${i % 2 ? "bg-gradient-to-r from-violet-600 to-indigo-600" : "bg-gradient-to-r from-brand-700 to-cyan-500"}`}
              >
                <p className="text-sm font-bold uppercase tracking-wider">
                  Mã {promo.code}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold">{promo.title}</h3>
                <p className="mt-2 text-sm text-white/80">
                  {promo.description}
                </p>
                <Link
                  to={`/cars?promoCode=${promo.code}`}
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-700"
                >
                  Khám phá xe
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container-app pt-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-brand-600">ĐIỂM ĐẾN PHỔ BIẾN</p>
            <h2 className="section-title mt-2">Thuê xe gần bạn</h2>
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Hà Đông",
              "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=600&q=80",
            ],
            [
              "Cầu Giấy",
              "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=600&q=80",
            ],
            [
              "Mỹ Đình",
              "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
            ],
            [
              "Hòa Lạc",
              "https://images.unsplash.com/photo-1521993117367-b7f70ccd029d?auto=format&fit=crop&w=600&q=80",
            ],
          ].map(([place, img], index) => (
            <Reveal key={place} delay={index * 70}>
              <Link
                to={`/cars?location=${encodeURIComponent(place + ", Hà Nội")}`}
                className="group relative h-44 overflow-hidden rounded-2xl"
              >
                <img
                  src={img}
                  alt={`Thuê xe tại ${place}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <b className="text-lg">{place}</b>
                  <p className="text-xs text-white/70">Khám phá xe khả dụng</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="why" className="container-app py-20">
        <div className="text-center">
          <p className="font-bold text-brand-600">
            NIỀM TIN TẠO NÊN HÀNH TRÌNH
          </p>
          <h2 className="section-title mt-2">Vì sao chọn PaceCar?</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map(([I, t, d], index) => (
            <Reveal key={t} delay={index * 60}>
              <div className="interactive-card card h-full p-5">
                <I className="mb-4 text-brand-600" />
                <h3 className="font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="how-it-works" className="scroll-mt-24 bg-white py-20">
        <div className="container-app">
          <h2 className="section-title text-center">
            Thuê xe chỉ trong 5 bước
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-5">
            {[
              "Xác thực hồ sơ",
              "Tìm xe phù hợp",
              "Ký hợp đồng số",
              "Giao nhận bằng ảnh/video",
              "Hoàn cọc hoặc xử lý",
            ].map((x, i) => (
              <Reveal key={x} delay={i * 75}>
                <div className="text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-600 font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-4 font-semibold">{x}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container-app py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-brand-600">GỢI Ý CHO BẠN</p>
            <h2 className="section-title mt-2">Xe nổi bật</h2>
          </div>
          <Link to="/cars" className="font-bold text-brand-600">
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cars?.slice(0, 3).map((c, index) => (
            <Reveal key={c.id} delay={index * 90}>
              <CarCard car={c} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
export function HelpCenter() {
  const { user } = useAuth();
  const bookingTarget = user ? "/bookings" : "/login?next=/bookings";
  const steps = [
    [
      FileSignature,
      "Chọn đúng đơn thuê",
      "Mở đơn thuê liên quan và kiểm tra hợp đồng, mốc giao nhận cùng trạng thái hiện tại.",
    ],
    [
      Camera,
      "Bổ sung bằng chứng",
      "Tải ảnh giao nhận, ODO, nhiên liệu và ghi chú rõ thời điểm phát sinh sự cố.",
    ],
    [
      ShieldCheck,
      "Gửi yêu cầu xử lý",
      "PaceCar ghi nhận hồ sơ, đối chiếu hai phía và cập nhật quyết định ngay trong tài khoản.",
    ],
  ];
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-950 to-brand-600 py-16 text-white sm:py-20">
        <div className="container-app motion-enter">
          <p className="font-bold text-blue-200">TRUNG TÂM HỖ TRỢ</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Giải quyết sự cố dựa trên bằng chứng
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-blue-100">
            Theo dõi minh bạch từng bước, từ ghi nhận hiện trạng đến quyết định
            xử lý tranh chấp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button as={Link} to={bookingTarget} variant="light">
              Mở đơn thuê của tôi <ArrowRight size={18} />
            </Button>
            <Button as="a" href="tel:19001000" variant="on-dark">
              Gọi 1900 1000
            </Button>
          </div>
        </div>
      </section>
      <section className="container-app py-16">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-600">
            Quy trình
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hỗ trợ tranh chấp trong 3 bước
          </h2>
          <p className="mt-3 max-w-2xl text-slate-500">
            Bạn có thể mở hồ sơ trực tiếp từ một đơn thuê đủ điều kiện.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(([Icon, title, desc], index) => (
            <Reveal key={title} delay={index * 80}>
              <article className="interactive-card card h-full p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={24} />
                </div>
                <h2 className="mt-5 text-lg font-bold">
                  {index + 1}. {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-xl font-bold">
              Nếu chủ xe hủy sau khi đã xác nhận
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>
                PaceCar khóa lịch xe và ghi nhận vi phạm vào hồ sơ chủ xe.
              </li>
              <li>
                Đội hỗ trợ ưu tiên tìm xe tương đương trong cùng khu vực và
                khung giờ.
              </li>
              <li>
                Nếu không có xe thay thế, khoản đã thanh toán được hoàn lại đầy
                đủ theo hồ sơ giao dịch.
              </li>
              <li>
                Vi phạm lặp lại có thể dẫn đến cảnh báo, tạm dừng hoặc khóa tài
                khoản chủ xe.
              </li>
            </ol>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-bold">Bàn giao và nhiên liệu</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>
                Chụp ngoại thất, nội thất, ODO và mức nhiên liệu khi nhận và
                trả.
              </li>
              <li>
                Chính sách mặc định là giao đầy – trả đầy; mức thực tế trên biên
                bản là căn cứ đối chiếu.
              </li>
              <li>
                Giá thuê không bao gồm nhiên liệu tiêu thụ trong hành trình.
              </li>
              <li>
                Bàn giao hỗ trợ {HANDOVER_POLICY.supportedFrom}–
                {HANDOVER_POLICY.supportedUntil}; ngoài{" "}
                {HANDOVER_POLICY.standardFrom}–{HANDOVER_POLICY.standardUntil}{" "}
                có phụ phí.
              </li>
            </ul>
          </section>
        </div>
        <div className="card mt-8 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold">Cần hỗ trợ trước khi mở tranh chấp?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gửi email kèm mã đơn thuê, đội vận hành sẽ phản hồi theo hồ sơ.
            </p>
          </div>
          <a
            className="font-bold text-brand-600 hover:text-brand-700"
            href="mailto:hello@pacecar.vn?subject=Hỗ trợ đơn thuê PaceCar"
          >
            hello@pacecar.vn →
          </a>
        </div>
      </section>
    </div>
  );
}
function LegacyCars() {
  const { data, error, reload } = useFetch("/cars");
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("trust");
  const filtered = useMemo(
    () =>
      data
        ?.filter(
          (c) =>
            (!loc || c.location.includes(loc)) && (!type || c.type === type),
        )
        .sort((a, b) =>
          sort === "price"
            ? a.pricePerDay - b.pricePerDay
            : b.rating - a.rating,
        ) || [],
    [data, loc, type, sort],
  );
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Load />;
  return (
    <div className="container-app py-12">
      <PageHead
        eyebrow="Khám phá"
        title="Tìm chiếc xe phù hợp"
        desc="Xe và chủ xe đã được xác thực, chi phí minh bạch trước mỗi hành trình."
      />
      <div className="card mb-8 grid gap-4 p-5 md:grid-cols-4">
        <select
          className="input"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
        >
          <option value="">Mọi khu vực</option>
          <option>Hà Đông</option>
          <option>Cầu Giấy</option>
          <option>Mỹ Đình</option>
          <option>Hòa Lạc</option>
          <option>Tây Hồ</option>
          <option>Long Biên</option>
          <option>Gia Lâm</option>
          <option>Nội Bài</option>
        </select>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Mọi loại xe</option>
          <option>Sedan</option>
          <option>SUV</option>
          <option>MPV</option>
          <option>Hatchback</option>
          <option>Pickup</option>
          <option>Van</option>
        </select>
        <select className="input">
          <option>Tự lái hoặc có tài xế</option>
          <option>Tự lái</option>
          <option>Có tài xế</option>
        </select>
        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="trust">Trust Score cao nhất</option>
          <option value="price">Giá thấp nhất</option>
        </select>
      </div>
      <p className="mb-5 text-sm text-slate-500">
        Tìm thấy <b>{filtered.length}</b> xe phù hợp
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
    </div>
  );
}
export function Cars() {
  const [params, setParams] = useSearchParams(),
    location = useLocation(),
    nav = useNavigate(),
    toast = useToast(),
    { user } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = params.toString(),
    { data, error, reload } = useFetch(
      `/search/cars${query ? `?${query}` : ""}`,
    );
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setParams(next);
  };
  const clear = () => {
    const next = new URLSearchParams();
    for (const key of [
      "location",
      "destination",
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "driverOption",
      "promoCode",
    ]) {
      const value = params.get(key);
      if (value) next.set(key, value);
    }
    setParams(next);
  };
  const goPage = (page) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  async function favorite(car) {
    if (!user) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
      );
      return;
    }
    try {
      await api(`/favorites/${car.id}`, {
        method: car.favorite ? "DELETE" : "POST",
      });
      toast(car.favorite ? "Đã bỏ khỏi yêu thích" : "Đã lưu xe yêu thích");
      reload();
    } catch (e) {
      toast(e.message);
    }
  }
  if (error)
    return (
      <div className="container-app space-y-5 py-8">
        <SearchBar compact />
        <div className="card p-8 text-center" role="alert">
          <h1 className="text-xl font-bold">
            Không thể tìm xe với tiêu chí này
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button
            className="mt-5"
            onClick={() => {
              const next = new URLSearchParams(params);
              for (const key of [
                "startDate",
                "startTime",
                "endDate",
                "endTime",
                "page",
              ])
                next.delete(key);
              setParams(next);
            }}
          >
            Chọn lại thời gian
          </Button>
        </div>
      </div>
    );
  const items = data?.items || [];
  return (
    <div>
      <div className="border-b bg-white py-5">
        <div className="container-app">
          <SearchBar compact />
        </div>
      </div>
      <div className="container-app py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-600">XE KHẢ DỤNG</p>
            <h1 className="mt-1 text-2xl font-extrabold">
              {data ? `${data.total} xe phù hợp` : "Đang tìm xe..."}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Giá dự kiến theo lịch trình, đã kiểm tra lịch trống phía backend.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              aria-controls="car-filters"
            >
              <SlidersHorizontal size={17} /> Bộ lọc
            </Button>
            <select
              aria-label="Sắp xếp kết quả"
              className="input w-auto min-w-40 sm:min-w-52"
              value={params.get("sort") || "recommended"}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="recommended">PaceCar đề xuất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
        <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
          <aside
            id="car-filters"
            className={`card h-fit p-5 lg:sticky lg:top-24 lg:block ${filtersOpen ? "block" : "hidden"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold">
                <SlidersHorizontal size={18} />
                Bộ lọc
              </h2>
              <button
                onClick={clear}
                className="text-xs font-bold text-brand-600"
              >
                Đặt lại
              </button>
            </div>
            <div className="mt-5 space-y-5">
              <Filter label="Loại xe">
                <select
                  className="input"
                  value={params.get("type") || ""}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>MPV</option>
                  <option>Hatchback</option>
                  <option>Pickup</option>
                  <option>Van</option>
                </select>
              </Filter>
              <Filter label="Số chỗ tối thiểu">
                <select
                  className="input"
                  value={params.get("seats") || ""}
                  onChange={(e) => update("seats", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="4">4 chỗ</option>
                  <option value="5">5 chỗ</option>
                  <option value="7">7 chỗ</option>
                  <option value="8">8 chỗ</option>
                </select>
              </Filter>
              <Filter label="Hộp số">
                <select
                  className="input"
                  value={params.get("transmission") || ""}
                  onChange={(e) => update("transmission", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option>Tự động</option>
                  <option>Số sàn</option>
                </select>
              </Filter>
              <Filter label="Nhiên liệu">
                <select
                  className="input"
                  value={params.get("fuel") || ""}
                  onChange={(e) => update("fuel", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option>Xăng</option>
                  <option>Dầu</option>
                  <option>Điện</option>
                  <option>Hybrid</option>
                </select>
              </Filter>
              <Filter label="Khoảng giá/ngày">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    aria-label="Giá thuê tối thiểu mỗi ngày"
                    className="input px-3"
                    placeholder="Từ"
                    value={params.get("minPrice") || ""}
                    onChange={(e) => update("minPrice", e.target.value)}
                  />
                  <input
                    type="number"
                    aria-label="Giá thuê tối đa mỗi ngày"
                    className="input px-3"
                    placeholder="Đến"
                    value={params.get("maxPrice") || ""}
                    onChange={(e) => update("maxPrice", e.target.value)}
                  />
                </div>
              </Filter>
              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold">
                Giao xe tận nơi
                <input
                  type="checkbox"
                  checked={params.get("delivery") === "true"}
                  onChange={(e) =>
                    update("delivery", e.target.checked ? "true" : "")
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold">
                Đặt xe nhanh
                <input
                  type="checkbox"
                  checked={params.get("instantBooking") === "true"}
                  onChange={(e) =>
                    update("instantBooking", e.target.checked ? "true" : "")
                  }
                />
              </label>
              <Button
                className="w-full lg:hidden"
                onClick={() => setFiltersOpen(false)}
              >
                Xem {data?.total || 0} xe phù hợp
              </Button>
            </div>
          </aside>
          <div className="min-w-0">
            {!data ? (
              <PageLoading />
            ) : items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((car) => (
                  <article className="card group overflow-hidden" key={car.id}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={car.imageUrl || car.photos?.[0]}
                        alt={car.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => favorite(car)}
                        aria-label={
                          car.favorite
                            ? `Bỏ ${car.name} khỏi yêu thích`
                            : `Lưu ${car.name} vào yêu thích`
                        }
                        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow"
                      >
                        <Heart
                          size={20}
                          className={
                            car.favorite
                              ? "fill-red-500 text-red-500"
                              : "text-slate-600"
                          }
                        />
                      </button>
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        {car.instantBooking && (
                          <span className="rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold">
                            <Zap size={11} className="inline" /> Đặt nhanh
                          </span>
                        )}
                        {car.deliveryOptions?.ownerDelivery && (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold">
                            <Truck size={11} className="inline" /> Giao xe
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">{car.name}</h3>
                        {car.reviewCount > 0 ? (
                          <span className="flex items-center gap-1 text-sm font-bold">
                            <Star
                              size={14}
                              className="fill-amber-400 text-amber-400"
                            />
                            {car.rating} ({car.reviewCount})
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Chưa có đánh giá
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {car.location} · {car.seats} chỗ · {car.transmission}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <TrustScoreBadge score={car.owner?.trustScore} />
                        <span className="text-xs text-slate-500">
                          {car.totalTrips} chuyến
                        </span>
                      </div>
                      <div className="mt-4 border-t pt-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <b className="text-lg text-brand-600">
                              {money(car.pricePerDay)}
                            </b>
                            <span className="text-xs text-slate-500">
                              /ngày
                            </span>
                          </div>
                          {params.get("startDate") && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400">
                                Tiền thuê tạm tính · {car.estimatedDays} ngày
                              </p>
                              <b>{money(car.estimatedTotal)}</b>
                              <p className="mt-1 max-w-28 text-[10px] leading-4 text-slate-400">
                                Chưa gồm bảo hiểm và phí dịch vụ
                              </p>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/cars/${car.id}${query ? `?${query}` : ""}`}
                          className="mt-4 block rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-600"
                        >
                          Xem xe & báo giá
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  icon={CarIcon}
                  title="Chưa tìm thấy xe phù hợp"
                  desc="Thử mở rộng khu vực, thời gian hoặc đặt lại bộ lọc."
                />
              </div>
            )}
            {data?.totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-3"
                aria-label="Phân trang kết quả xe"
              >
                <Button
                  variant="outline"
                  disabled={data.page <= 1}
                  onClick={() => goPage(data.page - 1)}
                >
                  ← Trang trước
                </Button>
                <span className="text-sm font-semibold text-slate-600">
                  Trang {data.page}/{data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={data.page >= data.totalPages}
                  onClick={() => goPage(data.page + 1)}
                >
                  Trang sau →
                </Button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Filter({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function LegacyCarDetail() {
  const { id } = useParams(),
    { data: c } = useFetch("/cars/" + id);
  const { data: reviews } = useFetch("/reviews?carId=" + id);
  if (!c) return <Load />;
  const rental = c.pricePerDay * 3,
    fee = Math.round(rental * 0.1);
  return (
    <div className="container-app py-10">
      <div className="grid gap-4 md:grid-cols-4">
        <img
          src={c.imageUrl}
          className="h-[420px] w-full rounded-2xl object-cover md:col-span-3"
        />
        <div className="grid grid-rows-2 gap-4">
          <img
            src={c.imageUrl}
            className="h-full w-full rounded-2xl object-cover opacity-80"
          />
          <div className="grid place-items-center rounded-2xl bg-slate-900 text-white">
            <Camera />
            <span>Xem thư viện ảnh</span>
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold">{c.name}</h1>
              <VerifiedBadge />
            </div>
            <p className="mt-2 text-slate-500">
              <MapPin size={16} className="inline" /> {c.location}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <TrustScoreBadge score={c.owner?.trustScore} />
              <RiskBadge level={c.owner?.riskLevel} />
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                Bảo hiểm {c.insuranceIncluded ? "đã bao gồm" : "tùy chọn"}
              </span>
            </div>
          </div>
          <div className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            {[
              [Users, c.seats + " chỗ"],
              [Gauge, c.transmission],
              [Fuel, c.fuel],
              [CalendarDays, c.year],
            ].map(([I, x]) => (
              <div key={x}>
                <I className="mb-2 text-brand-600" />
                <b>{x}</b>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold">Về chiếc xe</h2>
            <p className="mt-3 leading-7 text-slate-600">{c.description}</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold">Chủ xe</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                {c.owner?.name?.charAt(0)}
              </div>
              <div>
                <b>{c.owner?.name}</b>
                <VerifiedBadge />
              </div>
              <div className="ml-auto">
                <TrustScoreBadge score={c.owner?.trustScore} />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Quy định thuê xe</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Giới hạn 300 km/ngày",
                "Phí trả muộn: 120.000đ/giờ",
                "CCCD & GPLX còn hiệu lực",
                "Bảo hiểm không gồm lỗi cố ý",
              ].map((x) => (
                <div className="rounded-xl bg-white p-4" key={x}>
                  ✓ {x}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Đánh giá gần đây</h2>
            <div className="mt-4 space-y-3">
              {reviews?.length ? (
                reviews.map((review) => (
                  <div className="card p-5" key={review.id}>
                    <div className="text-amber-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <p className="mt-2">{review.comment}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      — {review.renter?.name} · Chuyến đi đã xác thực
                    </p>
                  </div>
                ))
              ) : (
                <div className="card">
                  <EmptyState
                    title="Chưa có đánh giá"
                    desc="Đánh giá sẽ xuất hiện sau chuyến đi hoàn thành."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <aside>
          <div className="card sticky top-24 p-6">
            <p>
              <b className="text-2xl text-brand-600">{money(c.pricePerDay)}</b>
              <span className="text-sm text-slate-500"> / ngày</span>
            </p>
            <p className="mt-2 text-sm">
              Tiền cọc: <b>{money(c.deposit)}</b>
            </p>
            <div className="my-5">
              <PriceBreakdown
                rental={rental}
                fee={fee}
                delivery={150000}
                deposit={c.deposit}
              />
            </div>
            <Button as={Link} to={`/booking/${c.id}`} className="w-full">
              Gửi yêu cầu thuê
            </Button>
            <Button
              as={Link}
              to="/contract/1"
              variant="outline"
              className="mt-3 w-full"
            >
              Xem hợp đồng mẫu
            </Button>
            <p className="mt-4 text-center text-xs text-slate-400">
              Bạn chưa phải thanh toán ở bước này
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
export function CarDetail() {
  const { id } = useParams(),
    [params] = useSearchParams(),
    nav = useNavigate(),
    toast = useToast(),
    { user } = useAuth();
  const { data: car, error, reload } = useFetch(`/cars/${id}`),
    { data: reviews } = useFetch(`/reviews?carId=${id}`);
  const today = localIsoDate(),
    tomorrow = localIsoDate(1),
    later = localIsoDate(3);
  const [startDate, setStartDate] = useState(
      params.get("startDate") || tomorrow,
    ),
    [startTime, setStartTime] = useState(params.get("startTime") || "08:00"),
    [endDate, setEndDate] = useState(params.get("endDate") || later),
    [endTime, setEndTime] = useState(params.get("endTime") || "20:00"),
    [pickupOption, setPickupOption] = useState("pickup"),
    [promo, setPromo] = useState(params.get("promoCode") || ""),
    [appliedPromo, setAppliedPromo] = useState(params.get("promoCode") || ""),
    [quote, setQuote] = useState(null),
    [quoteError, setQuoteError] = useState(""),
    [quoting, setQuoting] = useState(false);
  const quoteRequest = useRef(0);
  const requestQuote = async (code = appliedPromo, preserveOnError = false) => {
    if (!car) return;
    const start = new Date(`${startDate}T${startTime}:00`),
      end = new Date(`${endDate}T${endTime}:00`);
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    ) {
      setQuote(null);
      setQuoteError("Thời gian trả xe phải sau thời gian nhận xe");
      return;
    }
    const requestId = ++quoteRequest.current;
    setQuoting(true);
    setQuoteError("");
    if (!preserveOnError) setQuote(null);
    try {
      const result = await api("/quotes", {
        method: "POST",
        body: JSON.stringify({
          carId: car.id,
          startDate,
          startTime,
          endDate,
          endTime,
          driverOption: params.get("driverOption") || "self",
          pickupOption,
          pickupLocation: car.handoverPoint || car.location,
          returnLocation: car.handoverPoint || car.location,
          destination: params.get("destination") || undefined,
          promoCode: code || undefined,
        }),
      });
      if (requestId !== quoteRequest.current) return;
      setQuote(result);
      setAppliedPromo(code);
    } catch (e) {
      if (requestId !== quoteRequest.current) return;
      setQuoteError(e.message);
    } finally {
      if (requestId === quoteRequest.current) setQuoting(false);
    }
  };
  useEffect(() => {
    if (car) requestQuote(appliedPromo);
    return () => {
      quoteRequest.current += 1;
    };
  }, [car?.id, startDate, startTime, endDate, endTime, pickupOption]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!car) return <Load />;
  const photos = (car.photos?.length ? car.photos : [car.imageUrl]).filter(
    Boolean,
  );
  async function toggleFavorite() {
    if (!user)
      return nav(
        `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    try {
      await api(`/favorites/${car.id}`, {
        method: car.favorite ? "DELETE" : "POST",
      });
      toast(car.favorite ? "Đã bỏ khỏi yêu thích" : "Đã lưu xe yêu thích");
      reload();
    } catch (e) {
      toast(e.message);
    }
  }
  return (
    <div className="container-app py-8 pb-28 lg:pb-8">
      <div className="mb-5 flex items-center justify-between">
        <Link
          to={`/cars?${params}`}
          className="text-sm font-bold text-slate-500"
        >
          ← Quay lại kết quả
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleFavorite}>
            <Heart
              size={17}
              className={car.favorite ? "fill-red-500 text-red-500" : ""}
            />
            {car.favorite ? "Đã yêu thích" : "Yêu thích"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                if (navigator.share)
                  await navigator.share({
                    title: car.name,
                    url: window.location.href,
                  });
                else await navigator.clipboard.writeText(window.location.href);
                toast("Đã chia sẻ liên kết xe");
              } catch (error) {
                if (error.name !== "AbortError")
                  toast("Không thể chia sẻ liên kết lúc này");
              }
            }}
          >
            <Share2 size={17} /> Chia sẻ
          </Button>
        </div>
      </div>
      <div
        className={`grid gap-3 ${photos.length > 1 ? "md:grid-cols-4" : ""}`}
      >
        <img
          src={photos[0]}
          alt={`${car.name} - ảnh chính`}
          className={`h-[430px] w-full rounded-2xl object-cover ${photos.length > 1 ? "md:col-span-3" : ""}`}
        />
        {photos.length > 1 && (
          <div className="grid grid-rows-2 gap-3">
            {photos.slice(1, 3).map((src, i) => (
              <div className="relative overflow-hidden rounded-2xl" key={i}>
                <img
                  src={src}
                  alt={`${car.name} - ảnh ${i + 2}`}
                  className="h-full w-full object-cover"
                />
                {i === Math.min(1, photos.length - 2) && (
                  <span className="absolute inset-0 grid place-items-center bg-slate-950/50 font-bold text-white">
                    <Camera className="mr-2 inline" /> {photos.length} ảnh
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {car.imageSourceUrl && (
        <p className="mt-2 text-right text-xs text-slate-400">
          Ảnh minh họa:{" "}
          <a
            href={car.imageSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline decoration-slate-300 underline-offset-2 hover:text-brand-600"
          >
            {car.imageCredit || "Nguồn ảnh"}
          </a>
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-7">
          <section>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold">{car.name}</h1>
              {car.verified && <VerifiedBadge />}
              {car.instantBooking && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <Zap size={13} className="inline" /> Đặt nhanh
                </span>
              )}
            </div>
            <p className="mt-2 text-slate-500">
              <MapPin className="inline" size={16} /> Khu vực nhận xe:{" "}
              {car.location}
              {car.handoverPoint && (
                <> · Điểm hẹn mặc định: {car.handoverPoint}</>
              )}{" "}
              · {car.totalTrips} chuyến
            </p>
          </section>
          <section className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            {[
              [Users, `${car.seats} chỗ`],
              [Gauge, car.transmission],
              [Fuel, car.fuel],
              [CalendarDays, car.year],
            ].map(([Icon, text]) => (
              <div key={text}>
                <Icon className="mb-2 text-brand-600" />
                <b>{text}</b>
              </div>
            ))}
          </section>
          <section>
            <h2 className="text-xl font-bold">Mô tả xe</h2>
            <p className="mt-3 leading-7 text-slate-600">{car.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {car.amenities?.map((item) => (
                <span
                  className="rounded-full bg-white px-3 py-2 text-sm"
                  key={item}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-bold">Chủ xe & mức độ tin cậy</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {car.owner?.name?.[0]}
              </div>
              <div>
                <b>{car.owner?.name}</b>
                <p className="mt-1 text-xs text-slate-500">
                  {car.owner?.verified
                    ? "Chủ xe đã xác thực"
                    : "Chủ xe chưa hoàn tất xác thực"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <TrustScoreBadge score={car.owner?.trustScore} />
                <RiskBadge level={car.owner?.riskLevel} />
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold">Quy định và phụ phí</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                `Giới hạn ${car.rules?.mileageLimit || 300} km/ngày`,
                `Trả muộn ${money(car.rules?.lateFeePerHour || 120000)}/giờ`,
                car.rules?.noSmoking ? "Không hút thuốc" : "Cho phép hút thuốc",
                `Cọc hoàn lại ${money(car.deposit)}`,
                "Nhiên liệu: giao đầy – trả đầy, không gồm trong giá thuê",
                `Bàn giao ${HANDOVER_POLICY.supportedFrom}–${HANDOVER_POLICY.supportedUntil}`,
              ].map((item) => (
                <div className="rounded-xl bg-white p-4 text-sm" key={item}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold">Đánh giá chuyến đi</h2>
              {!!reviews?.length && (
                <span className="text-sm font-bold text-amber-500">
                  ★ {car.rating} · {reviews.length} đánh giá
                </span>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {reviews?.length ? (
                reviews.map((review) => (
                  <div className="card p-5" key={review.id}>
                    <p className="text-amber-400">
                      {"★".repeat(review.rating)}
                    </p>
                    <p className="mt-2">{review.comment}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {review.renter?.name} · Chuyến đi đã xác thực
                    </p>
                  </div>
                ))
              ) : (
                <div className="card">
                  <EmptyState title="Chưa có đánh giá" />
                </div>
              )}
            </div>
          </section>
        </div>
        <aside>
          <div id="booking-panel" className="card sticky top-24 p-6">
            <div className="flex items-end justify-between">
              <p>
                <b className="text-2xl text-brand-600">
                  {money(car.pricePerDay)}
                </b>
                <span className="text-sm text-slate-500">/ngày</span>
              </p>
              {car.deliveryOptions?.ownerDelivery && (
                <span className="text-xs font-bold text-emerald-600">
                  <Truck size={14} className="inline" /> Có giao xe
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Giá thuê do chủ xe niêm yết. Phí nền tảng, bảo hiểm, giao xe và
              phụ phí ngoài giờ chỉ được cộng sau khi bạn chọn lịch và đều hiển
              thị riêng trong báo giá.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Nhận xe">
                <div className="space-y-2">
                  <input
                    aria-label="Ngày nhận xe"
                    type="date"
                    min={today}
                    className="input px-3"
                    value={startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStartDate(value);
                      if (endDate < value) setEndDate(value);
                    }}
                  />
                  <input
                    aria-label="Giờ nhận xe"
                    type="time"
                    className="input px-3"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Trả xe">
                <div className="space-y-2">
                  <input
                    aria-label="Ngày trả xe"
                    type="date"
                    min={startDate || tomorrow}
                    className="input px-3"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <input
                    aria-label="Giờ trả xe"
                    type="time"
                    className="input px-3"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPickupOption("pickup")}
                className={`rounded-xl border p-3 text-sm font-bold ${pickupOption === "pickup" ? "border-brand-500 bg-brand-50 text-brand-700" : ""}`}
              >
                Tự nhận xe
              </button>
              <button
                disabled={!car.deliveryOptions?.ownerDelivery}
                onClick={() => setPickupOption("delivery")}
                className={`rounded-xl border p-3 text-sm font-bold disabled:opacity-40 ${pickupOption === "delivery" ? "border-brand-500 bg-brand-50 text-brand-700" : ""}`}
              >
                Giao tận nơi
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="input"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="Mã ưu đãi"
              />
              <Button
                variant="secondary"
                onClick={() => requestQuote(promo, true)}
              >
                Áp dụng
              </Button>
            </div>
            {quoting && (
              <p className="mt-4 text-center text-sm text-slate-400">
                Đang tính giá tốt nhất...
              </p>
            )}
            {quoteError && (
              <p className="mt-4 text-sm text-red-600">{quoteError}</p>
            )}
            {quote && (
              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <PriceLine
                  label={`${quote.durationLabel || `${quote.days} ngày`} × ${money(quote.pricePerDay)}`}
                  value={quote.baseRental}
                />
                {quote.weekendSurcharge > 0 && (
                  <PriceLine
                    label="Phụ phí cuối tuần"
                    value={quote.weekendSurcharge}
                  />
                )}{" "}
                {quote.longRentalDiscount > 0 && (
                  <PriceLine
                    discount
                    label="Giảm thuê dài ngày"
                    value={quote.longRentalDiscount}
                  />
                )}
                <PriceLine
                  label="Bảo hiểm chuyến đi"
                  value={quote.insuranceFee}
                />
                {quote.driverFee > 0 && (
                  <PriceLine label="Phí tài xế" value={quote.driverFee} />
                )}
                <PriceLine label="Phí nền tảng" value={quote.platformFee} />
                {quote.outsideHoursFee > 0 && (
                  <PriceLine
                    label="Phụ phí bàn giao ngoài giờ"
                    value={quote.outsideHoursFee}
                  />
                )}
                {quote.deliveryFee > 0 && (
                  <PriceLine label="Giao nhận xe" value={quote.deliveryFee} />
                )}{" "}
                {quote.promoDiscount > 0 && (
                  <PriceLine
                    discount
                    label={`Ưu đãi ${quote.appliedPromotion?.code}`}
                    value={quote.promoDiscount}
                  />
                )}
                <div className="flex justify-between border-t pt-3 text-base">
                  <b>Tổng phí thuê</b>
                  <b className="text-brand-600">{money(quote.totalPrice)}</b>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tiền cọc hoàn lại · chưa thanh toán ở bước này</span>
                  <b>{money(quote.deposit)}</b>
                </div>
              </div>
            )}
            {quote ? (
              <Button
                as={Link}
                to={`/booking/${car.id}?quoteId=${quote.quoteId}`}
                className="mt-5 w-full"
              >
                Tiếp tục đặt xe <ArrowRight size={17} />
              </Button>
            ) : (
              <Button disabled className="mt-5 w-full">
                Chọn lịch để xem giá
              </Button>
            )}
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Báo giá có hiệu lực 15 phút · Policy {quote?.policyVersion}
            </p>
          </div>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="container-app flex items-center justify-between gap-3 px-0">
          <div>
            <p className="text-xs text-slate-500">
              {quote
                ? `Tổng ${quote.durationLabel || `${quote.days} ngày`}`
                : "Chọn lịch để báo giá"}
            </p>
            <b className="text-lg text-brand-600">
              {quote
                ? money(quote.totalPrice)
                : money(car.pricePerDay) + "/ngày"}
            </b>
          </div>
          {quote ? (
            <Button
              as={Link}
              to={`/booking/${car.id}?quoteId=${quote.quoteId}`}
            >
              Tiếp tục đặt xe
            </Button>
          ) : (
            <Button
              onClick={() =>
                document
                  .getElementById("booking-panel")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Chọn lịch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
function PriceLine({ label, value, discount = false }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <b className={discount ? "text-emerald-600" : ""}>
        {discount ? "-" : ""}
        {money(value)}
      </b>
    </div>
  );
}

export function Login() {
  const { login } = useAuth(),
    nav = useNavigate(),
    toast = useToast();
  const [search] = useSearchParams(),
    initialRole = search.get("role") === "owner" ? "owner" : "renter";
  const demoMode = import.meta.env.DEV,
    roles = demoMode ? ["renter", "owner", "admin"] : ["renter", "owner"];
  const [email, setEmail] = useState(
      demoMode ? `${initialRole}@pacecar.vn` : "",
    ),
    [password, setPassword] = useState(demoMode ? "123456" : ""),
    [role, setRole] = useState(initialRole),
    [err, setErr] = useState(""),
    [submitting, setSubmitting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    setErr("");
    setSubmitting(true);
    try {
      const u = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(u);
      toast("Đăng nhập thành công");
      const next = search.get("next"),
        safeNext =
          next?.startsWith("/") && !next.startsWith("//") ? next : null;
      nav(safeNext || "/dashboard/" + u.role);
    } catch (error) {
      setErr(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  const pick = (r) => {
    setRole(r);
    setEmail(demoMode ? `${r}@pacecar.vn` : "");
    setPassword(demoMode ? "123456" : "");
    setErr("");
  };
  return (
    <div className="container-app grid min-h-[680px] place-items-center py-12">
      <div className="card w-full max-w-md p-7">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
            <KeyRound />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Chào mừng trở lại</h1>
          <p className="mt-2 text-sm text-slate-500">
            Đăng nhập để tiếp tục cùng PaceCar
          </p>
        </div>
        <div
          role="group"
          aria-label="Vai trò tài khoản"
          className={`mt-6 grid rounded-xl bg-slate-100 p-1 ${roles.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {roles.map((r) => (
            <button
              type="button"
              onClick={() => pick(r)}
              aria-pressed={role === r}
              className={`rounded-lg py-2 text-sm font-semibold ${role === r ? "bg-white shadow" : ""}`}
              key={r}
            >
              {r === "renter"
                ? "Người thuê"
                : r === "owner"
                  ? "Chủ xe"
                  : "Admin"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className={`input ${err ? "border-red-500 focus:border-red-600 focus:ring-red-100" : ""}`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              autoComplete="email"
              aria-invalid={Boolean(err)}
              aria-describedby={err ? "login-error" : undefined}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="login-password">
              Mật khẩu
            </label>
            <input
              id="login-password"
              className={`input ${err ? "border-red-500 focus:border-red-600 focus:ring-red-100" : ""}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErr("");
              }}
              autoComplete="current-password"
              aria-invalid={Boolean(err)}
              aria-describedby={err ? "login-error" : undefined}
              required
            />
          </div>
          {err && (
            <p
              id="login-error"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {err}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-bold text-brand-700 underline-offset-4 hover:underline"
          >
            Đăng ký miễn phí
          </Link>
        </p>
        {demoMode && (
          <div className="mt-5 rounded-xl bg-blue-50 p-4 text-xs text-blue-800">
            Tài khoản demo development: {role}@pacecar.vn / 123456
          </div>
        )}
      </div>
    </div>
  );
}

export function Register() {
  const nav = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [search] = useSearchParams();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: search.get("role") === "owner" ? "owner" : "renter",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError("");
  };
  const validate = () => {
    const nextErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const digits = values.phone.replace(/\D/gu, "");
    if (!name) nextErrors.name = "Nhập họ và tên của bạn.";
    else if (name.length > 120)
      nextErrors.name = "Họ tên không được vượt quá 120 ký tự.";
    if (!email) nextErrors.email = "Nhập địa chỉ email.";
    else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)
    )
      nextErrors.email = "Email chưa đúng định dạng.";
    if (!values.phone.trim()) nextErrors.phone = "Nhập số điện thoại.";
    else if (
      values.phone.length > 30 ||
      !/^\+?[\d\s().-]+$/u.test(values.phone) ||
      digits.length < 9 ||
      digits.length > 15
    )
      nextErrors.phone = "Số điện thoại cần có từ 9 đến 15 chữ số.";
    if (values.password.length < 8 || values.password.length > 128)
      nextErrors.password = "Mật khẩu cần có từ 8 đến 128 ký tự.";
    if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = "Mật khẩu xác nhận chưa khớp.";
    if (!["renter", "owner"].includes(values.role))
      nextErrors.role = "Chọn vai trò tài khoản.";
    if (!values.acceptTerms)
      nextErrors.acceptTerms = "Bạn cần đồng ý với các điều khoản để tiếp tục.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  async function submit(event) {
    event.preventDefault();
    setFormError("");
    if (submitting || !validate()) return;
    setSubmitting(true);
    try {
      const user = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password,
          role: values.role,
          acceptTerms: values.acceptTerms,
        }),
      });
      login(user);
      toast("Tài khoản đã sẵn sàng");
      const next = search.get("next");
      const safeNext =
        next?.startsWith("/") && !next.startsWith("//") ? next : null;
      nav(safeNext || `/dashboard/${user.role}`, { replace: true });
    } catch (error) {
      const fieldErrors =
        error.details &&
        typeof error.details === "object" &&
        !Array.isArray(error.details)
          ? error.details
          : {};
      setErrors((current) => ({ ...current, ...fieldErrors }));
      setFormError(
        Object.keys(fieldErrors).length
          ? ""
          : error.message || "Chưa thể tạo tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const errorText = (field) =>
    errors[field] ? (
      <p id={`register-${field}-error`} className="mt-1.5 text-sm text-red-700">
        {errors[field]}
      </p>
    ) : null;
  const fieldClass = (field) =>
    `input ${errors[field] ? "border-red-500 focus:border-red-600 focus:ring-red-100" : ""}`;
  return (
    <div className="container-app grid min-h-[calc(100svh-4rem)] place-items-center py-8 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-lift lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="surface-grid pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-signal-400">
              <ShieldCheck size={26} />
            </div>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-blue-200">
              PaceCar
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Hành trình tốt bắt đầu từ sự an tâm.
            </h2>
            <p className="mt-4 leading-7 text-blue-100">
              Tham gia cộng đồng thuê xe minh bạch với hồ sơ rõ ràng, chi phí
              được công khai và hợp đồng số.
            </p>
          </div>
          <ul className="relative space-y-4 text-sm text-blue-50">
            {[
              "Mật khẩu tài khoản được bảo vệ bằng mã băm",
              "Chủ xe và người thuê đều được xác thực",
              "Theo dõi booking trong một nơi",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />
                {item}
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
          <div className="mb-7">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 lg:hidden">
              <UserPlus size={24} />
            </div>
            <p className="text-sm font-bold text-brand-700">
              BẮT ĐẦU CÙNG PACECAR
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Tạo tài khoản
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chọn vai trò phù hợp, bạn có thể cập nhật hồ sơ sau.
            </p>
          </div>
          <form onSubmit={submit} noValidate aria-busy={submitting}>
            <fieldset disabled={submitting} className="space-y-5">
              <legend className="label mb-2">
                Bạn muốn tham gia với vai trò
              </legend>
              <div
                role="group"
                aria-label="Chọn vai trò tài khoản"
                className="grid grid-cols-2 gap-3"
              >
                {[
                  ["renter", "Người thuê xe", "Tìm và đặt xe cho chuyến đi"],
                  ["owner", "Chủ xe", "Đăng xe và quản lý lượt thuê"],
                ].map(([role, title, description]) => (
                  <button
                    aria-pressed={values.role === role}
                    className={`btn-motion min-h-[88px] rounded-2xl border p-3 text-left sm:p-4 ${
                      values.role === role
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    key={role}
                    onClick={() => update("role", role)}
                    type="button"
                  >
                    <span className="block font-bold text-slate-900">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {description}
                    </span>
                  </button>
                ))}
              </div>
              {errorText("role")}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="register-name">
                    Họ và tên{" "}
                    <span aria-hidden="true" className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    autoComplete="name"
                    className={fieldClass("name")}
                    id="register-name"
                    maxLength={120}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "register-name-error" : undefined
                    }
                    onChange={(event) => update("name", event.target.value)}
                    value={values.name}
                  />
                  {errorText("name")}
                </div>
                <div>
                  <label className="label" htmlFor="register-email">
                    Email{" "}
                    <span aria-hidden="true" className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    autoComplete="email"
                    className={fieldClass("email")}
                    id="register-email"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "register-email-error" : undefined
                    }
                    onChange={(event) => update("email", event.target.value)}
                    type="email"
                    value={values.email}
                  />
                  {errorText("email")}
                </div>
                <div>
                  <label className="label" htmlFor="register-phone">
                    Số điện thoại{" "}
                    <span aria-hidden="true" className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    autoComplete="tel"
                    className={fieldClass("phone")}
                    id="register-phone"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "register-phone-error" : undefined
                    }
                    onChange={(event) => update("phone", event.target.value)}
                    type="tel"
                    value={values.phone}
                  />
                  {errorText("phone")}
                </div>
                <div>
                  <label className="label" htmlFor="register-password">
                    Mật khẩu{" "}
                    <span aria-hidden="true" className="text-red-600">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className={`${fieldClass("password")} pr-12`}
                      id="register-password"
                      maxLength={128}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby="register-password-hint register-password-error"
                      onChange={(event) =>
                        update("password", event.target.value)
                      }
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                    />
                    <button
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      aria-pressed={showPassword}
                      className="btn-motion absolute inset-y-0 right-1 grid w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                      onClick={() => setShowPassword((shown) => !shown)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p
                    id="register-password-hint"
                    className="mt-1.5 text-xs text-slate-500"
                  >
                    Từ 8 đến 128 ký tự.
                  </p>
                  {errorText("password")}
                </div>
                <div>
                  <label className="label" htmlFor="register-confirm-password">
                    Xác nhận mật khẩu{" "}
                    <span aria-hidden="true" className="text-red-600">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className={`${fieldClass("confirmPassword")} pr-12`}
                      id="register-confirm-password"
                      maxLength={128}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "register-confirmPassword-error"
                          : undefined
                      }
                      onChange={(event) =>
                        update("confirmPassword", event.target.value)
                      }
                      type={showConfirmation ? "text" : "password"}
                      value={values.confirmPassword}
                    />
                    <button
                      aria-label={
                        showConfirmation
                          ? "Ẩn mật khẩu xác nhận"
                          : "Hiện mật khẩu xác nhận"
                      }
                      aria-pressed={showConfirmation}
                      className="btn-motion absolute inset-y-0 right-1 grid w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                      onClick={() => setShowConfirmation((shown) => !shown)}
                      type="button"
                    >
                      {showConfirmation ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errorText("confirmPassword")}
                </div>
              </div>
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                  <input
                    checked={values.acceptTerms}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    onChange={(event) =>
                      update("acceptTerms", event.target.checked)
                    }
                    type="checkbox"
                    aria-invalid={Boolean(errors.acceptTerms)}
                    aria-describedby={
                      errors.acceptTerms
                        ? "register-acceptTerms-error"
                        : undefined
                    }
                  />
                  <span>
                    Tôi đã đọc và đồng ý với{" "}
                    <Link
                      className="font-semibold text-brand-700 underline underline-offset-2"
                      to="/terms"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link
                      className="font-semibold text-brand-700 underline underline-offset-2"
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Chính sách bảo mật
                    </Link>
                    .
                  </span>
                </label>
                {errorText("acceptTerms")}
              </div>
            </fieldset>
            {formError && (
              <p
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </p>
            )}
            <Button className="mt-6 w-full" disabled={submitting} type="submit">
              {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              {!submitting && <ArrowRight size={18} />}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              className="font-bold text-brand-700 underline-offset-4 hover:underline"
              to="/login"
            >
              Đăng nhập
            </Link>
          </p>
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Thông tin tài khoản được gửi qua kết nối bảo mật và mật khẩu chỉ
            được lưu dưới dạng mã băm.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LegalInformation() {
  const location = useLocation();
  const privacy = location.pathname === "/privacy";
  const title = privacy ? "Chính sách bảo mật" : "Điều khoản sử dụng";
  const sections = privacy
    ? [
        [
          "Thông tin được xử lý",
          "PaceCar cần họ tên, email, số điện thoại và mật khẩu để tạo, bảo vệ tài khoản. Mật khẩu được lưu dưới dạng hash; token phiên đăng nhập chỉ được lưu dưới dạng hash ở máy chủ.",
        ],
        [
          "Cách sử dụng dữ liệu",
          "Thông tin hồ sơ được dùng để vận hành tài khoản, hỗ trợ đặt xe và bảo vệ các giao dịch trong ứng dụng. Không nhập thông tin thanh toán thật hoặc dữ liệu nhạy cảm vào bản demo.",
        ],
        [
          "Lưu trữ và bảo vệ",
          "Bản demo lưu dữ liệu trên máy chủ của môi trường đang chạy; thời hạn lưu và tính bền vững phụ thuộc cấu hình triển khai. Không có tích hợp thanh toán thật trong bản demo.",
        ],
        [
          "Quyền riêng tư",
          "Liên hệ hello@pacecar.vn để hỏi về hồ sơ của bạn. Trước khi mở dịch vụ production, đơn vị vận hành cần xác nhận chính sách này, thời hạn lưu và quy trình yêu cầu dữ liệu phù hợp pháp luật.",
        ],
      ]
    : [
        [
          "Tài khoản",
          "Cung cấp thông tin chính xác, giữ an toàn cho thông tin đăng nhập và thông báo cho PaceCar khi nghi ngờ tài khoản bị truy cập trái phép. Mỗi người chỉ sử dụng vai trò phù hợp với hoạt động của mình.",
        ],
        [
          "Sử dụng nền tảng",
          "Không giả mạo danh tính, đăng nội dung trái pháp luật, tìm cách vượt quyền truy cập hoặc gây ảnh hưởng đến tính sẵn sàng của dịch vụ. Chủ xe và người thuê cần kiểm tra kỹ thông tin trước khi xác nhận giao dịch.",
        ],
        [
          "Vai trò của PaceCar",
          "PaceCar là nền tảng công nghệ kết nối người thuê với chủ xe, cung cấp công cụ báo giá, hợp đồng số, bằng chứng giao nhận và hỗ trợ tranh chấp. Hợp đồng thuê được ký trực tiếp giữa người thuê và chủ xe; PaceCar không phải chủ sở hữu hoặc bên cho thuê phương tiện.",
        ],
        [
          "Giá và phí dịch vụ",
          "Chủ xe niêm yết giá thuê và tiền cọc. Người thuê trả phí nền tảng 10% trên tiền thuê sau điều chỉnh, cùng các khoản bảo hiểm, giao xe, tài xế hoặc ngoài giờ nếu phát sinh. Mọi khoản phí phải xuất hiện trong báo giá trước khi người thuê gửi yêu cầu.",
        ],
        [
          "Hủy xe, bàn giao và nhiên liệu",
          "Nếu chủ xe hủy sau xác nhận, PaceCar ưu tiên tìm xe thay thế hoặc hoàn lại đầy đủ khoản đã thanh toán trong bản demo, đồng thời ghi nhận vi phạm của chủ xe. Hai bên phải chụp ảnh, ghi ODO và mức nhiên liệu khi nhận/trả; mặc định giao đầy – trả đầy và nhiên liệu sử dụng không nằm trong giá thuê.",
        ],
        [
          "Giao dịch ngoài nền tảng",
          "PaceCar chỉ có thể hỗ trợ các giao dịch được tạo và lưu bằng công cụ của nền tảng. Hai bên tự liên hệ, thanh toán hoặc ký thỏa thuận bên ngoài sẽ không được áp dụng báo giá, hợp đồng số, bằng chứng giao nhận và quy trình hỗ trợ của PaceCar.",
        ],
        [
          "Bản demo",
          "PaceCar hiện là bản demo. Báo giá, đặt xe, hợp đồng điện tử và thanh toán mô phỏng không thay thế xác nhận giao dịch hoặc tư vấn pháp lý; không dùng bản demo để gửi tiền hay thực hiện giao dịch thuê xe thật.",
        ],
        [
          "Cập nhật",
          "Điều khoản này là thông tin sử dụng cho bản demo và cần được đơn vị vận hành rà soát, cập nhật trước khi cung cấp dịch vụ production. Liên hệ hello@pacecar.vn khi cần hỗ trợ.",
        ],
      ];
  return (
    <div className="container-app max-w-4xl py-10 sm:py-16">
      <Link
        to="/register"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Quay lại đăng ký
      </Link>
      <p className="mt-8 text-sm font-bold uppercase tracking-wider text-brand-700">
        PACECAR · BẢN DEMO
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-slate-500">Cập nhật: 8 tháng 10, 2026</p>
      <div className="mt-8 space-y-5">
        {sections.map(([heading, content]) => (
          <section className="card p-5 sm:p-7" key={heading}>
            <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
            <p className="mt-2 leading-7 text-slate-600">{content}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-500">
        Tài liệu này mô tả hành vi của bản demo, không phải ý kiến tư vấn pháp
        lý. Đơn vị vận hành cần phê duyệt nội dung áp dụng cho dịch vụ thực tế.
      </p>
    </div>
  );
}

function LegacyBooking() {
  const { carId } = useParams(),
    { data: c } = useFetch("/cars/" + carId),
    { user } = useAuth(),
    nav = useNavigate(),
    toast = useToast();
  const [f, setF] = useState({
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    pickupLocation: "Hà Nội",
    returnLocation: "Hà Nội",
    driverOption: "self",
    notes: "",
  });
  if (!c) return <Load />;
  const days = Math.max(
      1,
      Math.ceil((new Date(f.endDate) - new Date(f.startDate)) / 86400000),
    ),
    rental = days * c.pricePerDay,
    fee = Math.round(rental * 0.1),
    total = rental + fee;
  async function submit(e) {
    e.preventDefault();
    if (!user) {
      toast("Vui lòng đăng nhập trước");
      return nav("/login");
    }
    const b = await api("/bookings", {
      method: "POST",
      body: JSON.stringify({
        ...f,
        renterId: user.id,
        ownerId: c.ownerId,
        carId: c.id,
        totalPrice: total,
        deposit: c.deposit,
        platformFee: fee,
        riskLevel: user.riskLevel || "Low",
      }),
    });
    toast("Đã gửi yêu cầu thuê xe");
    nav(`/contract/${b.id}`);
  }
  return (
    <div className="container-app py-12">
      <PageHead
        eyebrow="Yêu cầu thuê xe"
        title={c.name}
        desc="Thông tin của bạn sẽ được chủ xe xem xét trước khi xác nhận."
      />
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="card space-y-5 p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ngày bắt đầu">
              <input
                type="date"
                className="input"
                value={f.startDate}
                onChange={(e) => setF({ ...f, startDate: e.target.value })}
              />
            </Field>
            <Field label="Ngày kết thúc">
              <input
                type="date"
                className="input"
                value={f.endDate}
                onChange={(e) => setF({ ...f, endDate: e.target.value })}
              />
            </Field>
            <Field label="Địa điểm nhận xe">
              <input
                className="input"
                value={f.pickupLocation}
                onChange={(e) => setF({ ...f, pickupLocation: e.target.value })}
              />
            </Field>
            <Field label="Địa điểm trả xe">
              <input
                className="input"
                value={f.returnLocation}
                onChange={(e) => setF({ ...f, returnLocation: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Hình thức">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["self", "Tự lái"],
                ["driver", "Có tài xế"],
              ].map(([v, t]) => (
                <button
                  type="button"
                  onClick={() => setF({ ...f, driverOption: v })}
                  className={`rounded-xl border p-4 text-left ${f.driverOption === v ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}
                  key={v}
                >
                  <b>{t}</b>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Giấy tờ xác thực">
            <div className="grid gap-3 sm:grid-cols-2">
              <EvidenceUploader label="CCCD hai mặt" />
              <EvidenceUploader label="Giấy phép lái xe" />
            </div>
          </Field>
          <Field label="Ghi chú">
            <textarea
              className="input"
              rows="3"
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
            />
          </Field>
        </div>
        <aside>
          <div className="card sticky top-24 p-6">
            <img
              src={c.imageUrl}
              className="mb-4 h-36 w-full rounded-xl object-cover"
            />
            <h3 className="font-bold">{c.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {days} ngày · {c.location}
            </p>
            <div className="my-5">
              <PriceBreakdown rental={rental} fee={fee} deposit={c.deposit} />
            </div>
            <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <b>Trust Score dự kiến: {user?.trustScore || 50}/100</b>
              <p className="mt-1 text-xs">
                Rule-based Trust Score – MVP version. Không phải AI.
              </p>
            </div>
            <Button className="w-full">Gửi yêu cầu thuê</Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
function BackendSync({ at, onRefresh }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <span>
        <b>● Backend đã kết nối</b> · Đồng bộ lúc{" "}
        {at ? new Date(at).toLocaleTimeString("vi-VN") : "vừa xong"}
      </span>
      <Button variant="outline" onClick={onRefresh}>
        Làm mới dữ liệu
      </Button>
    </div>
  );
}
function BookingRow({ b, actions = false, reload }) {
  const toast = useToast();
  const [decision, setDecision] = useState(null);
  async function status(s) {
    try {
      await api(`/bookings/${b.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: s }),
      });
      toast(`Đã cập nhật booking sang ${s}`);
      reload?.();
      setDecision(null);
    } catch (statusError) {
      toast(statusError.message);
    }
  }
  const canViewContract = [
      "Accepted",
      "Deposit Required",
      "Contract Signed",
      "Ready for Check-in",
      "Ongoing",
      "Check-out Review",
      "Completed",
      "Dispute",
    ].includes(b.status),
    canViewEvidence = [
      "Contract Signed",
      "Ready for Check-in",
      "Ongoing",
      "Check-out Review",
      "Completed",
      "Dispute",
    ].includes(b.status),
    canDispute = ["Ongoing", "Check-out Review", "Dispute"].includes(b.status);
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-0 md:flex-row md:items-center">
      <img
        src={b.car?.imageUrl}
        alt={b.car?.name || "Xe trong đơn thuê"}
        loading="lazy"
        className="h-20 w-28 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <b>{b.car?.name}</b>
          <StatusBadge status={b.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {actions && `${b.renter?.name} · `}
          {dateTime(b.startDate)} – {dateTime(b.endDate)} ·{" "}
          {money(b.totalPrice)}
        </p>
        {actions && (
          <div className="mt-2 flex gap-2">
            <TrustScoreBadge score={b.renter?.trustScore} />
            <RiskBadge level={b.riskLevel} />
          </div>
        )}
      </div>
      {actions && b.status === "Pending" ? (
        <div className="flex gap-2">
          <Button onClick={() => setDecision("Accepted")}>Chấp nhận</Button>
          <Button variant="danger" onClick={() => setDecision("Rejected")}>
            Từ chối
          </Button>
        </div>
      ) : actions && b.status === "Check-out Review" ? (
        <Button onClick={() => setDecision("Completed")}>
          Xác nhận hoàn tất
        </Button>
      ) : canViewContract || canViewEvidence || canDispute ? (
        <div className="flex flex-wrap gap-2">
          {canViewContract && (
            <Button as={Link} to={`/contract/${b.id}`} variant="outline">
              Hợp đồng
            </Button>
          )}
          {canViewEvidence && (
            <Button as={Link} to={`/evidence/${b.id}`} variant="outline">
              Bằng chứng
            </Button>
          )}
          {canDispute && (
            <Button as={Link} to={`/disputes/${b.id}`} variant="outline">
              Hỗ trợ
            </Button>
          )}
        </div>
      ) : null}
      <Modal
        open={!!decision}
        title={
          decision === "Accepted"
            ? "Chấp nhận yêu cầu?"
            : decision === "Completed"
              ? "Xác nhận hoàn tất chuyến?"
              : "Từ chối yêu cầu?"
        }
        onClose={() => setDecision(null)}
        actions={
          <>
            <Button variant="outline" onClick={() => setDecision(null)}>
              Hủy
            </Button>
            <Button
              variant={decision === "Rejected" ? "danger" : "primary"}
              onClick={() => status(decision)}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        Booking <b>#PC{b.id}</b> sẽ được cập nhật, ghi vào nhật ký và gửi thông
        báo cho người thuê.
      </Modal>
    </div>
  );
}
function LegacyRenterDashboard() {
  const { user } = useAuth();
  const id = user?.role === "renter" ? user.id : 1;
  const { data, error, reload } = useFetch("/dashboard/renter/" + id);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Load />;
  return (
    <div className="py-4">
      <PageHead
        eyebrow="Bảng điều khiển người thuê"
        title={`Xin chào, ${data.user.name}`}
        desc="Quản lý hành trình, hợp đồng và Trust Score của bạn."
      />
      <BackendSync at={data.generatedAt} onRefresh={reload} />
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard
          icon={ShieldCheck}
          title="Trust Score"
          value={`${data.user.trustScore}/100`}
          detail="Rule-based · MVP version"
        />
        <DashboardCard
          icon={CarIcon}
          title="Chuyến đang hoạt động"
          value={data.stats?.active ?? 0}
        />
        <DashboardCard
          icon={CheckCircle2}
          title="Chuyến hoàn thành"
          value={data.bookings.filter((x) => x.status === "Completed").length}
        />
      </div>
      <div className="card mt-8 p-6">
        <h2 className="text-xl font-bold">Các chuyến xe của tôi</h2>
        <div className="mt-3">
          {data.bookings.length ? (
            data.bookings.map((b) => (
              <BookingRow key={b.id} b={b} reload={reload} />
            ))
          ) : (
            <EmptyState
              icon={CarIcon}
              title="Chưa có hành trình"
              desc="Tìm một chiếc xe phù hợp để bắt đầu."
            />
          )}
        </div>
      </div>
    </div>
  );
}
function LegacyOwnerDashboard() {
  const { user } = useAuth();
  const id = user?.role === "owner" ? user.id : 4;
  const { data, error, reload } = useFetch("/dashboard/owner/" + id);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Load />;
  return (
    <div className="py-4">
      <div className="flex items-start justify-between">
        <PageHead
          eyebrow="Bảng điều khiển chủ xe"
          title={`Xin chào, ${data.user.name}`}
          desc="Theo dõi đội xe, doanh thu và yêu cầu thuê mới."
        />
        <Button as={Link} to="/owner/cars/new">
          + Đăng xe mới
        </Button>
      </div>
      <BackendSync at={data.generatedAt} onRefresh={reload} />
      <div id="finance" className="grid gap-5 md:grid-cols-4">
        <DashboardCard
          icon={Wallet}
          title="Doanh thu đã hoàn tất"
          value={money(data.revenueSettled ?? data.revenue)}
        />
        <DashboardCard
          icon={CarIcon}
          title="Xe đang công khai"
          value={
            data.cars.filter((car) => car.listingStatus === "Published").length
          }
        />
        <DashboardCard
          icon={CalendarDays}
          title="Yêu cầu mới"
          value={data.bookings.filter((x) => x.status === "Pending").length}
        />
        <DashboardCard
          icon={Star}
          title="Trust Score"
          value={data.user.trustScore}
        />
      </div>
      <div className="mt-8 grid gap-7 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">Yêu cầu thuê xe</h2>
          {data.bookings.length ? (
            data.bookings.map((b) => (
              <BookingRow key={b.id} b={b} actions reload={reload} />
            ))
          ) : (
            <p className="py-12 text-center text-slate-400">
              Chưa có yêu cầu mới
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle /> Cảnh báo rủi ro
            </h3>
            {data.alerts?.length ? (
              data.alerts.slice(0, 3).map((alert) => (
                <div
                  className="mt-3 rounded-xl bg-white/70 p-3 text-sm"
                  key={alert.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b>{alert.type}</b>
                    <StatusBadge status={alert.status} />
                  </div>
                  <p className="mt-1 text-amber-900/70">{alert.message}</p>
                </div>
              ))
            ) : (
              <p className="mt-3 text-sm text-amber-800/70">
                Không có cảnh báo đang mở.
              </p>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-bold">Lịch đặt xe</h3>
            <div className="mt-4 space-y-3">
              {data.calendar?.length ? (
                data.calendar.slice(0, 5).map((item) => (
                  <div className="rounded-xl bg-slate-50 p-3" key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <b className="text-sm">{item.carName}</b>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {date(item.startDate)} – {date(item.endDate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có lịch thuê xe.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Xe của tôi</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.cars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
function LegacyAdminDashboard() {
  const { data, error, reload } = useFetch("/dashboard/admin"),
    toast = useToast();
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Load />;
  async function update(id, status) {
    try {
      await api(`/bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast("Đã cập nhật trạng thái");
      reload();
    } catch (error) {
      toast(error.message);
      reload();
    }
  }
  return (
    <div className="py-4">
      <PageHead
        eyebrow="PaceCar Operations"
        title="Trung tâm quản trị"
        desc="Tổng quan vận hành, rủi ro và giao dịch trên nền tảng."
      />
      <BackendSync at={data.generatedAt} onRefresh={reload} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          icon={Users}
          title="Người dùng"
          value={data.stats.users}
        />
        <DashboardCard icon={CarIcon} title="Xe" value={data.stats.cars} />
        <DashboardCard
          icon={CalendarDays}
          title="Đơn thuê"
          value={data.stats.bookings}
        />
        <DashboardCard
          icon={Wallet}
          title="Phí đã ghi nhận"
          value={money(data.stats.revenueSettled ?? data.stats.revenue)}
        />
        <DashboardCard
          icon={AlertTriangle}
          title="Tranh chấp chờ"
          value={data.stats.pendingDisputes}
        />
      </div>
      <div className="mt-8 grid gap-7 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-5">
            <h2 className="text-xl font-bold">Đơn thuê gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Mã</th>
                  <th className="p-4">Xe</th>
                  <th className="p-4">Giá trị</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((b) => (
                  <tr className="border-t" key={b.id}>
                    <td className="p-4">#PC{b.id}</td>
                    <td className="p-4 font-semibold">
                      {data.cars.find((c) => c.id === b.carId)?.name}
                    </td>
                    <td className="p-4">{money(b.totalPrice)}</td>
                    <td className="p-4">
                      <select
                        value={b.status}
                        onChange={(e) => update(b.id, e.target.value)}
                        className="rounded-lg border p-2"
                      >
                        <option>Pending</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                        <option>Dispute</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold">Tổng quan rủi ro</h3>
            {[
              ["Low Risk", 68, "bg-emerald-500"],
              ["Medium Risk", 24, "bg-amber-500"],
              ["High Risk", 8, "bg-red-500"],
            ].map(([x, n, c]) => (
              <div className="mt-4" key={x}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{x}</span>
                  <b>{n}%</b>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div
                    className={`h-2 rounded ${c}`}
                    style={{ width: n + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-bold">Tranh chấp</h3>
            {data.disputes.map((d) => (
              <div className="mt-4 flex justify-between text-sm" key={d.id}>
                <span>
                  #{d.id} · {d.reason}
                </span>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card mt-8 overflow-x-auto p-5">
        <h2 className="mb-4 text-xl font-bold">Người dùng nền tảng</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-3">Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trust Score</th>
              <th>Rủi ro</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr className="border-t" key={u.id}>
                <td className="py-3 font-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>
                  <TrustScoreBadge score={u.trustScore} />
                </td>
                <td>
                  <RiskBadge level={u.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function Contract() {
  const { bookingId } = useParams(),
    { user } = useAuth(),
    toast = useToast(),
    { data: c, error, reload } = useFetch("/contracts/" + bookingId);
  const [working, setWorking] = useState(false);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!c) return <Load />;
  const b = c.booking;
  if (!b || !c.car || !c.renter || !c.owner)
    return (
      <ErrorState
        message="Dữ liệu hợp đồng chưa đầy đủ. Vui lòng quay lại đơn thuê và thử lại."
        onRetry={reload}
      />
    );
  const isOwner = user?.role === "owner" && user.id === b.ownerId,
    isRenter = user?.role === "renter" && user.id === b.renterId,
    canIssue =
      !c.id &&
      (isOwner || user?.role === "admin") &&
      b.paymentStatus !== "Unpaid" &&
      ["Accepted", "Deposit Required"].includes(b.status),
    alreadySigned = isOwner ? c.ownerSigned : isRenter ? c.renterSigned : true,
    canSign = Boolean(
      c.id &&
      (isOwner || isRenter) &&
      !alreadySigned &&
      ["Accepted", "Deposit Required"].includes(b.status),
    );
  async function contractAction(kind) {
    setWorking(true);
    try {
      await api(
        kind === "issue" ? "/contracts" : `/contracts/${bookingId}/sign`,
        {
          method: kind === "issue" ? "POST" : "PUT",
          body:
            kind === "issue"
              ? JSON.stringify({ bookingId: Number(bookingId) })
              : JSON.stringify({ consent: true }),
        },
      );
      toast(
        kind === "issue" ? "Đã phát hành hợp đồng" : "Đã ký hợp đồng điện tử",
      );
      reload();
    } catch (actionError) {
      toast(actionError.message);
    } finally {
      setWorking(false);
    }
  }
  return (
    <div className="container-app max-w-4xl py-12">
      <div className="mb-5 flex justify-between">
        <Link to="/bookings" className="text-sm font-semibold text-brand-600">
          ← Quay lại
        </Link>
        <StatusBadge status={c.status} />
      </div>
      {!c.id && (
        <div className="card mb-5 border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <b>Hợp đồng chưa được phát hành.</b>
          <p className="mt-1">
            {canIssue
              ? "Kiểm tra thông tin hai bên trước khi phát hành bản hợp đồng cố định."
              : b.paymentStatus === "Unpaid"
                ? "Đang chờ người thuê hoàn tất thanh toán tiền cọc."
                : "Vui lòng chờ chủ xe chấp nhận yêu cầu và phát hành hợp đồng."}
          </p>
          {canIssue && (
            <Button
              className="mt-4"
              disabled={working}
              onClick={() => contractAction("issue")}
            >
              <FileSignature size={17} />
              {working ? "Đang phát hành..." : "Phát hành hợp đồng"}
            </Button>
          )}
        </div>
      )}
      <article className="card bg-white p-8 sm:p-12">
        <div className="border-b pb-7 text-center">
          <p className="text-2xl font-extrabold text-brand-700">PACECAR</p>
          <h1 className="mt-5 text-2xl font-bold uppercase">
            Hợp đồng thuê xe điện tử
          </h1>
          <p className="mt-2 text-sm text-slate-500">Số: {c.contractNumber}</p>
        </div>
        <p className="py-6 text-center text-sm italic">
          Căn cứ Bộ luật Dân sự và trên tinh thần tự nguyện, minh bạch của các
          bên.
        </p>
        <ContractSection n="01" title="Thông tin các bên">
          <div className="grid gap-5 sm:grid-cols-2">
            <Info
              title="Bên thuê"
              lines={[
                c.renter.name,
                c.renter.phone || "Chưa cung cấp số điện thoại",
                c.renter.verified
                  ? "Danh tính: Đã xác thực"
                  : "Danh tính: Chưa xác thực",
              ]}
            />
            <Info
              title="Chủ xe"
              lines={[
                c.owner.name,
                c.owner.phone || "Chưa cung cấp số điện thoại",
                c.owner.verified
                  ? "Danh tính: Đã xác thực"
                  : "Danh tính: Chưa xác thực",
              ]}
            />
          </div>
        </ContractSection>
        <ContractSection n="02" title="Thông tin xe & thời gian">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info
              title="Phương tiện"
              lines={[
                c.car.name,
                `Biển số: ${c.car.licensePlate || "Chỉ hiển thị khi đủ điều kiện giao xe"}`,
                `Bảo hiểm: ${c.car.insuranceIncluded ? "Đã xác nhận" : "Theo điều khoản chuyến đi"}`,
              ]}
            />
            <Info
              title="Thời gian thuê"
              lines={[
                `${dateTime(b.startDate)} – ${dateTime(b.endDate)}`,
                `Nhận xe: ${b.pickupLocation}`,
                `Trả xe: ${b.returnLocation}`,
                `Tổng thanh toán: ${money(b.totalPrice)}`,
                `Tiền cọc hoàn lại: ${money(b.deposit)}`,
                `Trạng thái tiền cọc: ${b.paymentStatus === "Paid" ? "Đã thanh toán (mô phỏng)" : b.paymentStatus === "Unpaid" ? "Chưa thanh toán" : "Chưa áp dụng"}`,
              ]}
            />
          </div>
        </ContractSection>
        <ContractSection n="03" title="Trách nhiệm & điều khoản">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
            <li>
              Bên thuê sử dụng xe đúng mục đích, không giao xe cho người không
              có trong hợp đồng.
            </li>
            <li>
              Hai bên ghi nhận tình trạng xe bằng ảnh/video khi giao và nhận xe.
            </li>
            <li>
              Mọi sự cố phải được thông báo ngay cho PaceCar và đơn vị bảo hiểm.
            </li>
            <li>
              Nhiên liệu không nằm trong giá thuê; hai bên áp dụng giao đầy –
              trả đầy hoặc đối chiếu theo mức được ghi trong biên bản giao nhận.
            </li>
            <li>
              Hợp đồng này được ký trực tiếp giữa người thuê và chủ xe. PaceCar
              cung cấp nền tảng và hỗ trợ xử lý dựa trên hồ sơ, không phải chủ
              xe.
            </li>
            <li>{c.terms || "Điều khoản đang chờ được phát hành."}</li>
          </ol>
        </ContractSection>
        <div className="mt-12 grid grid-cols-2 gap-10 text-center">
          <Signature
            name={c.renter?.name || "Người thuê"}
            signed={c.renterSigned}
            signedAt={c.renterSignedAt}
          />
          <Signature
            name={c.owner?.name || "Chủ xe"}
            signed={c.ownerSigned}
            signedAt={c.ownerSignedAt}
          />
        </div>
        {canSign && (
          <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
            <p className="text-sm text-slate-600">
              Khi ký, bạn xác nhận đã đọc toàn bộ điều khoản và đồng ý sử dụng
              chữ ký điện tử cho booking này.
            </p>
            <Button
              className="mt-4"
              disabled={working}
              onClick={() => contractAction("sign")}
            >
              <FileSignature size={17} />
              {working ? "Đang ký..." : "Đồng ý và ký hợp đồng"}
            </Button>
          </div>
        )}
        <div className="mt-10 rounded-xl bg-blue-50 p-4 text-center text-xs text-blue-700">
          <Shield size={15} className="inline" /> Tài liệu được lưu cùng dấu
          thời gian và nhật ký thao tác · Mã xác minh {c.contractNumber}
        </div>
      </article>
    </div>
  );
}
function ContractSection({ n, title, children }) {
  return (
    <section className="border-t py-7">
      <h2 className="mb-5 font-bold">
        <span className="mr-3 text-brand-600">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
function Info({ title, lines }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <b className="text-sm">{title}</b>
      {lines.map((x) => (
        <p className="mt-2 text-sm text-slate-600" key={x}>
          {x}
        </p>
      ))}
    </div>
  );
}
function Signature({ name, signed, signedAt }) {
  return (
    <div>
      <b>{name}</b>
      <div className="mt-3 grid h-24 place-items-center border-b text-sm italic text-brand-600">
        {signed ? "✓ Đã ký điện tử" : "Chờ chữ ký"}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {signedAt
          ? `Ký lúc ${new Date(signedAt).toLocaleString("vi-VN")}`
          : "Chữ ký điện tử"}
      </p>
    </div>
  );
}
export function Evidence() {
  const { bookingId } = useParams(),
    toast = useToast();
  const evidenceFetch = useFetch("/evidence/" + bookingId),
    bookingFetch = useFetch("/bookings/" + bookingId);
  const [drafts, setDrafts] = useState({
      checkin: { fuel: "", odometer: "", notes: "", files: [] },
      checkout: { fuel: "", odometer: "", notes: "", files: [] },
    }),
    [saving, setSaving] = useState("");
  const evidence = evidenceFetch.data,
    booking = bookingFetch.data;
  useEffect(() => {
    if (evidenceFetch.loading) return;
    setDrafts((current) => ({
      checkin: {
        ...current.checkin,
        fuel: evidence?.fuelBefore ?? "",
        odometer: evidence?.odometerBefore ?? "",
        notes: evidence?.checkinNotes ?? evidence?.notes ?? "",
      },
      checkout: {
        ...current.checkout,
        fuel: evidence?.fuelAfter ?? "",
        odometer: evidence?.odometerAfter ?? "",
        notes: evidence?.checkoutNotes ?? evidence?.notes ?? "",
      },
    }));
  }, [evidence, evidenceFetch.loading]);
  const error = evidenceFetch.error || bookingFetch.error;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          evidenceFetch.reload();
          bookingFetch.reload();
        }}
      />
    );
  if (evidenceFetch.loading || bookingFetch.loading || !booking)
    return <Load />;
  const editable = {
      checkin: ["Contract Signed", "Ready for Check-in"].includes(
        booking.status,
      ),
      checkout: ["Ongoing", "Check-out Review"].includes(booking.status),
    },
    stages = [
      {
        key: "checkin",
        title: "Check-in · Khi nhận xe",
        photos: evidence?.checkinPhotos || [],
      },
      {
        key: "checkout",
        title: "Check-out · Khi trả xe",
        photos: evidence?.checkoutPhotos || [],
      },
    ];
  async function saveStage(stage) {
    const draft = drafts[stage.key];
    if (!draft.files.length) {
      toast("Mỗi lần lưu biên bản cần chọn ít nhất một ảnh mới");
      return;
    }
    if (
      draft.fuel === "" ||
      Number(draft.fuel) < 0 ||
      Number(draft.fuel) > 100 ||
      draft.odometer === "" ||
      Number(draft.odometer) < 0
    ) {
      toast("Mức nhiên liệu hoặc số ODO không hợp lệ");
      return;
    }
    setSaving(stage.key);
    try {
      let uploaded = [];
      if (draft.files.length) {
        const form = new FormData();
        form.append("bookingId", bookingId);
        for (const file of draft.files) form.append("files", file);
        const result = await api("/uploads/evidence", {
          method: "POST",
          body: form,
        });
        uploaded = result.files || [];
      }
      await api("/evidence", {
        method: "POST",
        body: JSON.stringify({
          bookingId: Number(bookingId),
          phase: stage.key,
          photos: uploaded.map((file) => file.id),
          fuel: Number(draft.fuel),
          odometer: Number(draft.odometer),
          notes: draft.notes.trim(),
        }),
      });
      toast(`Đã lưu biên bản ${stage.key === "checkin" ? "nhận" : "trả"} xe`);
      setDrafts((current) => ({
        ...current,
        [stage.key]: { ...current[stage.key], files: [] },
      }));
      evidenceFetch.reload();
      bookingFetch.reload();
    } catch (saveError) {
      toast(saveError.message);
    } finally {
      setSaving("");
    }
  }
  const beforeOdo = Number(evidence?.odometerBefore),
    afterOdo = Number(evidence?.odometerAfter),
    canCompare =
      Number.isFinite(beforeOdo) &&
      Number.isFinite(afterOdo) &&
      (evidence?.checkinPhotos?.length || 0) > 0 &&
      (evidence?.checkoutPhotos?.length || 0) > 0;
  return (
    <div className="container-app py-12">
      <PageHead
        eyebrow={`Booking #${bookingId}`}
        title="Biên bản giao nhận xe"
        desc="Chỉ dữ liệu đã lưu trên backend mới được hiển thị; ảnh có dấu thời gian là căn cứ đối chiếu."
      />
      <div className="grid gap-7 lg:grid-cols-2">
        {stages.map((stage) => {
          const draft = drafts[stage.key],
            complete =
              stage.photos.length > 0 &&
              draft.fuel !== "" &&
              draft.odometer !== "";
          return (
            <section className="card p-6" key={stage.key}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">{stage.title}</h2>
                <StatusBadge status={complete ? "Completed" : "Pending"} />
              </div>
              {stage.photos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {stage.photos.map((photo, index) => (
                    <AuthorizedEvidenceImage
                      key={typeof photo === "object" ? photo.id : photo}
                      asset={photo}
                      alt={`${stage.title} ${index + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
                  Chưa có ảnh được lưu cho giai đoạn này.
                </div>
              )}
              {editable[stage.key] && (
                <label className="mt-4 block rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 text-sm text-brand-700">
                  <b>Chọn ảnh giao nhận</b>
                  <span className="mt-1 block text-xs">
                    JPG, PNG hoặc WEBP · tối đa 6 ảnh
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="mt-3 block w-full text-xs"
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [stage.key]: {
                          ...current[stage.key],
                          files: Array.from(event.target.files || []).slice(
                            0,
                            6,
                          ),
                        },
                      }))
                    }
                  />
                  {draft.files.length > 0 && (
                    <span className="mt-2 block text-xs font-semibold">
                      Đã chọn {draft.files.length} ảnh mới
                    </span>
                  )}
                </label>
              )}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Field label="Mức nhiên liệu (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={draft.fuel}
                    readOnly={!editable[stage.key]}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [stage.key]: {
                          ...current[stage.key],
                          fuel: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Số ODO">
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={draft.odometer}
                    readOnly={!editable[stage.key]}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [stage.key]: {
                          ...current[stage.key],
                          odometer: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              </div>
              <Field label="Ghi chú tình trạng xe">
                <textarea
                  className="input mt-2"
                  rows="3"
                  value={draft.notes}
                  readOnly={!editable[stage.key]}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [stage.key]: {
                        ...current[stage.key],
                        notes: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              {editable[stage.key] && (
                <Button
                  className="mt-4 w-full"
                  disabled={saving === stage.key}
                  onClick={() => saveStage(stage)}
                >
                  {saving === stage.key ? "Đang lưu..." : "Lưu biên bản"}
                </Button>
              )}
            </section>
          );
        })}
      </div>
      <section className="card mt-7 p-6">
        <h2 className="text-xl font-bold">Đối chiếu trước / sau</h2>
        <div
          className={`my-5 rounded-xl p-4 text-sm ${canCompare ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-600"}`}
        >
          {canCompare
            ? `Quãng đường ghi nhận: ${Math.max(0, afterOdo - beforeOdo).toLocaleString("vi-VN")} km. Hai bên vẫn cần tự đối chiếu hình ảnh trước khi xác nhận.`
            : "Chưa đủ ảnh check-in và check-out để đưa ra kết quả đối chiếu."}
        </div>
        {["Ongoing", "Check-out Review", "Dispute"].includes(
          booking.status,
        ) && (
          <Button as={Link} to={`/disputes/${bookingId}`} variant="danger">
            Mở trung tâm tranh chấp
          </Button>
        )}
      </section>
    </div>
  );
}

function AuthorizedEvidenceImage({ asset, alt }) {
  const id = typeof asset === "object" ? asset.id : asset,
    source =
      typeof asset === "object" ? asset.url : `/api/evidence-assets/${id}`;
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true,
      objectUrl = "";
    const token = localStorage.getItem("pacecar-token");
    fetch(source, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) throw new Error("Không tải được ảnh");
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);
  return url ? (
    <img src={url} alt={alt} className="h-28 w-full rounded-xl object-cover" />
  ) : (
    <div className="grid h-28 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">
      Đang tải ảnh...
    </div>
  );
}
export function Dispute() {
  const { bookingId } = useParams(),
    toast = useToast();
  const bookingFetch = useFetch("/bookings/" + bookingId),
    disputesFetch = useFetch(`/disputes?bookingId=${bookingId}`);
  const [reason, setReason] = useState("New scratch"),
    [desc, setDesc] = useState(""),
    [files, setFiles] = useState([]),
    [submitting, setSubmitting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!files.length) {
      toast("Vui lòng tải ít nhất một ảnh bằng chứng");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("bookingId", bookingId);
      for (const file of files) form.append("files", file);
      const uploaded = await api("/uploads/evidence", {
        method: "POST",
        body: form,
      });
      await api("/disputes", {
        method: "POST",
        body: JSON.stringify({
          bookingId: +bookingId,
          reason,
          description: desc.trim(),
          evidence: (uploaded.files || []).map((file) => file.id),
        }),
      });
      toast("Đã gửi yêu cầu hỗ trợ tranh chấp");
      setFiles([]);
      disputesFetch.reload();
      bookingFetch.reload();
    } catch (submitError) {
      toast(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }
  const steps = [
    "Chủ xe gửi khiếu nại trong 24h",
    "PaceCar xem xét bằng chứng",
    "Người thuê phản hồi",
    "Quyết định trong 24–72h",
    "Hoàn cọc hoặc khấu trừ một phần",
  ];
  const error = bookingFetch.error || disputesFetch.error;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          bookingFetch.reload();
          disputesFetch.reload();
        }}
      />
    );
  if (bookingFetch.loading || disputesFetch.loading) return <Load />;
  const booking = bookingFetch.data,
    existing =
      disputesFetch.data?.find((item) => item.status !== "Resolved") ||
      disputesFetch.data?.[0],
    eligible = ["Ongoing", "Check-out Review"].includes(booking?.status);
  return (
    <div className="container-app max-w-5xl py-12">
      <PageHead
        eyebrow={`Booking #${bookingId}`}
        title="Trung tâm hỗ trợ tranh chấp"
        desc="PaceCar đánh giá dựa trên hợp đồng và bằng chứng giao nhận của hai bên."
      />
      <div className="grid gap-7 lg:grid-cols-5">
        <form onSubmit={submit} className="card space-y-5 p-6 lg:col-span-3">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Thông tin sự việc</h2>
            <StatusBadge status={existing?.status || "Chưa mở"} />
          </div>
          {existing ? (
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-blue-900">
              <b>Tranh chấp #{existing.id}</b>
              <p className="mt-2">{existing.reason}</p>
              <p className="mt-1 text-blue-700">{existing.description}</p>
              {existing.decision && (
                <p className="mt-3 border-t border-blue-200 pt-3">
                  <b>Quyết định:</b> {existing.decision}
                </p>
              )}
            </div>
          ) : !eligible ? (
            <div className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
              Chỉ có thể mở tranh chấp khi chuyến xe đang diễn ra hoặc ở bước
              kiểm tra trả xe. Trạng thái hiện tại: <b>{booking?.status}</b>.
            </div>
          ) : (
            <>
              <Field label="Lý do tranh chấp">
                <select
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="New scratch">Vết xước mới</option>
                  <option value="Late return">Trả xe muộn</option>
                  <option value="Over mileage">Vượt số km</option>
                  <option value="Fuel difference">Chênh lệch nhiên liệu</option>
                  <option value="Accident">Tai nạn</option>
                  <option value="Other">Khác</option>
                </select>
              </Field>
              <Field label="Mô tả chi tiết">
                <textarea
                  className="input"
                  rows="5"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </Field>
              <label className="block rounded-xl border border-dashed border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <b>Ảnh bằng chứng</b>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="mt-3 block w-full text-xs"
                  onChange={(event) =>
                    setFiles(Array.from(event.target.files || []).slice(0, 6))
                  }
                />
                <span className="mt-2 block text-xs">
                  {files.length
                    ? `Đã chọn ${files.length} ảnh`
                    : "Bắt buộc ít nhất một ảnh · tối đa 6 ảnh"}
                </span>
              </label>
              <Button type="submit" disabled={submitting || !desc.trim()}>
                {submitting ? "Đang gửi..." : "Gửi yêu cầu xem xét"}
              </Button>
            </>
          )}
        </form>
        <aside className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold">Quy trình xử lý</h2>
          <div className="mt-6">
            {steps.map((x, i) => (
              <div className="relative flex gap-4 pb-7 last:pb-0" key={x}>
                {i < 4 && (
                  <span className="absolute left-4 top-8 h-full w-px bg-slate-200" />
                )}
                <span
                  className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${existing && i === 0 ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-700"}`}
                >
                  {existing && i === 0 ? <Check size={16} /> : i + 1}
                </span>
                <div>
                  <b className="text-sm">{x}</b>
                  <p className="mt-1 text-xs text-slate-500">
                    {i === 3
                      ? "Cam kết SLA minh bạch"
                      : "Dựa trên bằng chứng đã xác thực"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="container-app py-32 text-center">
      <p className="text-7xl font-extrabold text-brand-100">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1>
      <Button as={Link} to="/" className="mt-6">
        Về trang chủ
      </Button>
    </div>
  );
}

function LegacyBookingV2() {
  const { carId } = useParams();
  const { data: car, error } = useFetch("/cars/" + carId);
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState({ id: false, license: false });
  const [form, setForm] = useState({
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    pickupLocation: "Hà Nội",
    returnLocation: "Hà Nội",
    driverOption: "self",
    notes: "",
  });
  if (error)
    return <ErrorState message={error} onRetry={() => location.reload()} />;
  if (!car) return <Load />;
  const days = Math.max(
    1,
    Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000),
  );
  const rental = days * car.pricePerDay,
    fee = Math.round(rental * 0.1),
    total = rental + fee;
  const steps = ["Lịch trình", "Xác thực", "Xác nhận"];
  const validStep1 =
    form.startDate &&
    form.endDate &&
    new Date(form.endDate) > new Date(form.startDate) &&
    form.pickupLocation &&
    form.returnLocation;
  async function submit() {
    if (!user) {
      toast("Vui lòng đăng nhập trước");
      return nav("/login");
    }
    setSubmitting(true);
    try {
      const booking = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          renterId: user.id,
          ownerId: car.ownerId,
          carId: car.id,
          totalPrice: total,
          deposit: car.deposit,
          platformFee: fee,
          riskLevel: user.riskLevel || "Low",
        }),
      });
      toast("Đã gửi yêu cầu và thông báo cho chủ xe");
      nav(`/contract/${booking.id}`);
    } catch (e) {
      toast(e.message);
      setSubmitting(false);
    }
  }
  return (
    <div className="container-app py-12">
      <PageHead
        eyebrow="Đặt xe an toàn"
        title={car.name}
        desc="Hoàn tất ba bước để gửi yêu cầu đến chủ xe."
      />
      <div className="mb-8 flex items-center justify-center">
        {steps.map((name, i) => (
          <React.Fragment key={name}>
            <div className="flex items-center gap-2">
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${step > i ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                {step > i + 1 ? <Check size={17} /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-semibold sm:block ${step > i ? "text-brand-700" : "text-slate-400"}`}
              >
                {name}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-3 h-0.5 w-10 sm:w-24 ${step > i + 1 ? "bg-brand-500" : "bg-slate-200"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          {step === 1 && (
            <div>
              <h2 className="mb-5 text-xl font-bold">Lịch trình chuyến đi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ngày nhận">
                  <input
                    type="date"
                    className="input"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Ngày trả">
                  <input
                    type="date"
                    className="input"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Địa điểm nhận xe">
                  <input
                    className="input"
                    value={form.pickupLocation}
                    onChange={(e) =>
                      setForm({ ...form, pickupLocation: e.target.value })
                    }
                  />
                </Field>
                <Field label="Địa điểm trả xe">
                  <input
                    className="input"
                    value={form.returnLocation}
                    onChange={(e) =>
                      setForm({ ...form, returnLocation: e.target.value })
                    }
                  />
                </Field>
              </div>
              {!validStep1 && (
                <p className="mt-4 text-sm text-red-600">
                  Ngày trả phải sau ngày nhận; địa điểm nhận và trả xe không
                  được để trống.
                </p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["self", "Tự lái"],
                  ["driver", "Có tài xế"],
                ].map(([v, t]) => (
                  <button
                    onClick={() => setForm({ ...form, driverOption: v })}
                    className={`rounded-xl border p-4 text-left font-bold ${form.driverOption === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200"}`}
                    key={v}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">Xác thực giấy tờ</h2>
              <p className="mt-2 text-sm text-slate-500">
                Bản demo chỉ mô phỏng việc chọn tệp, không lưu ảnh thật.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["id", "CCCD hai mặt"],
                  ["license", "Giấy phép lái xe"],
                ].map(([key, label]) => (
                  <button
                    onClick={() => setDocs({ ...docs, [key]: !docs[key] })}
                    className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${docs[key] ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-brand-300"}`}
                    key={key}
                  >
                    {docs[key] ? (
                      <CheckCircle2 className="mx-auto text-emerald-600" />
                    ) : (
                      <FileSignature className="mx-auto text-slate-400" />
                    )}
                    <b className="mt-3 block">{label}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {docs[key]
                        ? "Đã chọn tệp minh chứng"
                        : "Nhấn để chọn tệp demo"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                <ShieldCheck className="mr-2 inline" size={18} /> Giấy tờ chỉ
                được dùng để xác thực booking và bảo vệ các bên.
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">Kiểm tra và xác nhận</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info
                  title="Thời gian"
                  lines={[
                    `${date(form.startDate)} – ${date(form.endDate)}`,
                    `${days} ngày thuê`,
                  ]}
                />
                <Info
                  title="Giao nhận"
                  lines={[
                    form.pickupLocation,
                    form.returnLocation,
                    form.driverOption === "self" ? "Tự lái" : "Có tài xế",
                  ]}
                />
              </div>
              <div className="mt-5">
                <PriceBreakdown
                  rental={rental}
                  fee={fee}
                  deposit={car.deposit}
                />
              </div>
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <b>Trust Score: {user?.trustScore || 50}/100</b>
                <p className="mt-1 text-xs">
                  Rule-based Trust Score – MVP version, không phải AI.
                </p>
              </div>
            </div>
          )}
          <div className="mt-7 flex justify-between border-t pt-5">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              Quay lại
            </Button>
            {step < 3 ? (
              <Button
                disabled={step === 1 ? !validStep1 : !docs.id || !docs.license}
                onClick={() => setStep(step + 1)}
              >
                Tiếp tục <ArrowRight size={17} />
              </Button>
            ) : (
              <Button disabled={submitting} onClick={submit}>
                {submitting ? "Đang gửi..." : "Gửi yêu cầu thuê"}
              </Button>
            )}
          </div>
        </section>
        <aside>
          <div className="card sticky top-24 p-5">
            <img
              src={car.imageUrl}
              className="h-36 w-full rounded-xl object-cover"
            />
            <h3 className="mt-4 font-bold">{car.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {days} ngày · {car.location}
            </p>
            <p className="mt-4 text-2xl font-extrabold text-brand-600">
              {money(total)}
            </p>
            <p className="text-xs text-slate-400">
              Chưa bao gồm tiền cọc hoàn lại
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function RenterDashboard() {
  const { user } = useAuth();
  return (
    <DashboardShell role="renter">
      <div id="overview">
        <LegacyRenterDashboard />
      </div>
      <div id="finance" className="mt-6 max-w-4xl">
        <TrustBreakdown
          score={user?.trustScore ?? 0}
          verification={{
            identityVerified: user?.verified,
            phoneVerified: Boolean(user?.phone),
            licenseVerified: user?.licenseVerified,
          }}
        />
      </div>
    </DashboardShell>
  );
}
export function OwnerDashboard() {
  return (
    <DashboardShell role="owner">
      <LegacyOwnerDashboard />
    </DashboardShell>
  );
}
export function AdminDashboard() {
  return (
    <DashboardShell role="admin">
      <LegacyAdminDashboard />
    </DashboardShell>
  );
}

export function Booking() {
  const { carId } = useParams(),
    [params] = useSearchParams(),
    { user } = useAuth(),
    nav = useNavigate(),
    toast = useToast();
  const quoteId = params.get("quoteId"),
    {
      data: quote,
      error,
      reload,
    } = useFetch(quoteId ? `/quotes/${quoteId}` : "/quotes/missing"),
    {
      data: car,
      error: carError,
      reload: reloadCar,
    } = useFetch(`/cars/${carId}`);
  const [notes, setNotes] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [accepted, setAccepted] = useState(false);
  const [idempotencyKey] = useState(() => {
    const storageKey = `pacecar-booking-key:${quoteId}`,
      existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const created = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    sessionStorage.setItem(storageKey, created);
    return created;
  });
  if (error || carError)
    return (
      <ErrorState
        message={error || carError}
        onRetry={() => {
          reload();
          reloadCar();
        }}
      />
    );
  if (!quote || !car) return <Load />;
  async function submit() {
    if (!user) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
      );
      return;
    }
    if (user.role !== "renter") {
      toast("Vui lòng dùng tài khoản người thuê");
      return;
    }
    if (!accepted) {
      toast("Bạn cần đồng ý điều khoản");
      return;
    }
    setSubmitting(true);
    try {
      const booking = await api("/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          quoteId,
          notes,
          consent: { policyVersion: quote.policyVersion },
        }),
      });
      toast(
        booking.status === "Accepted"
          ? "Đặt xe nhanh đã được chấp nhận"
          : "Đã gửi yêu cầu đến chủ xe",
      );
      sessionStorage.removeItem(`pacecar-booking-key:${quoteId}`);
      nav(`/contract/${booking.id}`);
    } catch (e) {
      toast(e.message);
      setSubmitting(false);
    }
  }
  return (
    <div className="container-app max-w-6xl py-10">
      <PageHead
        eyebrow="Xác nhận hành trình"
        title="Hoàn tất yêu cầu thuê xe"
        desc="Giá và chính sách đã được khóa trong quote phía server."
      />
      <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex gap-4">
              <img
                src={car.imageUrl || car.photos?.[0]}
                alt={car.name}
                className="h-28 w-40 rounded-xl object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{car.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {dateTime(quote.startDate)} → {dateTime(quote.endDate)} ·{" "}
                  {quote.durationLabel || `${quote.days} ngày`}
                </p>
                {quote.destination && (
                  <p className="mt-1 text-sm text-slate-500">
                    Điểm đến dự kiến: {quote.destination}
                  </p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {quote.pickupOption === "delivery"
                    ? "Giao xe tận nơi"
                    : "Nhận tại vị trí xe"}{" "}
                  · {quote.pickupLocation} ·{" "}
                  {quote.driverOption === "self" ? "Tự lái" : "Có tài xế"}
                </p>
              </div>
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-bold">Hồ sơ và điều khoản</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Danh tính", user?.verified],
                ["Giấy phép lái xe", user?.licenseVerified],
                ["Trust Score", user?.trustScore >= 50],
              ].map(([label, ok]) => (
                <div
                  className={`rounded-xl p-4 text-sm font-bold ${ok === true ? "bg-emerald-50 text-emerald-700" : ok === false ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                  key={label}
                >
                  {ok === true ? "✓" : ok === false ? "!" : "?"} {label}
                </div>
              ))}
            </div>
            <label className="label mt-5">Lời nhắn cho chủ xe</label>
            <textarea
              className="input"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Giờ giao xe mong muốn, hành trình dự kiến..."
            />
            <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>
                Tôi đồng ý với hợp đồng số, chính sách hủy, quy định sử dụng xe
                và quy trình evidence của PaceCar.
              </span>
            </label>
          </section>
        </div>
        <aside>
          <div className="card sticky top-24 p-6">
            <h2 className="text-xl font-bold">Chi tiết thanh toán</h2>
            <div className="mt-5 space-y-3 text-sm">
              <PriceLine
                label={quote.durationLabel || `${quote.days} ngày thuê`}
                value={quote.baseRental}
              />
              {quote.weekendSurcharge > 0 && (
                <PriceLine
                  label="Phụ phí cuối tuần"
                  value={quote.weekendSurcharge}
                />
              )}{" "}
              {quote.longRentalDiscount > 0 && (
                <PriceLine
                  discount
                  label="Giảm thuê dài ngày"
                  value={quote.longRentalDiscount}
                />
              )}
              <PriceLine label="Bảo hiểm" value={quote.insuranceFee} />
              {quote.driverFee > 0 && (
                <PriceLine label="Phí tài xế" value={quote.driverFee} />
              )}
              <PriceLine label="Phí nền tảng" value={quote.platformFee} />
              {quote.outsideHoursFee > 0 && (
                <PriceLine
                  label="Phụ phí bàn giao ngoài giờ"
                  value={quote.outsideHoursFee}
                />
              )}
              {quote.deliveryFee > 0 && (
                <PriceLine label="Giao xe" value={quote.deliveryFee} />
              )}{" "}
              {quote.promoDiscount > 0 && (
                <PriceLine
                  discount
                  label="Khuyến mãi"
                  value={quote.promoDiscount}
                />
              )}
              <div className="flex justify-between border-t pt-4 text-lg">
                <b>Tổng phí thuê</b>
                <b className="text-brand-600">{money(quote.totalPrice)}</b>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tiền cọc hoàn lại · chưa thanh toán ở bước này</span>
                <b>{money(quote.deposit)}</b>
              </div>
            </div>
            <Button
              disabled={submitting || !accepted}
              onClick={submit}
              className="mt-6 w-full"
            >
              {submitting ? "Đang tạo booking..." : "Gửi yêu cầu thuê xe"}
            </Button>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Quote {quote.quoteId.slice(0, 8)} · {quote.policyVersion}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
