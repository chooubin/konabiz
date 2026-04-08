const ENVIRONMENT = 'DEV';

const FILE_SERVER_URL = $UPLOAD_FILE_URL || "";

const UPLOAD_FILE_NAME_MAX_LENGTH = 100;        // 업로드파일명 최대글자수
const DELIVERY_AMOUNT = 3000;
const MONTHLY_PAYMENT_LIMIT_MIN = 1000000;      // 100만원
const MONTHLY_PAYMENT_LIMIT_MAX = 100000000000; // 1000억원

const USE_LIMIT_MONTHLY_MIN = 10000;            // 1만원
const USE_LIMIT_DAILY_MIN = 10000;              // 1만원
const USE_LIMIT_ONCE_MIN = 10000;               // 1만원

const USE_LIMIT_MONTHLY_MAX = 3100000000;       // 31억원
const USE_LIMIT_DAILY_MAX = 100000000;          // 1억원
const USE_LIMIT_ONCE_MAX = 100000000;           // 1억원

const TRUE = "Y";
const FALSE = "N";

const CODES_MASKING = {
    PHONE: "PHONE",
    PHONE_NUMBER_ONLY: "PHONE_NUMBER_ONLY",
    NAME: "NAME",
    CARD_NUMBER: "CARD_NUMBER",
    CARD_NUMBER_SPACE: "CARD_NUMBER_SPACE",
    CARD_NUMBER_ONLY: "CARD_NUMBER_ONLY",
    CARD_NUMBER2: "CARD_NUMBER2",
    CARD_NUMBER3: "CARD_NUMBER3",
    ACCOUNT_NUMBER: "ACCOUNT_NUMBER",
    EMAIL: "EMAIL",
    ALL: "ALL"
}

/* 휴대폰 인증 타입 코드 */
const CODES_AUTH_TYPE = {
    FINDID: 1,  // 아이디 찾기
    FINDPWD: 2, // 비밀번호 찾기
    JOIN: 3,     // 회원가입
    LOGIN: 4
}

/* 약관 타입 코드 */
const CODES_TERMS_TYPE = {
    SERVICE: "10", // 서비스 약관
    PRIVACY: "20"  // 개인정보 처리방침 약관
}

/* 계정 관련 코드 */
const CODES_MEMBER_ACCOUNT = {
    TYPE: {
        AGENCY: '10', // 기업
        ADMIN: '20'   // 관리자
    },
    ROLE: {
        MEMBER: '11',     // 회원
        OPERATION: '12',  // 운영
        MANAGEMENT: '13', // 관리
        CARD: '21',       // 카드
        DESIGN: '22',     // 디자인
        SYSTEM: '23'      // 시스템
    },
    STATUS: {
        ACTIVE: 100,    // 활성화
        STOP: -99       // 정지
    }
}

/* 기업 관련 코드 */
const CODES_COMPANY = {
    // 사업자 코드
    BIZ_TYPE: {
        CORPORATE: "10", // 법인 사업자
        INDIVIDUAL: "20" // 개인 사업자
    },
    // 계약 코드
    CONTRACT : {
        TEMP_SAVE: "99",     // 임시저장
        APPLY_SAVE: "98",    // 신청
        RE_APPLY_SAVE: "97", // 재신청
        REJECT_SAVE: "96" ,  // 반려
        AUDIT_SAVE: "95",    // 심사중
        ACCEPT_SAVE: "00",   // 완료 (승인)
    },
    // 반려 사유
    REJECT_REASON : {
        BSRGC: "10",     // 사업자등록증 미첨부
        BNKB_CPY: "20",  // 통장 사본 미첨부
        REPP_IDFC: "30",  // 대표자 신분증 미첨부
        ADDITION: "40", // 부가서류 (최소 1개) 미첨부
        DIRECT: "50",  // 직접입력
    }
}

/* 고객센터 게시판 관련 코드 */
const CODES_BOARD_TYPE = {
    NOTICE: "10", // 공지사항
    FAQ: "20",    // FAQ
    INQUIRE: "30" // 1:1 문의
}

const CODES_PRODUCT = {
    PRD_ST_TYPE: {
        ACTIVE: "00",          // 사용중
        INACTIVE: "94",        // 사용 중지
        CONFIRM_DESIGN: "99",  // 디자인 확정
        COMPLETE_DESIGN: "98", // 디자인 완료
        UNDER_DESIGN: "97",     // 디자인중
        APPROVAL_REQUEST: "96",     // 승인요청
        APPROVED: "95",     // 승인완료
        REMOVE: "90"           // 삭제
    },
    PRD_TYPE: {
        WELFARE: "10",  // 복지 카드
        CORPORATE: "20", // 법인 카드
        CORPORATE_MASTER: "30",         // 법인마스터카드
        CORPORATE_DEBIT_MASTER: "40",    // 법인직불마스터카드
        CORPORATE_ACCOUNT_DEBIT: "50",    // 법인계좌직불카드
    },
    CRD_TYPE: {
        NORMAL: "10",   // 일반 카드
        EMPLOYEE: "20", // 사원증 카드
    },
    // 상품 디자인 유형
    DSG_TYPE: {
        BASIC: "10",  // 기본 디자인
        DIRECT: "20", // 직접 디자인
        INSTANT: "30", // 바로 발급 디자인 (instant issued card design)
        PREMIUM: "40",  // 프리미엄 디자인
    },
    // 카드 발급 유형
    CRD_KIND: {
        CARDSE : "C",  // 실물카드
        MOBILE : "M"  // 모바일카드
    },
    // 카드명 표시 유형
    CRD_NM_WRITE_TYPE: {
        CORPORATE_EMPLOYEE : "10",  // 법인명+임직원명
        CORPORATE : "20"       // 법인명
    },
    // 상품 디자인 템플릿 유형
    DSG_TEMPLATE_TYPE: {
        NORMAL: "10",    // 일반 카드
        EMPLOYEE: "20", // 사원증 카드
        CORPORATE_MASTER: "30", // 법인마스터 카드
        CORPORATE_DEBIT_MASTER: "40",   // 법인직불마스터 카드
        CORPORATE_ACCOUNT_DEBIT: "41",  // 법인계좌직불카드
        MOBILE_WELFARE: "50",    // 모바일 복지카드
        MOBILE_CORPORATE: "51", // 모바일 법인카드
        MOBILE_CORPORATE_MASTER: "52",  // 모바일 법인 마스터카드
        MOBILE_CORPORATE_DEBIT_MASTER: "53", // 모바일 법인 직불마스터카드
        INSTANT_ISSUED_WELFARE: "54" // Instant Issued Welfare Card
    },
    // 상품 사용 타입(잔액/캐시)
    USE_BALANCE_CASH_TYPE: {
        BOTH: "BOTH",        // 잔액+캐시
        BALANCE: "BALANCE",  // 잔액
        CASH: "CASH"         // 캐시
    }
}

const CODES_VIRTUAL_ACCOUNT = {
    TYPE: {
        RECHARGER: "RCG",
        CASH: "CASH"
    }
}

/* 카드 관련 코드 */
const CODES_CARD = {
    // 카드 주문 상태
    ORDER_STATUS: {
        WAIT: "94",             // 결제대기 (카드결제)
        APPLY_COMPLETE: "95",   // 신청 완료 (무통장 결제)
        PAYMENT_COMPLETE: "96", // 결제 완료
        DESIGN_COMPLETE: "97",  // 디자인 완료
        MAKING: "98",           // 제작중
        SHIPPING: "99",         // 배송중
        RECEIPT_COMPLETE: "00"  // 수령완료
    },
    // 결제 방법
    ORDER_PAYMENT_TYPE : {
        CARD: "10", // 카드
        BANK: "20", // 무통장 입금
        FREE: "30"  // 무상
    },
    // 카드 상태
    CARD_STATUS_CHANGE_TYPE: {
        RESUME: "RESUME",      // 사용
        SUSPEND: "SUSPEND",    // 중지
        TERMINATE: "TERMINATE", // 폐기
        ADMIN_SUSPEND: "ADMIN_SUSPEND",
    },
    //
    AUTO_CHARGE_STATUS_CHANGE_TYPE: {
        ACTIVE: "ACTIVE",    // 자동충전
        INACTIVE: "INACTIVE" // 자동충전 정지
    }
}

/* 카드 캐시 관련 코드 */
const CARD_CASH = {
    CRD_CASH_DV_CD: {
        USER_POINT: "00",    // 유저포인트
        POLICY_POINT: "01",  // 정책수당
        INCENTIVE: "02",  // 인센티브
        WELFARE_SAL: "03",  // 복지포인트_급여
        WELFARE_EX: "04",  // 복지포인트_경비
        AFFLI: "05",  // 제휴
        CORP: "06",  // 법인
        DONATION: "07",  // 기부금
    }
}

/* 지급/회수 관련 코드 */
const CODES_TRANS = {
    // 유효기간
    PERIOD_TYPE: {
        MONTH: "10", // 개월
        FIXED: "20"   // 특정일
    },
    // 지급/회수 타입
    TRANS_TYPE: {
        GIVE: "10", // 지급
        TAKE: "20"  // 회수
    },
    // 지급/회수 금액 타입
    TRANS_AMOUNT_TYPE: {
        ALL: "10", // 전체
        EACH: "20" // 금액입력
    },
    // 지급/회수 대상자 등록 타입
    TRANS_TARGET_TYPE: {
        EACH: "10", // 개별
        ALL: "20"   // 일괄 
    },
    // 지급/회수 상태 코드
    TRANS_STATUS_CD: {
        COMPLETE: "00", // 완료
        WAIT: "99",     // 대기
        IMMEDIATE: "98",    // 즉시지급
        RUNNING: "97",  // 실행중
        CANCEL: "90"    // 취소
    },
    // 지급/회수 분류 코드
    TRANS_DSB_RTRVL_TYPE: {
        CASH: "10", // 캐시
        BALA: "20", // 잔액
    },
    // 정기지급 대상자 유형
    FXTM_DSB_TARGET_TYPE: {
        EMP_STATUS: "10",   // 재직상태
        SPECIFIC: "20"      // 특정인
    }
}

/* 정산 관련 코드 */
const CODES_BILG = {
    // 타입
    TYPE_CD: {
        BILL: "10", // 정산
        USE: "20"   // 이용대금
    },
    // 작성 상태
    STATUS_CD: {
        CLAIM: "00", // 청구
        WRITE: "99", // 작성중
        REGIST: "98" // 등록 
    }
}

const ConstCode = function () {
    return {
        UPLOAD_FILE_NAME_MAX_LENGTH,
        ENVIRONMENT,
        FILE_SERVER_URL,
        DELIVERY_AMOUNT,
        TRUE,
        FALSE,
        CODES_MASKING,
        CODES_AUTH_TYPE,
        CODES_TERMS_TYPE,
        CODES_MEMBER_ACCOUNT,
        CODES_COMPANY,
        CODES_BOARD_TYPE,
        CODES_PRODUCT,
        CODES_CARD,
        CODES_VIRTUAL_ACCOUNT,
        CARD_CASH,
        CODES_TRANS,
        CODES_BILG,
        MONTHLY_PAYMENT_LIMIT_MIN,
        MONTHLY_PAYMENT_LIMIT_MAX,
        USE_LIMIT_MONTHLY_MIN,
        USE_LIMIT_DAILY_MIN,
        USE_LIMIT_ONCE_MIN,
        USE_LIMIT_MONTHLY_MAX,
        USE_LIMIT_DAILY_MAX,
        USE_LIMIT_ONCE_MAX,
    }
}

export default ConstCode();