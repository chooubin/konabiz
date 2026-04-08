import "/js/common/Auth.js?version=2024061801";

let _this;
const RECOVER_POINT = {
    transAuthUnmaskYn: "N",
    cardNumberUnmask:"N",
    cardParams:{},
     posCardList: [],
    recoveryPointsActionObj: {
        cardDetails: {},
        authDetails: {},
        pointReceiver: {}
    },
    isZero: false,
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
            // 유효기간 영역 (복지카드만) - 개월,특정일 선택 변경시
            $("#wlCrdDsbVlDvCd").on("change", function () {
                let isMonth = $(this).val() === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH;
                $("#periodMonth").css("display", (isMonth ? "flex" : "none")); // 개월 영역 토글
                $("#periodFixed").css("display", (isMonth ? "none" : "flex")); // 특정일 영역 토글
                $("input[name=wlCrdDsbVlDt]").val("");                         // 입력 값 초기화
            })
            $(document).on("change", "#cardModal #searchType", function(e) {
                const searchType = $(e.target).val();
                if( searchType === "1" ) {  // 카드번호(16자리)
                    $("#cardModal #searchText").attr( "maxlength", "19" );
                    $("#cardModal #searchText").attr( "data-masking-type", "CARD_NUMBER" );
                }  else {
                    $("#cardModal #searchText").removeAttr("data-masking-type");
                    $("#cardModal #searchText").attr( "maxlength", "4" );
                }
                $("#cardModal #searchText").val("");
                $("#cardModal #searchText").data("realValue", "");
            });
            $(document).on("input", "#cardModal #searchText", function () {
                if ($("#cardModal #searchType").val() === "2") {
                    const formatted = Util.numberOnly($(this).val());
                    $(this).val(formatted);
                }
            });

            $(function () {
                let isZero = false;
                $("#remainPoint, #remainAmount").each(function () {
                    if ($(this).length) {
                        const value = Number($(this).text().replace(/,/g, ''));
                        if (!isNaN(value) && value <= 0) {
                            isZero = true;
                            return false;
                        }
                    }
                });
                if(isZero) {
                    RECOVER_POINT.isZero = isZero;
                    // disable text inputs
                    $("#dsbRtrvlRsnCn, #apExpsPhrCn")
                        .prop("disabled", true)
                        .addClass("disabled");
                    // disable select
                    $("#wlCrdDsbVlDvCd")
                        .prop("disabled", true)
                        .addClass("disabled");
                    // disable inputs inside period sections
                    $("#periodMonth input, #periodFixed input")
                        .prop("disabled", true)
                        .addClass("disabled");
                }
            });

        }
    },
    methods: {

         /**
         * 카드 리스트 데이터 조회
         * @returns {Promise<boolean>}
         */
                doGetPosCrdList: async function ( type="info" ) {
                    let wptlPrdNo = _this.recoveryPointsActionObj?.cardDetails?.wptlPrdNo;
                    RECOVER_POINT.cardParams.wptlEntpNo = KSM.targetWptlEntpNo;                       // 기업 시퀀스
                    RECOVER_POINT.cardParams.wptlPrdNo = !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "";                // 상품 시퀀스
                    const $input = $("#cardModal #searchText");
                    if (type === "search") {
                        RECOVER_POINT.cardParams.searchType = $("#cardModal").length ? $("#cardModal #searchType").val() : "2"; // 검색 분류
                        RECOVER_POINT.cardParams.searchText = $("#cardModal").length
                            ? ($input.data("realValue") || $input.val().trim())
                            : "";  // 검색어
                    } else if (type === "unmask") {
                        RECOVER_POINT.cardParams.searchType = $("#cardModal").length ? $("#cardModal #searchType").val() : "2"; // 검색 분류
                        RECOVER_POINT.cardParams.searchText = $("#cardModal").length
                            ? ($input.data("realValue") || $input.val().trim())
                            : "";
                        RECOVER_POINT.cardParams.unmaskYn = "Y";
                    } else {
                        RECOVER_POINT.cardParams.searchType = "2";
                        RECOVER_POINT.cardParams.searchText = "";
                        RECOVER_POINT.cardParams.unmaskYn = "N";
                    }
                    RECOVER_POINT.cardParams.searchText = RECOVER_POINT.cardParams.searchText.replaceAll( "-", "" );
                    const params = { ...RECOVER_POINT.cardParams };
                    params.activeOnly= 'Y'
                    const res = await ServiceExec.post('/api/group/doGetPosCrdList', params);
                    const code = res.code;
                    const message = res.message;
                    const entity = res.entity;
                    if (code === 1) {
                        RECOVER_POINT.posCardList = entity.posCrdList;
                        params.cardInfo = entity;
                        // 이미 선택한 카드 disabled 처리를 위한 카드 리스트(지급 카드 영역) 추가
                        params.cardInfo.prvCrdList = []
                        params.pageType = 'recover'
                        RECOVER_POINT.methods.openCardModal(type, params);
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
                  * 지급할 카드 리스트 modal 열기
                  * @param entity (리스트 검색 파라미터, 카드 정보)
                  * @returns {Promise<void>}
                  */
                 openCardModal: async function (type, entity) {
                     const params = {
                         path: "modal/card",
                         htmlData: entity
                     }
                     const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                     if ($("#cardModal").length) $("#cardModal").remove();
                     $("#recoveryPointModal").after(html);
                     $("#cardModal").modal({show: true});

                     $(document).on("input", "#cardModal #searchText", function() {
                     if ($("#cardModal #searchType").val() === "2") {
                     const formatted = Util.numberOnly($(this).val());
                     $(this).val(formatted);
                     }
                     });

                     const searchType = $("#cardModal #searchType").val();
                     if( searchType === "1" ) {  // 카드번호(16자리)
                         $("#cardModal #searchText").attr( "maxlength", "19" );
                         $("#cardModal #searchText").attr( "data-masking-type", "CARD_NUMBER" );
                     } else if( searchType === "2" ) {  // 카드번호(뒤 4자리)
                         $("#cardModal #searchText").attr("maxlength", "4");
                         $("#cardModal #searchText").removeAttr("data-masking-type");
                     }
                     if( type !== "search" && type !== "unmask" ) {
                         $("#cardModal #searchType").trigger("change");
                     }
                     const elements = document.querySelectorAll("#cardModal .masking-input");
                     addEventListenerByElements( elements );
                     elements.forEach( (el) => {
                         //el.dataset.realValue = el.value;
                         el.dispatchEvent( new Event("input") );
                     });
                 },
                 /**
                          * 지급할 카드 리스트 modal 닫기
                          */
                         closeCardModal: function () {
                             if ($("#cardModal").length) $("#cardModal").remove();
                         },
                 /**
                          * 지급할 카드 리스트 modal - 카드 선택
                          * @param par (카드 par)
                          * @returns {Promise<void>}
                          */
                         selectCard: async function (par) {
                             let cardInfo = RECOVER_POINT.posCardList.find(item => item.par === par);
                             if (!Util.isEmpty(cardInfo)) {
                               $("#newCrdPar").val(cardInfo?.par);
                               console.log('_this.cardNumberUnmask',_this.cardNumberUnmask)
                             const displayText = _this.cardNumberUnmask === "Y"
                                   ? cardInfo.unmaskCdno
                                   : cardInfo.maskCdno;
                             $("#displayMaskCdno")
                               .text(displayText)
                               .attr("data-real-value", cardInfo.unmaskCdno);
                                 RECOVER_POINT.methods.closeCardModal();
                             }
                         },
        /**
         * Recovery of Points Start Process
         * @returns {Promise<void>}
         */
        processPointRecover: async function () {

            const pointReceiver = {
                newCrdPar: $("#newCrdPar").val(),
                dsbRtrvlRsnCn: $("#dsbRtrvlRsnCn").val().trim(),                            // 지급/회수 사유
                dsbRtrvlAmt: "",
                apExpsPhrCn: $("#apExpsPhrCn").val().trim(),                                // APP 노출 문구
                wlCrdDsbVlDvCd: "",                                                         // 유효기간 타입
                wlCrdDsbVlDt: ""                                                            // 유효기간 값:
            }

            if (Util.isEmpty(pointReceiver.newCrdPar)) {
                Util.validCheck($(".modal-content"), $("#msg"), "신규 지급 카드 선택 후, 이관할 포인트의 정보를 입력해주세요.", "p");
                return;
            }

            if (Util.isEmpty(pointReceiver.dsbRtrvlRsnCn) && !_this.isZero) {
                Util.validCheck($(".modal-content"), $("#msg"), "지급/회수 사유를 입력해 주세요.", "p");
                return false;
            }

            let wlCrdDsbVlDvCd = $("#wlCrdDsbVlDvCd").val();
            pointReceiver.wlCrdDsbVlDvCd = wlCrdDsbVlDvCd;
            pointReceiver.wlCrdDsbVlDt = wlCrdDsbVlDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH
                                   ? $("#periodMonth input[name=wlCrdDsbVlDt]").val().trim()
                                   : $("#periodFixed input[name=wlCrdDsbVlDt]").val().trim();


            if (Util.isEmpty(pointReceiver.wlCrdDsbVlDt) && !_this.isZero) {
                Util.validCheck($(".modal-content"), $("#msg"), "유효기간을 입력해 주세요.", "p");
                return false;
            }


            if (!confirm("신규 카드 지급과 포인트 이관을 진행하시겠습니까?")) return;

            _this.recoveryPointsActionObj.pointReceiver = pointReceiver;
            _this.methods.doTransSendAuthCode();

        },
        /**
         * 휴대폰 인증번호 발송
         * @returns {Promise<void>}
         */
        doTransSendAuthCode: async function (modal) {
            if($("#msg").length) {
                $("#msg").html("");
            }
            const res = await ServiceExec.post('/api/trans/doTransSendAuthCode');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.recoveryPointsActionObj.authDetails = entity;
                if ($("#recoveryPointModal").length) $("#recoveryPointModal").hide();

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
         * 지급/회수 인증 modal 열기
         * @returns {Promise<boolean>}
         */
        openTransAuthModal: async function () {
            _this.transUnmaskYn = "N";
            if (!AUTH.isSendAuth) {
                alert("휴대폰 인증을 진행해주세요.");
                return false;
            }
            const params = {
                path: "modal/transAuth",
                htmlData: {
                    pageType: 'recover'
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#transAutheModal").length) $("#transAutheModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#transAutheModal").modal({show: true});
            addEventListenerByElements($("#transAutheModal .masking-input").get());
            $("#transAutheModal .masking-input").each(function (idx, item) {
                item.dispatchEvent(new Event('input'));
            });
            $("#transAutheModal #authCode").focus();
        },
        /**
         * 지급/회수 등록 (인증번호 인증)
         * @returns {Promise<void>}
         */
        doAuthConfirm: async function () {
            await _this.methods.doPointRecoveryRequest();
        },
        /**
         * Recovery Finale Request
         * @returns {Promise<void>}
         */
        doPointRecoveryRequest: async function(){
            if (!AUTH.isSendAuth) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 재전송을 진행해주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && Util.isEmpty($("#authCode").val().trim())) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && String($("#authCode").val().trim()).length < 4) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증 번호를 정확히 입력해 주세요.", "p");
                return;
            }
            if (AUTH.isSendAuth && AUTH.expired) {
                Util.validCheck($(".modal-content"), $("#msg"), "인증번호 입력 시간을 초과하였습니다.", "p");
                return;
            }
            const authCode = $("#authCode").val();
            const allCollectedData = _this.recoveryPointsActionObj;

            const recoveryPointFinal = {
                authToken: allCollectedData?.authDetails?.authToken,
                authCode: authCode,
                wptlEntpNo: allCollectedData?.cardDetails?.wptlEntpNo,
                regWptlUserNo: KSM.targetWptlUserNo,
                wptlPrdNo: allCollectedData?.cardDetails?.wptlPrdNo,
                prdId: allCollectedData?.cardDetails?.prdId,
                wptlPrdTypeCd: allCollectedData?.cardDetails?.wptlPrdTypeCd,
                wptlEmpNo: allCollectedData?.cardDetails?.wptlEmpNo,
                oldCrdPar: allCollectedData?.cardDetails?.par,
                newCrdPar: allCollectedData?.pointReceiver?.newCrdPar,
                dsbRtrvlRsnCn: allCollectedData?.pointReceiver?.dsbRtrvlRsnCn,                         // 지급/회수 사유
                apExpsPhrCn: allCollectedData?.pointReceiver?.apExpsPhrCn,                             // APP 노출 문구
                wlCrdDsbVlDvCd: allCollectedData?.pointReceiver?.wlCrdDsbVlDvCd,                       // 유효기간 타입
                wlCrdDsbVlDt:  allCollectedData?.pointReceiver?.wlCrdDsbVlDt                           // 유효기간 값
            }

            const res = await ServiceExec.jsonPost('/api/trans/doRegistRecoveryTrans', recoveryPointFinal);
            const code = res.code;
            const message = res.message;
            if(code === 1){
                alert("신규카드 지급 및 포인트 이관을 완료하였습니다.");
                window.location.reload(true);
            } else {
                switch (code) {
                    case -1008:
                        Util.validCheck($(".modal-content"), $("#msg"), message, "p");
                        $("#authCode").val("");
                        break;
                    default:
                        alert("신규 카드 지급 및 포인트 이관에 실패하였습니다.");
                        AUTH.methods.resetAuth();
                        window.location.reload(true);
                        break;
    //                alert('문제가 발생했습니다!!!');
                }
            }
        },
        /**
         * Recovery of Points Close
         * @returns {Promise<void>}
         */
        closePointRecoveryModal: function () {
            if ($("#recoveryPointModal").length) $("#recoveryPointModal").remove();
        },
        unmaskingPage: function (pageType = "transAuth") {
          _this.cardNumberUnmask = "Y";
            if(pageType === 'recovModal') {
                $("#rcCrdNo").text($("#rcCrdNo").data("realValue"));
                 $("#displayMaskCdno").text($("#displayMaskCdno").data("realValue"));
                $('#newCrdPar option').each(function () {
                    var realVal = $(this).attr('data-real-value');
                    if (realVal) {
                        $(this).text(realVal);
                    }
                });
            } else {
                _this.transAuthUnmaskYn = "Y";
                $("#transAutheModal .masking-input").each( function(idx, item) {
                    $(item).val( $(item).data("realValue") );
                });
            }
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker("after");
        _this.recoveryPointsActionObj = FH.recoveryPointsActionObj;
    }
}

window.RECOVER_POINT = RECOVER_POINT;
RECOVER_POINT.init();