@echo off
REM ##########################################################################
REM Supabase Keep-Alive Windows Task Scheduler 자동 설정 스크립트
REM
REM 이 스크립트는 Windows 서버에서 작업 스케줄러를 자동으로 설정합니다.
REM
REM 사용 방법:
REM   1. 관리자 권한으로 명령 프롬프트 실행
REM   2. server\setup-windows.bat 실행
REM ##########################################################################

echo ======================================================================
echo 🚀 Supabase Keep-Alive Windows Task Scheduler 설정 시작
echo ======================================================================
echo.

REM 현재 디렉토리 저장
set CURRENT_DIR=%CD%
set SCRIPT_PATH=%CURRENT_DIR%\server\supabase-keepalive.js
set LOG_PATH=%CURRENT_DIR%\logs\keepalive.log

REM Node.js 설치 확인
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    Node.js를 먼저 설치해주세요: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 확인
node --version
echo.

REM 스크립트 파일 존재 확인
if not exist "%SCRIPT_PATH%" (
    echo ❌ 스크립트 파일을 찾을 수 없습니다: %SCRIPT_PATH%
    pause
    exit /b 1
)

echo ✅ 스크립트 파일 확인: %SCRIPT_PATH%
echo.

REM .env 파일 확인
if not exist "%CURRENT_DIR%\.env" (
    echo ⚠️  .env 파일이 없습니다.
    echo    SUPABASE_URL과 SUPABASE_ANON_KEY를 환경 변수로 설정해야 합니다.
    echo.
) else (
    echo ✅ .env 파일 확인
    echo.
)

REM 의존성 설치
echo 📦 의존성 설치 중...
call npm install --save @supabase/supabase-js dotenv
echo.

REM 로그 디렉토리 생성
if not exist "%CURRENT_DIR%\logs" mkdir "%CURRENT_DIR%\logs"
echo ✅ 로그 디렉토리 생성: %CURRENT_DIR%\logs
echo.

REM 작업 스케줄러 설정
echo ⏰ Windows 작업 스케줄러 설정 중...
echo.

REM 기존 작업 삭제 (있는 경우)
schtasks /query /tn "SupabaseKeepAlive" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  기존 작업이 이미 존재합니다.
    set /p OVERWRITE="기존 설정을 덮어쓰시겠습니까? (Y/N): "
    if /i not "%OVERWRITE%"=="Y" (
        echo ❌ 설정이 취소되었습니다.
        pause
        exit /b 1
    )
    schtasks /delete /tn "SupabaseKeepAlive" /f
    echo ✅ 기존 작업 삭제 완료
    echo.
)

REM 새 작업 생성 (6일마다 오전 9시)
REM Windows Task Scheduler는 "X일마다" 옵션이 없으므로,
REM 6일 간격으로 실행되는 여러 개의 작업을 생성합니다.

echo 작업 생성 중...
echo 참고: Windows는 "N일마다" 옵션이 없어서 여러 작업을 생성합니다.
echo.

REM 작업 1: 매월 1일, 7일, 13일, 19일, 25일 오전 9시
schtasks /create /tn "SupabaseKeepAlive" /tr "node \"%SCRIPT_PATH%\" >> \"%LOG_PATH%\" 2>&1" /sc monthly /d 1,7,13,19,25 /st 09:00 /f

if %ERRORLEVEL% EQU 0 (
    echo ✅ 작업 스케줄러 등록 완료
    echo.
) else (
    echo ❌ 작업 등록 실패
    echo    관리자 권한으로 실행했는지 확인하세요.
    pause
    exit /b 1
)

REM 설정 확인
echo ======================================================================
echo 📋 등록된 작업 정보
echo ======================================================================
echo.
schtasks /query /tn "SupabaseKeepAlive" /fo LIST /v
echo.

REM 테스트 실행
echo ======================================================================
echo 🧪 테스트 실행
echo ======================================================================
echo.
set /p TEST="지금 바로 테스트 실행을 하시겠습니까? (Y/N): "

if /i "%TEST%"=="Y" (
    echo 🏃 테스트 실행 중...
    echo.
    node "%SCRIPT_PATH%"
    echo.
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 테스트 성공!
    ) else (
        echo ❌ 테스트 실패. .env 파일과 환경 변수를 확인하세요.
    )
)

echo.
echo ======================================================================
echo ✅ Windows 작업 스케줄러 설정 완료!
echo ======================================================================
echo.
echo 💡 유용한 명령어:
echo   - 작업 확인:     schtasks /query /tn "SupabaseKeepAlive"
echo   - 작업 실행:     schtasks /run /tn "SupabaseKeepAlive"
echo   - 작업 삭제:     schtasks /delete /tn "SupabaseKeepAlive" /f
echo   - 로그 확인:     type %LOG_PATH%
echo   - 수동 실행:     node %SCRIPT_PATH%
echo.
echo 🎉 이제 자동으로 주기적으로 Supabase에 ping이 전송됩니다!
echo.
pause
