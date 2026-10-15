@echo off
chcp 65001 >nul
echo ===================================================================
echo   正在上傳 Hank Chang 的 DIC-2 機器學習線性迴歸作業至 GitHub...
echo   專案包含：50 Startups + Boston Housing + 自訂 Dataset 分析引擎
echo ===================================================================
cd /d "%~dp0"

git add .
git commit -m "feat: complete DIC-2 50 Startups & Boston Housing with custom dataset analyzer"
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ✅ [成功] 專案已順利推送到 GitHub！
    echo 請至倉庫 Settings -> Pages 確認部署狀態。
) else (
    echo ℹ️ 若第一次推送到獨立倉庫，請確認 remote origin 網址設定正確。
)
pause
