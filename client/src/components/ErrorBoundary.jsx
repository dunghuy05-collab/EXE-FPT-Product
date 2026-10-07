import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("PaceCar render error", error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="card max-w-lg p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-4 text-2xl font-bold">Ứng dụng gặp sự cố</h1>
          <p className="mt-2 text-sm text-slate-500">
            Đã xảy ra lỗi khi hiển thị trang này. Vui lòng thử tải lại.
          </p>
          <button
            className="mt-6 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white"
            onClick={() => {
              localStorage.removeItem("pacecar-user");
              location.href = "/";
            }}
          >
            Khởi động lại ứng dụng
          </button>
        </div>
      </div>
    );
  }
}
