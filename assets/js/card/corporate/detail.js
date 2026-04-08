import "/js/modal/emp.js";

// 법인 카드 상세 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    chargeValidEl: null,
    empValidEl: null,
    baseLimitAmountValid: null,
    accountLimitPurpose: 'NONE',
    wptlPrdTypeCd: '',
    par: '',
    corporateCardDetail: {},
    recoveryPointsActionObj: {
        cardDetails: {},
        authDetails: {},
        pointReceiver: {}
    },
    unmaskYn: "N",
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        // /**
        //  * click 이벤트
        //  */
        // clickEvent: function () {
        // },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 자동충전 설정 영역 - 충전 설정 여부 선택 변경시
            $(document).on("change", "input:radio[name=corpCrdAutoChrgSeYn]", function () {
                let isAutoCharge = $(this).val() === ConstCode.TRUE;
                $("#thresholdBalance").prop("disabled", !isAutoCharge); // 기준금액 disable 토글
                $("#reloadAmount").prop("disabled", !isAutoCharge);     // 충전금액 disable 토글
                $("#depositPerMonth").prop("disabled", !isAutoCharge);  // 월 충전한도 disable 토글
                $("#rechargerId").prop("disabled", !isAutoCharge);      // 예치금계좌 disable 토글
            })
        }
    },
    methods: {
        /**
         * 법인 카드 상세 - 데이터 조회
         * @param pageType (상세: detail, 수정: mod)
         * @returns {Promise<void>}
         */
        doGetCorporateCardDetail: async function (pageType = "detail", maskingType = "mask") {
            FH.unmaskYn = "N";
            if (pageType === "cancel") {
                if (!confirm("취소 하시겠습니까?")) return;
                alert("취소 하였습니다.");
                pageType = "detail";
            }

            const params = {
                par: _this.par // 카드 par
            }
            if( maskingType === "unmask" ) {
                params.unmaskYn = "Y";
                FH.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetCorporateCardDetail', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.corporateCardDetail = entity;

                if (!Util.isEmpty(_this.corporateCardDetail)) await _this.methods.doGetDepositBankAccountList();
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
         * 예치금 계좌 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetDepositBankAccountList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                       // 기업 시퀀스
                wptlPrdNo: _this.corporateCardDetail.cardInfo.wptlPrdNo // 상품 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetCorporateBankAccount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.corporateCardDetail.depositAccountList = entity;
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
         * 법인 카드 상세 - 내용 페이지 호출
         * @param pageType (상세:detail, 수정: mod, 취소: cancel)
         * @returns {Promise<void>}
         */
        getPageContent: async function (pageType = "detail") {
            // if (pageType === "cancel") {
            //     if (!confirm("취소 하시겠습니까?")) return;
            //     alert("취소 하였습니다.");
            //     pageType = "detail";
            // }

            const params = {
                path: "card/corporate/detail_content",
                htmlData: {
                    pageType: pageType,
                    corporateCardDetail: _this.corporateCardDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            _this.scrollWrap.animate({scrollTop: 0}, 300);
        },
        /**
         * 법인 카드 상태 변경
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
                    let remainAmount = _this.corporateCardDetail.cardInfo.remainAmount;
                    if (!Util.isEmpty(remainAmount)) {
                        remainAmount = Number(remainAmount.replaceAll(",", ""));
                        if (remainAmount > 0) {
                            alert("카드 잔액 회수 후 폐기 가능합니다.");
                            return;
                        }
                    }
                    params.prdId = _this.corporateCardDetail.cardInfo.prdId;
                    confirmText = "법인 카드를 폐기하시겠습니까?";
                    alertText = "법인 카드를 폐기 하였습니다.";
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
                _this.methods.doGetCorporateCardDetail(pageType);
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
         * 자동충전 상태 수정
         * @param status (사용: ACTIVE, 정지:INACTIVE)
         * @returns {Promise<void>}
         */
        doUpdateAutoChargeStatus: async function (status) {
            const params = {
                par: _this.par, // 카드 par
                status: status  // 변경할 상태값
            }
            let confirmText = "";
            let alertText = "";
            switch (status) {
                case ConstCode.CODES_CARD.AUTO_CHARGE_STATUS_CHANGE_TYPE.ACTIVE:
                    confirmText = "자동 충전 정지 상태를 해제 하시겠습니까?";
                    alertText = "자동 충전 정지 상태를 해제 하였습니다.";
                    break;
                case ConstCode.CODES_CARD.AUTO_CHARGE_STATUS_CHANGE_TYPE.INACTIVE:
                    confirmText = "자동 충전 상태를 정지 상태로 변경 하시겠습니까?";
                    alertText = "자동 충전 상태를 정지 상태로 변경 하였습니다.";
                    break;
            }
            if (!confirm(confirmText)) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doUpdateAutoChargeStatus', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(alertText);
                _this.methods.doGetCorporateCardDetail();
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
         * 해외 결제 정보 등록
         * @param pageType (상세: detail, 수정: mod)
         * @param usePayment (해외결제 이용 차단 (ON/OFF))
         * @returns {Promise<void>}
         */
        doRegistCardInternationalInfo: async function (pageType, block, blockType) {
            const params = {
                par: _this.par,
                usePayment: _this.corporateCardDetail.cardInfo.blockInternationalPayment == 'ON' ? false : true,
                useKrw:     _this.corporateCardDetail.cardInfo.blockKrWonPayment == 'ON' ? false : true
            }
            let confirmText = "";
            let alertText = "";

            if(blockType == 'wonPayment'){
                params.useKrw = (block == 'ON' ? false : true);
                 switch (block) {
                     case 'ON':
                         confirmText = "해외 원화 결제를 차단하시겠습니까?";
                         alertText = "해외 원화 결제가 차단되었습니다.";
                         break;
                     case 'OFF':
                         confirmText = "해외 원화 결제 차단을 해제하시겠습니까?";
                         alertText = "해외 원화 결제가 차단이 off 상태로 변경되었습니다.";
                         break;
                 }
            }else {
                params.usePayment = (block == 'ON' ? false : true);
                 switch (block) {
                     case 'ON':
                         confirmText = "해외 이용을 차단하시겠습니까?";
                         alertText = "해외 이용이 차단되었습니다.";
                         break;
                     case 'OFF':
                         confirmText = "해외 이용 차단 상태를 해제하시겠습니까?";
                         alertText = "해외 이용 차단 설정이 OFF 상태로 변경되었습니다.";
                         break;
                 }
            }

            if (!confirm(confirmText)) return;
             // console.log(params);
            const res = await ServiceExec.jsonPost('/api/card/doRegistCardInternationalInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
             // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(alertText);
                _this.methods.doGetCorporateCardDetail(pageType);
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
         * 법인 카드 수정
         * @returns {Promise<void>}
         */
        doUpdateCorporateCard: async function () {
            const params = {
                par: _this.par,                                                                    // 카드 par
                wptlEmpNo: Number($("#wptlEmpNo").val()),                                          // 사용자 회원 시퀀스
                crdDsbMemoCn: $("#crdDsbMemoCn").val()                                             // 사용자 메모
            }

            // 자동충전
            if(_this.wptlPrdTypeCd != ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER && _this.wptlPrdTypeCd != ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT
                && _this.corporateCardDetail.cardInfo.balaUsePsblYn === "Y") {
                const autoChargeInfo = {
                    par: _this.par,                                                                // 카드 par
                    corpCrdAutoChrgSeYn: $("input:radio[name=corpCrdAutoChrgSeYn]:checked").val(), // 자동충전 설정 여부
                    thresholdBalance: $("#thresholdBalance").val().trim().replaceAll(",", ""),     // 기준 금액
                    reloadAmount: $("#reloadAmount").val().trim().replaceAll(",", ""),             // 자동충전 금액
                    depositPerMonth: $("#depositPerMonth").val().trim().replaceAll(",", ""),       // 월 충전 한도 금액
                    rechargerId: $("#rechargerId").val()                                           // 예치금 계쫘
                }
                params.autoChargeInfo = autoChargeInfo;
            }

            // 법인 직불 마스터카드일때 한도 금액 설정
            if(_this.wptlPrdTypeCd == ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER || _this.wptlPrdTypeCd == ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT) {
                const cardLimitInfo = {
                    useLimitMonthly:$("#useLimitMonthly").val().replace(/,/g, ""),
                    useLimitDaily:$("#useLimitDaily").val().replace(/,/g, ""),
                    useLimitOnce:$("#useLimitOnce").val().replace(/,/g, ""),
                    purpose: _this.accountLimitPurpose
                }
                params.cardLimitInfo = cardLimitInfo;
            }
            if(_this.wptlPrdTypeCd == ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT) {
                const wlpoDbitAcnSno = $("#wlpoDbitAcnSno").val();
                params.wlpoDbitAcnSno = Number(wlpoDbitAcnSno);
            }

            if (!_this.methods.updateCardValid(params)) return;
            if (!confirm("법인 카드 정보를 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/card/doUpdateCorporateCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("법인 카드 정보를 수정하였습니다.");
                await _this.methods.doGetCorporateCardDetail();
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
         * 법인 카드 수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        updateCardValid: function (params) {
            _this.empValidEl.html("");

            // 자동충전 사용인 경우, 충전정보 체크
            if (!Util.isEmpty(params.autoChargeInfo) && params.autoChargeInfo.corpCrdAutoChrgSeYn === "Y") {
                _this.chargeValidEl.html("");

                // 기명화 카드는 200만원, 미기명화 카드는 50만원까지만, 월 충전한도는 30억까지만
                const amountLimit = _this.corporateCardDetail.cardInfo.corpCrdSgznYn === "Y" ? 2000000 : 500000;
                const monthLimit = 3000000000;
                if (Util.isEmpty(params.autoChargeInfo.thresholdBalance) || params.autoChargeInfo.thresholdBalance === "0") {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "금액 설정을 입력해 주세요.");
                    return false;
                }
                // 기준금액 충전 한도 체크
                if (Number(params.autoChargeInfo.thresholdBalance) > amountLimit) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "자동충전금액 설정은 기준금액, 충전금액의 합이 최대 2,000,000원(미 기명화 카드는 최대 500,000원) 이상 입력할 수 없습니다.");
                    return false;
                }
                if (Util.isEmpty(params.autoChargeInfo.reloadAmount) || params.autoChargeInfo.reloadAmount === "0") {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "금액 설정을 입력해 주세요.");
                    return false;
                }
                // 충전금액 충전 한도 체크
                if (Number(params.autoChargeInfo.reloadAmount) > amountLimit) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "자동충전금액 설정은 기준금액, 충전금액의 합이 최대 2,000,000원(미 기명화 카드는 최대 500,000원) 이상 입력할 수 없습니다.");
                    return false;
                }
                // 기준금액 + 충전금액 충전 한도 체크
                if ((Number(params.autoChargeInfo.thresholdBalance) + Number(params.autoChargeInfo.reloadAmount)) > amountLimit) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "자동충전금액 설정은 기준금액, 충전금액의 합이 최대 2,000,000원(미 기명화 카드는 최대 500,000원) 이상 입력할 수 없습니다.");
                    return false;
                }
                if (Util.isEmpty(params.autoChargeInfo.depositPerMonth) || params.autoChargeInfo.depositPerMonth === "0") {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "월 충전 한도를 입력해 주세요.");
                    return false;
                }
                // 월 충전한도 한도 체크
                if (Number(params.autoChargeInfo.depositPerMonth) > monthLimit) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "월 충전 한도는 30억 이상 입력할 수 없습니다.");
                    return false;
                }
                // 충전금액이 월 충전 한도를 초과하는지 체크
                if (Number(params.autoChargeInfo.reloadAmount) > Number(params.autoChargeInfo.depositPerMonth)) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "자동충전 금액은 월 충전 한도 이상 입력할 수 없습니다.");
                    return false;
                }
                // 예치금 계좌 체크
                if (Util.isEmpty(params.autoChargeInfo.rechargerId)) {
                    Util.validCheck(_this.scrollWrap, _this.chargeValidEl, "예치금 운영 계좌를 선택해 주세요.");
                    return false;
                }
            }
            // 사용자 체크
            if (Util.isEmpty(params.wptlEmpNo) && _this.wptlPrdTypeCd != ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT) {
                Util.validCheck(_this.scrollWrap, _this.empValidEl, "임직원명을 입력해 주세요.");
                return false;
            }

            // 법인직불마스터카드인 경우, 한도 금액 체크
            if(_this.wptlPrdTypeCd == ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER || _this.wptlPrdTypeCd == ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT){
                _this.baseLimitAmountValid.html("");

                let useLimitMonthly = params.cardLimitInfo.useLimitMonthly;
                let useLimitDaily = params.cardLimitInfo.useLimitDaily;
                let useLimitOnce = params.cardLimitInfo.useLimitOnce;
                let msg = "";

                // 카드 기본 한도 금액 체크
                if (Util.isEmpty(useLimitOnce) || useLimitOnce < ConstCode.USE_LIMIT_ONCE_MIN || useLimitOnce > ConstCode.USE_LIMIT_ONCE_MAX) {
                    msg = "1회 결제 한도를 1만원 이상 1억원 이하로 입력해 주세요.";
                }
                if (Util.isEmpty(useLimitDaily) || useLimitDaily < ConstCode.USE_LIMIT_DAILY_MIN || useLimitDaily > ConstCode.USE_LIMIT_DAILY_MAX) {
                    msg = "1일 결제 한도를 1만원 이상 1억원 이하로 입력해 주세요.";
                }
                if (Util.isEmpty(useLimitMonthly) || useLimitMonthly < ConstCode.USE_LIMIT_MONTHLY_MIN || useLimitMonthly > ConstCode.USE_LIMIT_MONTHLY_MAX) {
                    msg = "월간 결제 한도를 1만원 이상 31억원 이하로 입력해 주세요.";
                }

                if(!Util.isEmpty(msg)) {
                    _this.baseLimitAmountValid.html(msg);
                    return false;
                }
            }

            return true;
        },
        /**
         * 법인 카드 앱 등록 해제
         * @param params
         * @returns {boolean}
         */
        doClearMobileApp: async function() {
            const params = {
                par: _this.par                                                                    // 카드 par
                // wptlEmpNo: Number($("#wptlEmpNo").val()),                                          // 사용자 회원 시퀀스
                // crdDsbMemoCn: $("#crdDsbMemoCn").val()                                             // 사용자 메모
            }
            if (!confirm("법인카드를 등록해제 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doClearMobileApp', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("등록해제 되었습니다.");
                //await _this.methods.doGetCorporateCardDetail();
                window.location.reload();
            } else {
                switch (code) {
                    // 예외처리 경우
                    case 280003053:
                        alert("충전취소/환불 처리중이어서 등록해제 할 수 없습니다.");
                        break;
                    case 280003064:
                        alert("송금중인 카드는 등록해제 할 수 없습니다.");
                        break;
                    case -1:
                        alert("하하");
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * Recovery of Points Modal Open
         * @returns {Promise<void>}
         */
        openPointRecoveryModal: async function (cardDetail,empInfo, pageType, bizStatusEnum) {
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
        },
        unmaskingPage: async function( pageType ) {
            FH.unmaskYn = "Y";
            if( pageType === "mod" ) {
                $("#unmaskCdno").parent("td").html($("#unmaskCdno").val() + "<br>( PAR : " + $("#unmaskCdno").data("par") + " )");
                $("#engFullNm").text($("#engFullNm").data("realValue"));
                $("#rechargerId option").each( function(idx, item) {
                    if( idx > 0 ) {
                        const acno = $(item).data("realValue");
                        const bankNm = $(item).data("bankName");
                        $(item).text(bankNm + " " + acno);
                    }
                });
                $("#wlpoDbitAcnSno option").each( function(idx, item) {
                    const acno = $(item).data("realValue");
                    const bankNm = $(item).data("bankName");
                    $(item).text(bankNm + " " + acno);
                });
            } else {
                await _this.methods.doGetCorporateCardDetail( "detail", "unmask" );
            }
        }
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
