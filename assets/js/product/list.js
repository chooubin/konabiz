import "/js/common/Toast.js?version=2025052101";
import "/js/modal/using.js?version=2025021201";

// 운영 상품 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#designValid"),
    productDetail: null,
    popupUnmaskYn: "N",
    popupGridData: [],
    wptlPrdNo: null,
    paymentLimitValidEl: $("paymentLimitValid"),
    events: {
        // /**
        //  * key 이벤트
        //  */
        keyEvent: function () {
            $(document).on("keyup", "#mmUseLmtAmtPop", function() {
                let value = $(this).val();
                value = value.replaceAll(/[^0-9]/g, "");
                if( !Util.isEmpty(value) ) {
                    if( value.length > String(ConstCode.MONTHLY_PAYMENT_LIMIT_MAX).length) {
                        value = value.substring( 0, String(ConstCode.MONTHLY_PAYMENT_LIMIT_MAX).length );
                    }
                    if( isNaN(value) ) {
                        $(this).val(value);
                    } else {
                        value = Number(value);
                        $(this).val(value.toLocaleString("ko-KR"));
                    }
                } else {
                    $(this).val( "" );
                }
            });
        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            $(document).on("click", "a[name=copyAccNoBtn]", function (e) {
                const targetEl = $(this).parent().children("[name='accNo']");
                if(targetEl) {
                    console.log("복사되었습니다.");
                    window.navigator.clipboard.writeText(targetEl.val());
                } else {
                    alert("값이 없습니다.");
                }

            })

            $(document).on("click", "a[name=showCashDeposit]", function (e) {
                const targetEl = $(e.target);
                if(targetEl) {
                    const cashId = targetEl.data("cashId");
                    const wptlPrdNo = targetEl.data("wptlPrdNo");
                    const parentEl = targetEl.parent('td')
                    _this.methods.doGetCashDepositAmount(parentEl, cashId, wptlPrdNo);
                }
            });

            $(document).on("click", "a[name=showRcgDeposit]", function (e) {
                const targetEl = $(e.target);
                if(targetEl) {
                    const rcId = targetEl.attr("data-rc-id");
                    const parentEl = targetEl.parent('td')
                    _this.methods.doGetRechargerDepositAmount(parentEl, rcId);
                }
            });
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 카드 캐시 정보 - 펼치기/접기 변경시
            $(document).on("click", ".cashInfoBtn", function () {
                $(this).toggleClass("active");
                $(this).parent("h3").next().toggle();
                $(this).closest(".h3-head").next().stop().slideToggle(300);
            });

            $(document).on( "blur", "#mmUseLmtAmtPop", function() {
                _this.paymentLimitValidEl.html("");
                let value = $(this).val();
                value = Number(value.replaceAll(",", ""));
                if( !Util.isEmpty(value) ) {
                    if( value < ConstCode.MONTHLY_PAYMENT_LIMIT_MIN ) {
                        value = ConstCode.MONTHLY_PAYMENT_LIMIT_MIN;
                    } else if( value > ConstCode.MONTHLY_PAYMENT_LIMIT_MAX ) {
                        value = ConstCode.MONTHLY_PAYMENT_LIMIT_MAX;
                    }
                    $(this).val( value.toLocaleString("ko-KR") );
                }
            });

            $(document).on("change", "input:radio[name=lmtOvrNfctYn], input:radio[name=lmtOvrNfctYnPop]", function() {
                const inputName = $(this).attr("name");
                const lmtOvrNfctYn = $("input:radio[name=" + inputName + "]:checked").val();
                const $notiUserList = inputName === "lmtOvrNfctYn" ? $("#notiUserList") : $("#notiUserListPop");

                if( lmtOvrNfctYn === "Y" ) {
                    $notiUserList.show();
                    Toast.grid.refreshLayout();
                } else {
                    $notiUserList.hide();
                }
            });
        }
    },
    methods: {
        /**
         * 알림 대상자 리스트 table 생성
         */
        setTable: function (isPopup = false) {
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;

                    const el = document.createElement("label");
                    el.className = "checkbox tui-grid-row-header-checkbox";
                    el.setAttribute("for", String(rowKey));
                    el.style.display = "block";

                    const wlpoUserNo = grid.getValue(rowKey, "wlpoUserNo");
                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "hidden-input";
                    input.id = String(rowKey);
                    input.name = isPopup ? "notiUserCheckPop" : "notiUserCheck";
                    input.dataset.wlpoUserNo = wlpoUserNo;

                    const p = document.createElement("p");
                    const em = document.createElement("em");
                    const span = document.createElement("span");
                    span.className = "custom-input";

                    p.appendChild(em);
                    p.appendChild(span);

                    el.appendChild(input);
                    el.appendChild(p);

                    const wlpoSvcNo = grid.getValue( rowKey, "wlpoSvcNo" );
                    const $notiUserInfoEl = $("span[data-wlpo-svc-no=" + wlpoSvcNo + "]");
                    if( $notiUserInfoEl.length ) {
                        for( let v = 0; v < $notiUserInfoEl.length; v++ ) {
                            const regWlpoUserNo = $notiUserInfoEl[v].dataset.wlpoUserNo;
                            if( regWlpoUserNo === String(wlpoUserNo) ) {
                                props.checkedValue = true;
                            }
                        }
                    }

                    el.addEventListener("click", (ev) => {
                        ev.preventDefault();
                        grid[!input.checked ? "check" : "uncheck"](rowKey);
                    })
                    this.el = el;
                    this.render(props);
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    const input = this.el.querySelector(".hidden-input");
                    const checked = Util.isEmpty(props.checkedValue) ? Boolean(props.value) : props.checkedValue;
                    if( checked ) {
                        props.grid.check(props.rowKey);
                    }
                    input.checked = checked;
                }
            }

            Toast.methods.setGrid({
                bodyHeight: "auto",
                scrollY: false,
                rowHeaders: [
                    {
                        type: "checkbox",
                        minWidth: 40,
                        renderer: {
                            type: CustomRenderer
                        }
                    }
                ],
                columns: [
                    {
                        header: "담당자명",
                        align: "center",
                        width: 105,
                        name: "userNm",
                        formatter: function ({row, column, value}) {
                            return _this.popupUnmaskYn === "Y" ? row.unmaskUserNm : row.userNm;
                        }
                    },
                    {
                        header: "권한",
                        align: "center",
                        width: 85,
                        name: "wptlUserRoleNm"
                    },
                    {
                        header: "휴대폰 번호",
                        align: "center",
                        minWidth: 100,
                        name: "userMphnNo",
                        formatter: function ({row, column, value}) {
                            return _this.popupUnmaskYn === "Y" ? row.unmaskUserMphnNo : row.userMphnNo;
                        }
                    },
                    {
                        header: "계정 상태",
                        align: "center",
                        width: 100,
                        name: "wptlUserStNm"
                    }
                ]
            });
        },
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function (type) {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            if( type === 'unmask' ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.productDetail = entity;
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
         * 운영 상품 - 내용 페이지 호출 (상품 리스트)
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "product/list_content",
                htmlData: {
                    productDetail: _this.productDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#productListWrap").html(html);
        },
        /**
         * 운영 상품 디자인 확정
         * @param el (디자인 확정 버튼)
         * @param wptlPrdNo (상품 시퀀스)
         * @returns {Promise<void>}
         */
        doChoiceProductDesign: async function (el, wptlPrdNo) {
            const $cstzCrdDsgWrap = $(el).closest("div.card-choice-list");
            const wptlCstzCrdDsgNo = $cstzCrdDsgWrap.find("input:radio[name=ra-card]:checked").val();
            const params = {
                wptlPrdNo: Number(wptlPrdNo),              // 상품 시퀀스
                wptlCstzCrdDsgNo: Number(wptlCstzCrdDsgNo) // 디자인 시퀀스
            }
            _this.validEl.html("");
            if (!$cstzCrdDsgWrap.find("input:radio[name=ra-card]:checked").length) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "디자인을 선택해 주세요.");
                return;
            }
            if (!confirm("선택한 디자인을 적용하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doChoiceProductDesign', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("선택한 디자인을 적용하였습니다.");
                _this.methods.doGetProductList();
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
         * 디자인 확정 유효성 체크
         * @returns {boolean}
         */
        choiceProductDesignValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.wptlCstzCrdDsgNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "디자인을 선택해 주세요.");
                return false;
            }
            return true;
        },
        /**
         * 기업 상품 캐시 - 데이터 조회
         * (사용처/제한처 설정 후, 갱신)
         * @returns {Promise<void>}
         */
        doGetCardCashInfo: async function (el, wptlPrdNo) {
            let params = {
                wptlPrdNo: Number(wptlPrdNo) // 상품 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doGetCardCashInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                params = {
                    path: "product/list_cash",
                    htmlData: {
                        cardCashInfoList: entity.cardCashInfoList
                    }
                }
                const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                $(el).html(html);
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
         * 상품 삭제
         * (디자인중 상태의 상품일 경우만 삭제)
         * @returns {Promise<void>}
         */
        doRemoveProduct: async function (wptlPrdNo) {
            let params = {
                wptlPrdNo: Number(wptlPrdNo) // 상품 시퀀스
            }
            if (!confirm("상품을 삭제하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/product/doRemoveProduct', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("신청 상품을 삭제하였습니다.");
                _this.methods.doGetProductList();
            } else {
                switch (code) {
                    case -6001:
                        alert(message);
                        _this.methods.doGetProductList();
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 결제 한도 설정 Modal 열기
         * @returns {Promise<boolean>}
         */
        openPaymentLimitModal: async function (modalType = "paymentLimitMod", wptlPrdNo, mmUseLmtAmt) {
            _this.popupUnmaskYn = "N";
            const notiUserParams = {
                wlpoEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wlpoSvcNo: wptlPrdNo
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/product/doGetNotifiableUserList', notiUserParams);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {

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

            const params = {
                path: "modal/paymentLimit",
                htmlData: {
                    modalType: modalType,
                    mmUseLmtAmt: mmUseLmtAmt,
                    lmtOvrNfctYn: "",
                    wptlPrdNo: wptlPrdNo
                }
            }
            if( !Util.isEmpty(mmUseLmtAmt) ) {
                params.htmlData.mmUseLmtAmt = mmUseLmtAmt;
            }
            if( entity.userList.length > 0 ) {
                params.htmlData.lmtOvrNfctYn = "Y";
            } else {
                params.htmlData.lmtOvrNfctYn = "N";
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#paymentLimitModal").length) $("#paymentLimitModal").remove();
            $("body").children("a.btn-top").after(html);

            $("#paymentLimitModal").modal({show: true});
            Toast.methods.getListInfo();
            FH.methods.setTable(true)
            if( !Util.isEmpty(entity) ) {
                _this.popupGridData = entity.userList;
                Toast.grid.resetData(entity.userList);
                Toast.grid.refreshLayout();
            }
            const $notiUserInfoEl = $("span[data-wlpo-svc-no=" + wptlPrdNo + "]");
            if( !$notiUserInfoEl.length ) {
                $("input:radio[name=lmtOvrNfctYnPop]:eq(1)").prop( "checked", true );
                $("input:radio[name=lmtOvrNfctYnPop]:eq(1)").trigger("change");
            }
        },
        openEnterAmountModal: async function (wptlPrdNo, cashId, isCorpCrd) {

            this.wptlPrdNo = wptlPrdNo;

            const params = {
                path: "modal/amountInputDownload",
                htmlData: {
                    wptlPrdNo: wptlPrdNo,
                    cashId: cashId,
                    modalType: 'svc',
                    isCorpCrd: isCorpCrd
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#amountInputDownloadModal").length) $("#amountInputDownloadModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#amountInputDownloadModal").modal({show: true});
        },
        openEnterQuoteModal: async function (wptlPrdNo) {

            this.wptlPrdNo = wptlPrdNo;
            const params = {
                path: "modal/quotationInput",
                htmlData: {
                    wptlPrdNo: wptlPrdNo,
                    modalType: 'svc'
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#quotationInputModal").length) $("#quotationInputModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#quotationInputModal").modal({show: true});
        },

        quotationDownload: async function(wptlPrdNo) {

            const wptPrdNo_ = wptlPrdNo;
            const orderQuantityInputString = $("#orderQuantityInput").val();
            const shippingQuantityInputString = $("#shippingQuantityInput").val();

            const orderQuantityInput = Util.numberOnly(orderQuantityInputString);
            let shippingQuantityInput = Util.numberOnly(shippingQuantityInputString);

            let isValid = true;

            // Ensure the input is positive
            if (!orderQuantityInput  || orderQuantityInput <= 0 || !shippingQuantityInput || shippingQuantityInput < 0) {
                console.log("Quantity must be a valid number.");
                alert("수량 입력 후 다운로드가 가능합니다.");
                isValid = false;
            }
            if(isValid){
                // Create the request parameters
                const params = {
                    wptlEntpNo: KSM.targetWptlEntpNo,
                    prdNo: wptPrdNo_,
                    orderQuantityInput: orderQuantityInput,
                    shippingQuantityInput: shippingQuantityInput
                };
                // Call the backend API to fetch required information and process
                try {
                    console.log(params);
                    ServiceExec.downPost('/api/product/doDownloadQuotation', params);
                } catch (error) {
                    console.error("Error during processing:", error);
                }
                $("[data-dismiss=modal]").trigger("click");
            }
        },

        downloadReport: async function(wptlPrdNo, cashId, isCorpCrd) {

            const wptPrdNo_ = wptlPrdNo;
            const inputAmount = $("#amountInput").val();
            let isValid = true;
            const amount = Util.numberOnly(inputAmount);

            // Validate input
            if (!amount || amount <= 0) {
                console.log("Please enter an amount.");
                alert("금액 입력 후 다운로드가 가능합니다.");
                isValid = false;
            }

            if(isValid){
                // Create the request parameters
                const params = {
                    wptlEntpNo: KSM.targetWptlEntpNo,
                    prdNo: wptPrdNo_,
                    cashId: cashId,
                    inputAmount: amount,
                    isCorpCrd: isCorpCrd
                };

                ServiceExec.downPost('/api/product/doDownloadRechargeReq', params);

                $("[data-dismiss=modal]").trigger("click");
            }
        },

        unmaskingPage: function() {
            _this.popupUnmaskYn = "Y";
            Toast.grid.resetData(_this.popupGridData);
            Toast.grid.uncheckAll();
            Toast.grid.refreshLayout();
        },
        /**
         * 결제한도 설정 확인
         */
        confirmPaymentLimitModal: async function( wptlPrdNo ) {
            const $modalScrollWrap = $(".modal-content");
            const $notiUserValidEl = $("#notiUserValid");
            $notiUserValidEl.html("");

            let mmUseLmtAmt;
            if( $("#mmUseLmtAmtPop").length ) {
                mmUseLmtAmt = $("#mmUseLmtAmtPop").val().trim();
                mmUseLmtAmt = mmUseLmtAmt.replaceAll(",", "");
                const $baseInfoValidEl = $("#amountValid");
                $baseInfoValidEl.html("");

                if (Util.isEmpty(mmUseLmtAmt)) {
                    Util.validCheck($modalScrollWrap, $baseInfoValidEl, "월간 결제한도를 입력해 주세요.");
                    return false;
                }
                const regex = /^[0-9]+$/g;
                if(!Util.validCheckRegex(mmUseLmtAmt, regex)) {
                    Util.validCheck($modalScrollWrap, $baseInfoValidEl, "월간 결제한도를 잘못 입력하였습니다.");
                    return false;
                }
                if( mmUseLmtAmt < ConstCode.MONTHLY_PAYMENT_LIMIT_MIN || mmUseLmtAmt > ConstCode.MONTHLY_PAYMENT_LIMIT_MAX ) {
                    Util.validCheck($modalScrollWrap, $baseInfoValidEl, "월간 결제한도는 100만원부터 1000억원까지 설정할 수 있습니다.");
                    return false;
                }
            }

            let params = {
                wptlPrdNo: wptlPrdNo,
                mmUseLmtAmt: Number(mmUseLmtAmt)
            }

            const lmtOvrNfctYn = $("input:radio[name=lmtOvrNfctYnPop]:checked").val();
            if( lmtOvrNfctYn === "Y" ) {
                params.notiUserList = Toast.grid.getCheckedRows();
                if( params.notiUserList.length < 1 ) {
                    Util.validCheck($modalScrollWrap, $notiUserValidEl, "알림 대상자를 등록해주세요.");
                    return false;
                }
                for( let v = 0; v < params.notiUserList.length; v++ ) {
                    params.notiUserList[v].userNm = params.notiUserList[v].unmaskUserNm;
                    params.notiUserList[v].nfctMphnNo = params.notiUserList[v].unmaskNfctMphnNo;
                    params.notiUserList[v].userMphnNo = params.notiUserList[v].unmaskUserMphnNo;
                }
            }
            if( !confirm("결제한도 설정을 저장하시겠습니까?") ) {
                return false;
            }

            //console.log(params);
            const res = await ServiceExec.jsonPost('/api/product/doUpdatePaymentLimit', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.methods.doGetProductList();
                $('.modal').modal({
                    show: !1
                })
                _this.popupUnmaskYn = "N";
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
         * 캐시 예치금 조회
         * @returns {Promise<void>}
         */
        doGetCashDepositAmount: async function (el, cashId, wptlPrdNo) {
            let params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                cashId: cashId,
                wptlPrdNo: wptlPrdNo
            }

            const res = await ServiceExec.post('/api/product/doGetCashDepositAmount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
             // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                el.text(entity + "원");
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        el.text("예치금 잔액을 불러올 수 없습니다.");
                        break;
                }
            }
        },

        issueDepositCertificate: function (prdNo, cashId, isCorpCrd) {
            let params = {
                entpNo: KSM.targetWptlEntpNo,
                cashId: cashId,
                prdNo: prdNo,
                isCorpCrd: isCorpCrd
            }

            ServiceExec.downPost('/api/product/issue-deposit-certificate', params);
            return;
        },

        /**
         * 충전상 예치금 조회
         * @returns {Promise<void>}
         */
        doGetRechargerDepositAmount: async function (el, rcId) {
            let params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                rcId: rcId,
            }

            const res = await ServiceExec.post('/api/product/doGetRechargerDepositAmount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
             // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                el.text(entity + "원");
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        el.text("예치금 잔액을 불러올 수 없습니다.");
                        break;
                }
            }
        },

        /**
         * 카드 캐시 정보 모달 오픈
         * @returns {Promise<void>}
         */
        openCardCashInfoModal: async function (wptlPrdNo, cardCashId, unmaskYn) {
            const params = {
                path: "modal/cardCash",
                wptlPrdNo: wptlPrdNo,
                cardCashId: cardCashId,
                unmaskYn: unmaskYn,
                htmlData: {
                    wptlPrdNo: wptlPrdNo,
                    cardCashId: cardCashId,
                    cardCashInfoRes: {}
                }
            }

            const res = await ServiceExec.post('/api/product/doGetCardCashInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {

                if(!Util.isEmpty(entity.cardCashInfoList)) {
                    params.htmlData.cardCashInfoRes = entity.cardCashInfoList[0];
                    const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                    if ($("#cardCashModal").length) $("#cardCashModal").remove();
                    $("body").children("a.btn-top").after(html);
                    $("#cardCashModal").modal({show: true});

                    _this.methods.doGetCashDepositAmount($("#depositAmount"), cardCashId);

                } else {
                    alert("포인트 정보를 불러오는데 실패하였습니다.");
                    return;
                }

            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        console.log(message);
                        alert("포인트 정보를 불러오는데 실패하였습니다.");
                        break;
                }
            }
        },
        openCardCash: function(wptlPrdNo, crdCashId) {
            Util.contCheck("/product/cash/detail", { wptlPrdNo : wptlPrdNo, crdCashId: crdCashId });
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Toast.methods.getListInfo(FH.methods.doGetProductList);
    }
}

window.FH = FH;
FH.init();