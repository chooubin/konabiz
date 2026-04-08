import "/js/modal/emp.js";

// 복지 카드 상세 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    empValidEl: null,
    par: '',
    welfareCardDetail: {},
    unmaskYn: "N",
    recoveryPointsActionObj: {
        cardDetails: {},
        authDetails: {},
        pointReceiver: {}
    },
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
         * 복지 카드 상세 조회
         * @param pageType (상세: detail, 수정: mod)
         * @returns {Promise<void>}
         */
        doGetWelfareCardDetail: async function (pageType = "detail", maskingType = "mask") {
            FH.unmaskYn = "N";
            const params = {
                par: _this.par // 카드 par
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
                FH.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetWelfareCardDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
             //console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.welfareCardDetail = entity;
                _this.methods.getPageContent(pageType);
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
         * 복지 카드 상세 - 내용 페이지 호출
         * @param pageType (상세:detail, 수정: mod, 취소: cancel)
         * @returns {Promise<void>}
         */
        getPageContent: async function (pageType = "detail") {
            if (pageType === "cancel") {
                if (!confirm("취소 하시겠습니까?")) return;
                alert("취소 하였습니다.");
                pageType = "detail";
                FH.unmaskYn = "N";
            }
            const params = {
                path: "card/welfare/detail_content",
                htmlData: {
                    pageType: pageType,
                    welfareCardDetail: _this.welfareCardDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            _this.scrollWrap.animate({scrollTop: 0}, 300);
        },
        /**
         * 복지 카드 상태 변경
         * @param pageType (상세: detail, 수정: mod)
         * @param bizStatusEnum (사용중, 중지, 폐기)
         * @returns {Promise<void>}
         */
        doChangeCardStatus: async function (pageType, bizStatusEnum) {
            const params = {
                par: _this.par,              // 카드 par
                bizStatusEnum: bizStatusEnum // 변경할 상태값
            }
            let confirmText = "";
            let alertText = "";
            switch (bizStatusEnum) {
                case ConstCode.CODES_CARD.CARD_STATUS_CHANGE_TYPE.RESUME:
                    confirmText = "사용 상태로 변경하시겠습니까?";
                    alertText = "사용 상태로 변경하였습니다.";
                    break;
                case ConstCode.CODES_CARD.CARD_STATUS_CHANGE_TYPE.SUSPEND:
                case ConstCode.CODES_CARD.CARD_STATUS_CHANGE_TYPE.ADMIN_SUSPEND:
                    confirmText = "중지 상태로 변경하시겠습니까?";
                    alertText = "중지 상태로 변경하였습니다.";
                    break;
                case ConstCode.CODES_CARD.CARD_STATUS_CHANGE_TYPE.TERMINATE:
                    let remainPoint = _this.welfareCardDetail.cardInfo.remainPoint;
                    if (!Util.isEmpty(remainPoint)) {
                        remainPoint = Number(remainPoint.replaceAll(",", ""));
                        if (remainPoint > 0) {
                            alert("잔여 포인트 회수 후 폐기 가능합니다.");
                            return;
                        }
                    }
                    params.prdId = _this.welfareCardDetail.cardInfo.prdId;
                    confirmText = "복지 카드를 폐기하시겠습니까?";
                    alertText = "복지 카드를 폐기 하였습니다.";
                    break;
            }
            if (!confirm(confirmText)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doChangeCardStatus', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(alertText);
                await Util.delay(1000);
                _this.methods.doGetWelfareCardDetail(pageType);
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
         * 카드 지급 대상자 바인딩
         * @param entity (카드 지급 대상자 정보 (js/modal/emp.js))
         * @returns {Promise<void>}
         */
        setEmpInfo: async function (entity) {
            $("#wptlEmpNo").val(entity.wptlEmpNo);
            $("#stfNm").val( entity.unmaskStfNm );
            $("#incmpEmpNo").text(entity.incmpEmpNo);
            $("#wptlEntpWkinStNm").text(entity.wptlEntpWkinStNm);
            $("#jgdNm").text(Util.isEmpty(entity.jgdNm) ? '-' : entity.jgdNm);
            $("#rsbNm").text(Util.isEmpty(entity.rsbNm) ? '-' : entity.rsbNm);
            $("#deptNm").text(Util.isEmpty(entity.deptNm) ? '-' : entity.deptNm);
            $("#engFullNm").text( FH.unmaskYn === "Y" ? (Util.isEmpty(entity.unmaskEngFullNm) ? '-' : entity.unmaskEngFullNm) : (Util.isEmpty(entity.maskEngFullNm) ? '-' : entity.maskEngFullNm) );
            $("#engFullNm").data("realValue", Util.isEmpty(entity.unmaskEngFullNm) ? '-' : entity.unmaskEngFullNm);
        },
        /**
         * 복지 카드 수정
         * @returns {Promise<void>}
         */
        doUpdateWelfareCard: async function () {
            const params = {
                par: _this.par,                           // 카드 par
                wptlEmpNo: Number($("#wptlEmpNo").val()), // 임직원 회원 시퀀스
                crdDsbMemoCn: $("#crdDsbMemoCn").val()    // 사용자 메모
            }
            if (!_this.methods.updateCardValid(params)) return;
            if (!confirm("복지 카드 정보를 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doUpdateWelfareCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("복지 카드 정보를 수정하였습니다.");
                _this.methods.doGetWelfareCardDetail();
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
         * 복지 카드 수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        updateCardValid: function (params) {
            _this.empValidEl.html("");
            if (Util.isEmpty(params.wptlEmpNo)) {
                Util.validCheck(_this.scrollWrap, _this.empValidEl, "임직원명을 입력해 주세요.");
                return false;
            }
            return true;
        },
        unmaskingPage: async function( pageType ) {
            FH.unmaskYn = "Y";
            if( pageType === "mod" ) {
                $("#unmaskCdno").parent("td").html($("#unmaskCdno").val() + "<br>( PAR : " + $("#unmaskCdno").data("par") + " )");
                $("#engFullNm").text($("#engFullNm").data("realValue"));
            } else {
                await _this.methods.doGetWelfareCardDetail( "detail", "unmask" );
            }
        },
        /**
         * Recovery of Points Modal Open
         * @returns {Promise<void>}
         */
        openPointRecoveryModal: async function (cardDetail,empInfo) {
            if (empInfo.wptlEntpWkinStNm === '퇴사') {
                alert('퇴사한 임직원은 카드 재지급 및 포인트 이관이 불가합니다.\n\n재직 상태로 변경 후 시도해주세요.');
                return;
            }
            if (cardDetail) {
                _this.recoveryPointsActionObj.cardDetails = cardDetail;
            }

            const param = {
                wptlPrdNo: cardDetail?.wptlPrdNo,
                wptlEntpNo: cardDetail?.wptlEntpNo,
                activeOnly: 'Y'
            }
            const targetCardList = await ServiceExec.post('/api/group/doGetPosCrdList', param);

            const modalParams = {
                path: "modal/recoverPoint",
                htmlData: {
                    modalType: "mod",
                    cardDetails: cardDetail,
                    cardList: targetCardList?.entity?.posCrdList || []
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', modalParams);
            if ($("#recoveryPointModal").length) $("#recoveryPointModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#recoveryPointModal").modal({show: true});
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