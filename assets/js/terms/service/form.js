// 서비스 이용 약관 등록/수정 js
let _this;
const FH = {
    scrollWrap: $(".member-content"),
    validEl: $("#termsValid"),
    wptlPrvNo: "",
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
        }
    },
    methods: {
        /**
         * 서비스 이용 약관 등록
         * @returns {Promise<boolean>}
         */
        doRegistTerms: async function () {
            const params = {
                prvTypeCd: ConstCode.CODES_TERMS_TYPE.SERVICE, // 약관 타입 (서비스 이용 약관)
                prvCn: $("#prvCn").val().trim()                // 약관 내용 
            }
            if (!_this.methods.termsValid(params)) return false;
            if (!confirm("서비스 이용 약관을 등록하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/terms/doRegistTerms', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("서비스 이용 약관을 등록하였습니다.");
                Util.replace("/terms/service/list", {prvTypeCd : ConstCode.CODES_TERMS_TYPE.SERVICE});
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 서비스 이용 약관 수정
         * @returns {Promise<boolean>}
         */
        doUpdateTerms: async function (wptlPrvNo) {
            const params = {
                wptlPrvNo: Number(wptlPrvNo),   // 약관 시퀀스
                prvCn: $("#prvCn").val().trim() // 약관 내용
            }
            if (!_this.methods.termsValid(params)) return false;
            if (!confirm("서비스 이용 약관을 등록하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/terms/doUpdateTerms', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("서비스 이용 약관을 등록하였습니다.");
                Util.replace("/terms/service/list", {prvTypeCd : ConstCode.CODES_TERMS_TYPE.SERVICE});
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 서비스 이용 약관 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        termsValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.prvCn)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "약관을 입력해 주세요.");
                return false;
            }
            return true;
        }
    },
    init: function () {
        _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
    }
}

window.FH = FH;
FH.init();