@echo off
chcp 65001 >nul
echo ===================================================================
echo   正在上傳 Hank Chang (張佑維) 的臺灣即時氣象專案至 GitHub...
echo   Repository: https://github.com/hankyyyyyy/HW10-Taiwan-Weather.git
echo ===================================================================
cd /d "%~dp0"

"C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" add .
"C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" commit -m "feat: complete Taiwan Weather Web App with CWA API, interactive map and SQLite"
"C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" branch -M main
"C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ✅ [成功] 專案已順利推送到 GitHub！
    echo 專案網址: https://github.com/hankyyyyyy/HW10-Taiwan-Weather
) else (
    echo ℹ️ 如果提示找不到 Repository，請先在 GitHub 上建立名稱為「HW10-Taiwan-Weather」的 Repository。
    echo ℹ️ 若跳出 GitHub 登入授權視窗，請點擊「Sign in with your browser」授權即可。
)
pause
