@echo off
chcp 65001 >nul
echo ===================================================================
echo   正在上傳 Hank Chang (張佑維) 的個人網頁專案至 GitHub...
echo   Repository: https://github.com/hankyyyyyy/Hank_Chang_PersonalPage.git
echo ===================================================================
cd /d "%~dp0"

"C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ✅ [成功] 專案已順利推送到 GitHub！
    echo 專案網址: https://github.com/hankyyyyyy/Hank_Chang_PersonalPage
) else (
    echo ℹ️ 如果跳出 GitHub 登入授權視窗，請點擊「Sign in with your browser」授權即可。
)
pause
