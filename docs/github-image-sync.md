# GitHub 圖片自動同步

後台圖片同步流程：

1. 管理者登入 `/admin`。
2. 在「上傳圖片到 GitHub」選擇圖片位置與檔案。
3. Vercel 後端驗證 `ADMIN_PASSWORD`。
4. 後端使用 GitHub Contents API 將圖片 commit 到 `main`。
5. GitHub 更新後，Vercel 自動部署。

## 一次性設定

在 GitHub 建立 Fine-grained personal access token：

- Repository access：只選擇 `Reorx7114/wyc-site`
- Repository permissions：`Contents` 設為 `Read and write`
- 不需要其他權限

在 Vercel Project Settings → Environment Variables 設定：

```text
GITHUB_CONTENT_TOKEN=GitHub fine-grained token
GITHUB_REPO_OWNER=Reorx7114
GITHUB_REPO_NAME=wyc-site
GITHUB_BRANCH=main
```

儲存後重新部署一次。之後圖片更新皆可從網站後台完成，不需人工搬檔或執行 git 指令。

## 安全設計

- Token 僅存在 Vercel Server Environment Variables。
- Token 不會傳送到瀏覽器。
- API 需要通過既有的 `ADMIN_PASSWORD`。
- 僅允許更新程式預先列出的 `public/images` 圖片，不能寫入其他程式檔案。
- 單張圖片限制為 4MB。

## 新增可更新圖片位置

若未來網站新增固定圖片位置，請在 `lib/github-images.ts` 的 `defaultImagePaths` 與
`githubImageTargets` 各新增一筆路徑。後台即可選擇並替換該圖片。
