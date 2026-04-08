import "/js/common/File.js?version=2025010801";

// 카드 주문 상세 js
let _this;
const FH = {
    wptlCrdOrdrNo: "",
    cardOrderDetail: {},
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
         * 카드 주문 상세 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCardOrderDetail: async function (maskingType) {
            const params = {
                wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo) // 카드 주문 시퀀스
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetCardOrderDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.cardOrderDetail = entity;
                _this.methods.getPageContnet();
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
         * * 카드 주문 상세 - 내용 페이지 호출
         * @param pageType (상세: detail, 수정: mod)
         * @returns {Promise<void>}
         */
        getPageContnet: async function (pageType = "detail") {
            const params = {
                path: "card/order/detail_content",
                htmlData: {
                    pageType: pageType,
                    cardOrderDetail: _this.cardOrderDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
        },
        /**
         * 사원증 관련 파일 재등록
         * @param wptlCrdOrdrNo (카드 주문 시퀀스)
         * @returns {Promise<void>}
         */
        doUploadCardOrderFile: async function (wptlCrdOrdrNo) {
            let empcFile = $("#empcFile")[0].files[0];
            let empcPhoFile = $("#empcPhoFile")[0].files[0];
            const params = {
                wptlCrdOrdrNo: !Util.isEmpty(wptlCrdOrdrNo) ? Number(wptlCrdOrdrNo) : "",                    // 카드 주문 시퀀스
                empcFileNm: $("#empcFileNm").val(),                                                         // 사원증 엑셀 파일 이름
                empcFilePthNm: $("#empcFilePthNm").val(),                                                   // 사원증 엑셀 파일 경로
                empcPhoFileNm: $("#empcPhoFileNm").val(),                                                   // 사원증 사진 파일 이름
                empcPhoFilePthNm: $("#empcPhoFilePthNm").val(),                                             // 사원증 사진 파일 경로
            }

            if(empcFile !== undefined) {
                params.empcFile = empcFile; // 사원증 엑셀 파일
            }

            if(empcPhoFile !== undefined) {
                params.empcPhoFile = empcPhoFile; // 사원증 사진 파일
            }

            if (!_this.methods.employeeFileValid(params)) return;
            if (!confirm("사원증 파일을 등록 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/card/doUploadCardOrderFile', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("사원증 파일을 등록하였습니다.");
                _this.methods.doGetCardOrderDetail();
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
         * 사원증 관련 파일 재등록 유효성 체크
         * @param params
         * @returns {boolean}
         */
        employeeFileValid: function (params) {
            const $scrollWrap = $(".content");
            const $validEl = $("#employeeFileValid");
            $validEl.html("");
            if (_this.cardOrderDetail.wptlPrdCrdTypeCd === ConstCode.CODES_PRODUCT.CRD_TYPE.EMPLOYEE) {
                if (Util.isEmpty(params.empcFile) && Util.isEmpty(params.empcFileNm)) {
                    Util.validCheck($scrollWrap, $validEl, "엑셀 파일을 업로드해 주세요.");
                    return false;
                }
                if (Util.isEmpty(params.empcPhoFile) && Util.isEmpty(params.empcPhoFileNm)) {
                    Util.validCheck($scrollWrap, $validEl, "사진을 업로드해 주세요.");
                    return false;
                }
            }
            return true;
        },
        /**
         * 카드 수령 확인
         * @param wptlCrdOrdrNo (카드 주문 시퀀스)
         * @returns {Promise<void>}
         */
        doConfirmDelivery: async function (wptlCrdOrdrNo) {
            if (Util.isEmpty(wptlCrdOrdrNo)) return;
            const params = {
                wptlCrdOrdrNo: Number(wptlCrdOrdrNo) // 카드 주문 시퀀스
            }
            if (!confirm("카드 수령 완료 상태로 변경하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/card/doConfirmDelivery', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("카드 수령 완료 상태로 변경하였습니다.");
                _this.methods.doGetCardOrderDetail();
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
         * 주문 취소
         * (신청완료, 결제완료 상태일 경우만 취소)
         * @returns {Promise<void>}
         */
        doCancelOrderCard: async function () {
            if (Util.isEmpty(_this.wptlCrdOrdrNo)) return;
            const params = {
                wptlCrdOrdrNo: Number(_this.wptlCrdOrdrNo) // 카드 주문 시퀀스
            }
            if (!confirm("주문 취소하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doCancelOrderCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("주문이 취소되었습니다.");
                // 주문 상세 현황 정보 갱신
                await _this.methods.doGetCardOrderDetail();
            } else {
                switch (code) {
                    case -4007:
                        alert(message);
                        await _this.methods.doGetCardOrderDetail();
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
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