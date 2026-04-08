# 코나비즈 관리 포털 — Mock DB 정적 구동

> **Task:** HND-20260408-010  
> **GitHub Pages:** https://chooubin.github.io/konabiz/

## 구현 화면

| 화면 | URL |
|------|-----|
| 대시보드 | `/` (index.html) |
| 임직원 | `/pages/employee.html` |
| 지급/회수 | `/pages/trans-list.html` |
| 카드 이용 내역 | `/pages/usage-welfare.html` |
| 예치금 내역 | `/pages/deposit.html` |

## 기술 스택

- 원본 CSS: `front.css`, `kbc.css` (코나비즈 포털 원본)
- 그리드: `tui-grid 4.21.3` (Toast UI Grid)
- 페이징: `tui-pagination 3.4.1`
- Mock DB: `data.json` (HND-20260408-008)
- API Mock: `js/mock-api.js` (ServiceExec 인터셉터)

## 실행

브라우저에서 `index.html`을 직접 열거나 GitHub Pages URL 접속.
인터넷 연결 없이 동작 (CDN 미사용).
