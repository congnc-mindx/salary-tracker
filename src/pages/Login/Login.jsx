import { useEffect, useMemo, useRef, useState } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Wallet,
} from "lucide-react";

const OWNER_UID = (import.meta.env.VITE_FIREBASE_OWNER_UID || "").trim();

function getErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "Email hoặc mật khẩu chưa đúng.";

    case "auth/too-many-requests":
      return "Bạn đã thử quá nhiều lần. Hãy đợi một lúc rồi thử lại.";

    case "auth/network-request-failed":
      return "Không thể kết nối. Bạn kiểm tra lại mạng nhé.";

    case "auth/user-disabled":
      return "Tài khoản này đang bị vô hiệu hóa.";

    case "auth/operation-not-allowed":
      return "Bạn chưa bật Email/Password trong Firebase Authentication.";

    default:
      return "Chưa thể thực hiện. Vui lòng thử lại sau.";
  }
}

export default function Login({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const emailRef = useRef(null);
  const pendingRef = useRef(false);

  const { auth, configError } = useMemo(() => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    if (Object.values(config).some((value) => !value) || !OWNER_UID) {
      return {
        auth: null,
        configError:
          "Chưa có cấu hình Firebase hoặc UID. Hãy điền .env.local rồi khởi động lại Vite.",
      };
    }

    try {
      const app = getApps().length ? getApp() : initializeApp(config);
      const firebaseAuth = getAuth(app);

      firebaseAuth.languageCode = "vi";

      return { auth: firebaseAuth, configError: "" };
    } catch {
      return {
        auth: null,
        configError: "Cấu hình Firebase chưa hợp lệ. Kiểm tra lại .env.local.",
      };
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setChecking(false);
      return;
    }

    // Chờ Firebase kiểm tra phiên trước khi hiển thị nội dung ứng dụng.
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setChecking(false);
        setError("");
      },
      () => {
        setUser(null);
        setChecking(false);
        setError("Không kiểm tra được phiên đăng nhập. Hãy tải lại trang.");
      }
    );
  }, [auth]);

  async function handleLogin(event) {
    event.preventDefault();

    if (!auth || pendingRef.current) return;

    pendingRef.current = true;
    setBusy("login");
    setError("");
    setNotice("");

    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email.trim(), password);

      setPassword("");
      // onAuthStateChanged sẽ cập nhật user.
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      pendingRef.current = false;
      setBusy("");
    }
  }

  async function handleResetPassword() {
    if (!auth || pendingRef.current) return;
    if (!emailRef.current.reportValidity()) return;

    pendingRef.current = true;
    setBusy("reset");
    setError("");
    setNotice("");

    const message =
      "Nếu email này có tài khoản, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu. Hãy kiểm tra cả thư rác.";

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(message);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setNotice(message);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      pendingRef.current = false;
      setBusy("");
    }
  }

  // Truyền cho App; nếu thất bại, App có thể hiển thị lỗi.
  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setPassword("");
    setNotice("");
    setError("");
  }

  async function handleSwitchAccount() {
    setBusy("logout");
    setError("");

    try {
      await handleLogout();
    } catch {
      setError("Chưa đăng xuất được. Vui lòng thử lại.");
    } finally {
      setBusy("");
    }
  }

  if (checking) {
    return (
      <main
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600"
        role="status"
      >
        <LoaderCircle
          size={30}
          className="animate-spin text-blue-600 motion-reduce:animate-none"
        />
        <p className="text-sm font-medium">Đang kiểm tra đăng nhập…</p>
      </main>
    );
  }

  // Chỉ tài khoản chủ sở hữu được render dashboard.
  if (user?.uid === OWNER_UID) {
    return typeof children === "function"
      ? children({ user, onLogout: handleLogout })
      : children;
  }

  if (user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-5 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <LockKeyhole size={32} className="mb-5 text-blue-600" />

          <h1 className="text-2xl font-bold">
            Tài khoản chưa được cấp quyền
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Hãy đăng nhập bằng tài khoản chủ sở hữu của website.
          </p>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSwitchAccount}
            disabled={!!busy}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Đang đăng xuất…" : "Đăng xuất và đổi tài khoản"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#f5f8fc] p-4 text-slate-900 sm:p-8"
      style={{ colorScheme: "light" }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 md:min-h-[650px] md:grid-cols-2">
        {/* Phần giới thiệu */}
        <section className="relative flex flex-col overflow-hidden bg-blue-600 p-7 text-white sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <GraduationCap size={27} />
            </div>

            <div>
              <p className="text-xl font-extrabold">Thu nhập</p>
              <p className="text-sm text-blue-200">mindX</p>
            </div>
          </div>

          <div className="relative z-10 my-auto hidden py-14 md:block">
            <p className="mb-6 text-xs font-semibold tracking-widest text-blue-200">
              GỌN LỊCH DẠY · RÕ THU NHẬP
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
              Mỗi buổi dạy.
              <br />
              Một bước
              <br />
              <span className="text-blue-200">chủ động hơn.</span>
            </h1>

            <p className="mt-6 text-sm leading-7 text-blue-100">
              Theo dõi lịch dạy và quản lý thu nhập
              <br />
              trong không gian của riêng bạn.
            </p>

            <div className="mt-9 space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <CalendarDays size={20} className="text-blue-200" />
                Lịch dạy luôn rõ ràng
              </div>

              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-blue-200" />
                Thu nhập được tổng hợp theo tháng
              </div>
            </div>
          </div>

          <p className="hidden text-xs text-blue-200 md:block">
            Không gian quản lý cá nhân
          </p>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-40 h-96 w-96 rounded-full border-[45px] border-white/5"
          />
        </section>

        {/* Form đăng nhập */}
        <section className="flex items-center p-7 sm:p-10">
          <div className="w-full">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LockKeyhole size={27} />
            </div>

            <p className="text-xs font-semibold tracking-widest text-slate-400">
              CHÀO MỪNG TRỞ LẠI
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              Đăng nhập
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tiếp tục theo dõi lịch dạy và thu nhập của bạn.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
              aria-busy={!!busy}
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                  <Mail size={19} className="shrink-0 text-slate-400" />

                  <input
                    ref={emailRef}
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="Email của bạn"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={!!busy}
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Mật khẩu
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                  <LockKeyhole
                    size={19}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={!!busy}
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                    className="rounded-md p-1 text-slate-400 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    disabled={!!busy}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Ghi nhớ đăng nhập
                </label>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={!!busy || !auth}
                  className="font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {busy === "reset" ? "Đang gửi…" : "Quên mật khẩu?"}
                </button>
              </div>

              {(configError || error) && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700"
                >
                  {configError || error}
                </p>
              )}

              {notice && (
                <p
                  role="status"
                  className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-700"
                >
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={!!busy || !auth}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "login" ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Đang đăng nhập…
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={13} />
              Chỉ dành cho tài khoản được cấp quyền.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}