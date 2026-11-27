# EmailJS 알람 템플릿 설정 가이드

## 개요

관리자 페이지의 알람 시스템에서 서버 리소스(CPU, RAM, Disk) 임계치 초과 시 이메일을 발송하기 위한 EmailJS 템플릿 설정 방법입니다.

## 1. EmailJS 대시보드 접속

1. https://dashboard.emailjs.com/ 접속
2. 로그인
3. 좌측 메뉴에서 **Email Templates** 클릭

## 2. 새 템플릿 생성

1. **Create New Template** 버튼 클릭
2. Template Name: `System Alert` 입력
3. Template ID를 `template_alert`로 설정 (중요!)

## 3. 템플릿 내용 작성

### Subject (제목)
```
⚠️ {{site_name}} - {{resource_type}} 사용량 경고
```

### Content (본문)
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Malgun Gothic', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .alert-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert-box.critical {
            background-color: #f8d7da;
            border-left-color: #dc3545;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-label {
            font-weight: bold;
            color: #333;
        }
        .metric-value {
            color: #666;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 시스템 알람</h1>
            <p>{{site_name}}</p>
        </div>

        <div class="content">
            <h2>리소스 사용량 경고</h2>

            <div class="alert-box {{#if critical}}critical{{/if}}">
                <strong>⚠️ {{resource_type}} 사용량이 임계치를 초과했습니다!</strong>
            </div>

            <div class="metric">
                <span class="metric-label">리소스 타입:</span>
                <span class="metric-value">{{resource_type}}</span>
            </div>

            <div class="metric">
                <span class="metric-label">현재 사용량:</span>
                <span class="metric-value">{{current_value}}%</span>
            </div>

            <div class="metric">
                <span class="metric-label">설정된 임계치:</span>
                <span class="metric-value">{{threshold}}%</span>
            </div>

            <div class="metric">
                <span class="metric-label">발생 시각:</span>
                <span class="metric-value">{{timestamp}}</span>
            </div>

            <p style="margin-top: 20px; color: #666;">
                시스템 리소스 사용량을 확인하고 필요한 조치를 취해주세요.
            </p>

            <center>
                <a href="https://pulspia.com/admin" class="button">
                    관리자 페이지 바로가기
                </a>
            </center>
        </div>

        <div class="footer">
            <p>이 이메일은 {{site_name}} 자동 알람 시스템에서 발송되었습니다.</p>
            <p>수신: {{to_email}}</p>
        </div>
    </div>
</body>
</html>
```

## 4. 템플릿 변수 확인

템플릿에서 사용하는 변수들:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{to_email}}` | 수신자 이메일 | pulspia@gmail.com |
| `{{site_name}}` | 사이트 이름 | Pulspia |
| `{{resource_type}}` | 리소스 타입 | CPU / RAM / Disk / TEST |
| `{{current_value}}` | 현재 사용량(%) | 85.5 |
| `{{threshold}}` | 임계치(%) | 80 |
| `{{timestamp}}` | 발생 시각 | 2024. 11. 29. 오전 9:30:00 |

## 5. 테스트 설정

### Test 탭에서 테스트
1. 템플릿 수정 후 **Test It** 탭 클릭
2. 다음 값을 입력:

```json
{
  "to_email": "your-email@example.com",
  "site_name": "Pulspia",
  "resource_type": "CPU",
  "current_value": "95",
  "threshold": "80",
  "timestamp": "2024. 11. 29. 오전 9:30:00"
}
```

3. **Send Test Email** 버튼 클릭
4. 이메일 수신 확인

## 6. 템플릿 저장 및 활성화

1. **Save** 버튼 클릭
2. Template ID가 `template_alert`인지 재확인
3. Status가 **Active**인지 확인

## 7. 관리자 페이지에서 테스트

1. 관리자 페이지 접속: `http://localhost:3000/admin`
2. 좌측 메뉴에서 **알람 시스템** 클릭
3. 알람 설정 확인:
   - 이메일 알람 활성화 체크
   - 수신 이메일 입력 (예: pulspia@gmail.com)
   - CPU/RAM/Disk 임계치 설정
4. **테스트 알람 발송** 버튼 클릭
5. 이메일 수신 확인

## 8. 자동 알람 작동 방식

관리자 페이지의 알람 시스템은 다음과 같이 작동합니다:

1. **모니터링 주기**: 5분마다 자동으로 서버 메트릭 확인
2. **임계치 확인**:
   - CPU 사용량 >= 설정된 CPU 임계치
   - RAM 사용량 >= 설정된 RAM 임계치
   - Disk 사용량 >= 설정된 Disk 임계치
3. **알람 발송**: 임계치 초과 시 이메일 발송
4. **중복 방지**: 동일한 알람은 1시간에 한 번만 발송
5. **이력 저장**: 모든 알람은 `alert_history` 테이블에 기록

## 9. 트러블슈팅

### 이메일이 발송되지 않는 경우

1. **EmailJS 설정 확인**
   - Service ID가 올바른지 확인
   - Template ID가 `template_alert`인지 확인
   - Public Key가 올바른지 확인

2. **콘솔 에러 확인**
   - 브라우저 개발자 도구 → Console 탭
   - 에러 메시지 확인

3. **EmailJS 대시보드 확인**
   - https://dashboard.emailjs.com/
   - Auto-Reply → Email Logs
   - 발송 이력 및 에러 확인

4. **알람 이력 확인**
   - 관리자 페이지 → 알람 시스템
   - 알람 이력 섹션에서 발송 여부 확인

### 이메일이 스팸함에 들어가는 경우

1. 발신자를 연락처에 추가
2. 스팸 해제 처리
3. EmailJS 대시보드에서 Custom SMTP 설정 고려

## 10. 커스터마이징

### 디자인 변경
- HTML/CSS를 수정하여 원하는 디자인으로 변경 가능
- 로고 이미지 추가 가능
- 색상 테마 변경 가능

### 추가 정보 포함
- 서버 IP 주소
- 최근 메트릭 그래프
- 권장 조치사항
- 관련 문서 링크

### 다국어 지원
- 한국어/영어 버전 별도 템플릿 생성
- Template ID: `template_alert_ko`, `template_alert_en`
- 코드에서 언어 설정에 따라 템플릿 선택

## 참고사항

- EmailJS 무료 플랜: 월 200건 제한
- 알람이 자주 발생하면 유료 플랜 고려
- 중요 알람은 SMS나 Slack 등 다른 채널 병행 권장
