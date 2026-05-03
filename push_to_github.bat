@echo off
echo ========================================================
echo        Cleaning Git History and Uploading...
echo ========================================================
echo.

rmdir /s /q .git 2>nul

git init
git config --global user.email "samiirsaad@example.com"
git config --global user.name "samiirsaad"

git checkout -b main 2>nul
git add .
git commit -m "Initial commit for Smart Study Assistant"

git remote add origin https://github.com/samiirsaad/SmartStudyAssistant-.git
git push -u origin main -f

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo SUCCESS! Project has been uploaded to your GitHub.
    echo ========================================================
) else (
    echo ========================================================
    echo ERROR! Something went wrong during upload.
    echo ========================================================
)
pause
