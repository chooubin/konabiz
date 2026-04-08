import "/js/common/Auth.js?version=2025010801";

// 지급/회수 상세 js
let _this;
const FH = {
    wlpoFxtmDsbSno: "",
    wptlPrdNo: "",
    transDetail: null,
    bankNm: "",
    strtDttm: null,
    endDttm: null,
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
            window.onresize = function() {
                if( $(".table-body").length ) {
                    Util.setReportHeight( $(".table-body")[0] );
                }
            }
        }
    },
    methods: {
        /**
         * 정기지급 상세 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetTransDetail: async function (maskingType) {
            const params = {
                wlpoFxtmDsbSno: _this.wlpoFxtmDsbSno,        // 정기지급 시퀀스
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
            }
            console.log(params);
            const res = await ServiceExec.post('/api/regular/trans/doGetTransDetail', params);
            const code = res.code;
            const message = res.message;
            let entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(!Util.isEmpty(entity.rcId)) {
                    await _this.methods.doGetDepositBankAccountOne(entity.rcId, maskingType);
                }

                if(entity.fxtmDsbTrgpTypeCd === '10' && !Util.isEmpty(entity.fxtmPymanStTypeCd)) {
                    let isServedCdArr = entity.fxtmPymanStTypeCd.split(',');

                    let servedCdArr = [];
                    for(let i = 0; i < isServedCdArr.length; i ++) {
                        if(isServedCdArr[i] === '00') {
                            servedCdArr.push('재직');
                        } else if(isServedCdArr[i] === '98') {
                            servedCdArr.push('휴직');
                        } else if(isServedCdArr[i] === '97') {
                            servedCdArr.push('수습');
                        }
                    }
                    let servedMsg = servedCdArr.join(',').trim();

                    entity.fxtmDsbTrgpTypeNm = entity.fxtmDsbTrgpTypeNm + '(' + servedMsg + ')';
                }

                if(!Util.isEmpty(_this.bankNm)) {
                    entity.bankNm = _this.bankNm;
                } else {
                    entity.bankNm = '-';
                }

                _this.transDetail = entity;
                _this.methods.getPageContent();
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
         * 정기지급 상세 - 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "regularTrans/detail_content",
                htmlData: {
                    transDetail: _this.transDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            if( $(".table-body").length ) {
                Util.setReportHeight( $(".table-body")[0] );
            }
        },
        /**
         * 정기지급 대상자 리스트 엑셀 다운로드
         */
        doDownTransTargetList: function () {
            if (Util.isEmpty(_this.wlpoFxtmDsbSno)) return;
            const params = {
                wlpoFxtmDsbSno: _this.wlpoFxtmDsbSno // 지급/회수 시퀀스
            }
            DOWNLOAD_MODAL.methods.download('/api/regular/trans/doDownTransTargetList', params);
        },
        /**
         * 예치금 운영 계좌 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetDepositBankAccountOne: async function (rcId, maskingType) {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wptlPrdNo: _this.wptlPrdNo  // 상품 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetDepositBankAccountList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let data = null;
            if (code === 1) {
                for (let i = 0; i < entity.length; i++) {
                    if(entity[i].rcgId === rcId && maskingType !== 'unmask'){
                        data = entity[i].bankNm + " " + entity[i].vtlAcno;
                        break;
                    } else {
                        data = entity[i].bankNm + " " + entity[i].unmaskVtlAcno;
                        break;
                    }
                }
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

            _this.bankNm = data;
            // $("#bankNm").html(data);
        },
        /**
         * 휴대폰 인증번호 발송
         * @returns {Promise<void>}
         */
        doTransSendAuthCode: async function (modal) {
            if(!modal) {
                if (!confirm("등록된 정기지급을 삭제하시겠습니까?")) return;
            }
            if($("#msg").length) {
                $("#msg").html("");
            }
            const res = await ServiceExec.post('/api/trans/doTransSendAuthCode');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                let message = "휴대폰으로 인증번호를 발송했습니다.";
                if(!modal) {
                    alert(message);
                } else {
                    $("#msg").html(message);
                }
                // 테스트시 사용
                // alert("휴대폰으로 인증번호를 발송했습니다. (인증번호 : " + entity.authCode + ")");

                AUTH.authToken = entity.authToken;
                AUTH.isSendAuth = true;
                AUTH.expired = false;
                AUTH.countTime = 180;

                $("#authTimer").text("03:00");
                $("#authCode").val("");
                $("#authCode").focus();

                AUTH.methods.countDown();
                if(!modal) {
                    await _this.methods.openTransAuthModal();
                    Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 입력해 주세요.", "p");
                }
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
         * 정기지급 인증 modal 열기
         * @returns {Promise<boolean>}
         */
        openTransAuthModal: async function () {
            _this.transUnmaskYn = "N";
            if(!AUTH.isSendAuth) {
                alert("휴대폰 인증을 진행해주세요.");
                return false;
            }
            const params = {
                path: "modal/transAuth",
                htmlData: {
                    pageType: 'regularTrans'
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#transAutheModal").length) $("#transAutheModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#transAutheModal").modal({show: true});
            addEventListenerByElements( $("#transAutheModal .masking-input").get() );
            $("#transAutheModal .masking-input").each( function(idx, item) {
                item.dispatchEvent( new Event('input') );
            });
            $("#transAutheModal #authCode").focus();
        },
        /**
         * 정기지급 삭제
         * (사용중경우만 취소가능)
         * @returns {Promise<void>}
         */
        doDeleteTrans: async function () {
            const params = {
                authToken: AUTH.authToken,                                                                 // 인증 토큰
                authCode: $("#authCode").val().trim(),                                                     // 인증 코드
                wlpoFxtmDsbSno: _this.wlpoFxtmDsbSno,
                dsbStTypeCd: _this.dsbStTypeCd
            }

            if(!AUTH.isSendAuth) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 재전송을 진행해주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && Util.isEmpty(params.authCode)) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && String(params.authCode).length < 4) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 정확히 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && AUTH.expired) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 입력 시간을 초과하였습니다.", "p");
                return;
            }

            const curDate = new Date();
            let isUsed = (new Date(_this.strtDttm) <= curDate || new Date(_this.strtDttm) > curDate) && new Date(_this.endDttm) >= curDate;

            if (!isUsed) {
                Util.validCheck($(".modal-content"), $("#msg"), "지급 상태가 사용중이 아니면 삭제할 수 없습니다.", "p");
                return;
            }

            const res = await ServiceExec.post('/api/regular/trans/doDeleteTrans', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                AUTH.methods.stopCountDown();
                alert("정기지급이 삭제되었습니다.");
                $(".modal").modal({ show: !1 })
                Util.back();
            } else {
                switch (code) {
                    // -1008 : 인증번호 불일치
                    case -1008:
                        Util.validCheck($(".modal-content"), $("#msg"), message, "p");
                        $("#authCode").val("");
                        break;
                    default:
                        alert(message);
                        AUTH.methods.resetAuth();
                        $(".modal").modal({ show: !1 })
                        break;
                }
            }
        },
        doAuthConfirmByRegularTrans: async function () {
            await _this.methods.doDeleteTrans();
        },
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
    }
}

window.FH = FH;
FH.init();