"use client";

import { useEffect } from "react";

const userFacingCopy: Record<string, string> = {
  "可新增或修改文章、活動與短影音。儲存功能需要 Supabase 環境變數。":
    "可新增或修改文章、活動與短影音。",
  "如需修改後台密碼，請至 Vercel Environment Variables 修改 ADMIN_PASSWORD。":
    "如需修改後台密碼，請聯絡網站管理人員。",
  "目前尚未設定 Supabase，內容管理功能為停用狀態。請設定 Supabase 環境變數後啟用新增、編輯、刪除功能。":
    "此功能尚未開放，請聯絡網站管理人員協助處理。",
  "需要設定：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY。後台密碼請設定 ADMIN_PASSWORD。":
    ""
};

export function AdminImageUploader({ password: _password }: { password: string }) {
  useEffect(() => {
    const updateCopy = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const text = node.nodeValue?.trim() ?? "";
        if (text in userFacingCopy) {
          node.nodeValue = userFacingCopy[text];
        }
        node = walker.nextNode();
      }
    };

    updateCopy();
    const observer = new MutationObserver(updateCopy);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
