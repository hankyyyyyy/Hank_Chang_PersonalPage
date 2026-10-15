@echo off
chcp 65001 >nul
echo ===================================================================
echo   正在上傳 Hank Chang 的 DIC-2 機器學習線性迴歸作業至 GitHub...
echo   專案包含：50 Startups + Boston Housing + 自訂 Dataset 分析引擎
echo ===================================================================
cd /d "%~dp0"

set GIT_CMD=git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe" (
        set GIT_CMD="C:\Users\user\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe"
    )
)

set REPO_URL=https://github.com/hankyyyyyy/DIC-2-kaggle-50-startup-and-boston-housing-.git

if not exist ".git" (
    %GIT_CMD% init -b main
    %GIT_CMD% remote add origin %REPO_URL%
)

%GIT_CMD% add .
%GIT_CMD% commit -m "feat: complete DIC-2 50 Startups & Boston Housing with custom dataset analyzer"
%GIT_CMD% push -u %REPO_URL% main

echo.
if %ERRORLEVEL% equ 0 (
    echo ✅ [成功] 專案已順利推送到 GitHub (DIC-2-kaggle-50-startup-and-boston-housing-)！
    echo 專案公開網址: https://github.com/hankyyyyyy/DIC-2-kaggle-50-startup-and-boston-housing-
    echo GitHub Pages: https://hankyyyyyy.github.io/DIC-2-kaggle-50-startup-and-boston-housing-/
) else (
    echo ℹ️ 若第一次推送到獨立倉庫，請確認 remote origin 網址設定正確。
)
pause
