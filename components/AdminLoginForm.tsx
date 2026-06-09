"use client";

import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError("密碼不正確，請再確認一次。");
      setLoading(false);
      return;
    }

    window.localStorage.setItem("wang-admin-password", password);
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft">
      <label className="block text-left text-sm font-bold tracking-wider text-forest/70" htmlFor="password">
        後台密碼
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-forest/10 bg-cream px-5 py-4 text-lg font-bold text-forest outline-none focus:border-rose"
        placeholder="請輸入密碼"
      />
      {error && <p className="mt-3 text-sm font-bold text-rose">{error}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-full bg-forest px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-leaf disabled:opacity-60">
        {loading ? "登入中..." : "登入後台"}
      </button>
      <p className="mt-5 text-center text-sm leading-6 text-forest/55">
        請輸入管理密碼。如需協助，請聯絡網站管理人員。
      </p>
    </form>
  );
}
