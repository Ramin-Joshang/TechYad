"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { authApi } from "../api/auth.api";
import { ShieldAlert, RefreshCw, LogOut, Clock } from "lucide-react";
import toast from "react-hot-toast";

export function InactivityTracker() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<any>(null);
  const warningTimerRef = useRef<any>(null);

  const role = user?.role;
  const isSuperAdmin = role === "super-admin";
  const isAdmin = role === "admin";

  // 15 min for super-admin (warn at 14m), 30 min for admin (warn at 28m)
  const timeoutMs = isSuperAdmin
    ? 15 * 60 * 1000
    : isAdmin
      ? 30 * 60 * 1000
      : 0;
  const warningMs = isSuperAdmin
    ? 14 * 60 * 1000
    : isAdmin
      ? 28 * 60 * 1000
      : 0;

  const handleLogoutDueToInactivity = useCallback(async () => {
    setShowWarning(false);
    try {
      await authApi.logout();
    } catch (e) {}
    logout();
    toast.error(
      isSuperAdmin
        ? "نشست کاری سوپرادمین به دلیل عدم فعالیت به مدت ۱۵ دقیقه جهت حفظ امنیت بسته شد."
        : "نشست کاری ادمین به دلیل عدم فعالیت به مدت ۳۰ دقیقه بسته شد.",
      { duration: 6000 },
    );
    router.push("/login?reason=inactivity");
  }, [logout, router, isSuperAdmin]);

  const keepAlive = useCallback(async () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    try {
      await authApi.getMe();
      toast.success("نشست شما با موفقیت تمدید شد.");
    } catch (err) {
      // If server rejected due to expired session, log out
      handleLogoutDueToInactivity();
    }
  }, [handleLogoutDueToInactivity]);

  const recordActivity = useCallback(() => {
    if (!showWarning) {
      lastActivityRef.current = Date.now();
    }
  }, [showWarning]);

  useEffect(() => {
    if (!isAuthenticated || !user || (!isSuperAdmin && !isAdmin)) {
      return;
    }

    lastActivityRef.current = Date.now();

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    const handleEvent = () => recordActivity();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleEvent, { passive: true });
    });

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const inactive = now - lastActivityRef.current;

      if (inactive >= timeoutMs) {
        handleLogoutDueToInactivity();
      } else if (inactive >= warningMs && !showWarning) {
        setShowWarning(true);
        const remaining = Math.max(
          0,
          Math.round((timeoutMs - inactive) / 1000),
        );
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [
    isAuthenticated,
    user,
    isSuperAdmin,
    isAdmin,
    timeoutMs,
    warningMs,
    showWarning,
    recordActivity,
    handleLogoutDueToInactivity,
  ]);

  // Warning countdown timer
  useEffect(() => {
    if (!showWarning) return;

    warningTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(warningTimerRef.current);
          handleLogoutDueToInactivity();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    };
  }, [showWarning, handleLogoutDueToInactivity]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        dir="rtl"
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-center text-[var(--neo-text-main)] mb-2">
          هشدار عدم فعالیت در سامانه
        </h3>

        <p className="text-sm text-[var(--neo-text-secondary)] text-center leading-relaxed mb-6">
          به دلیل حفظ امنیت داده‌های سامانه تک یاد، چنانچه تا{" "}
          <span className="font-black text-amber-600 text-base mx-1 font-mono inline-block">
            {secondsRemaining}
          </span>{" "}
          ثانیه دیگر فعالیتی انجام ندهید، حساب کاربری{" "}
          <span className="font-bold text-[var(--neo-text-main)]">
            {isSuperAdmin ? "سوپرادمین" : "ادمین"}
          </span>{" "}
          به‌صورت خودکار بسته خواهد شد.
        </p>

        <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-amber-50 rounded-xl text-amber-800 text-xs font-medium border border-amber-100">
          <Clock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            سیاست امنیتی: خروج پس از {isSuperAdmin ? "۱۵" : "۳۰"} دقیقه عدم
            فعالیت
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={keepAlive}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--neo-primary)] text-white font-bold text-sm shadow-md hover:bg-[var(--neo-primary-hover)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تمدید نشست و ادامه کار</span>
          </button>

          <button
            onClick={handleLogoutDueToInactivity}
            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج امن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
