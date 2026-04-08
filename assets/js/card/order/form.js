import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";
import "/js/modal/emp.js";

// 카드 주문 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    employeeFileValidEl: $("#employeeFileValid"),
    deliveryValidEl: $("#deliveryValid"),
    mainGrid: null,
    wptlPrdNo: "",
    entpNm: KSM.targetEntpNm,
    productList: [],
    productDetail: null,
    orderAmount: 0,
    totalAmount: 0,
    bindAddr: null,
    paymentParams: null,
    paymentPopup: null,
    checkedEmpList: [],
    recipientInfoList: [],
    isOverlapModal: true,     // employee 모달 중첩 여부
    unmaskYn: "N",
    typingTimer: null,
    doneTypingInterval: 1000,
    layout : {
        isEmployee : false,
        isCorpDebitMaster : false,
        isShowRecipientArea : false,
        isShowDelvAddrArea : false,
        isShowPayArea : false
    },
    events: {
        // /**
        //  * key 이벤트
        //  */
        keyEvent: function () {
            $(document).on("keyup", "#useLimitMonthly, #useLimitDaily, #useLimitOnce", function() {
                let value = $(this).val();
                value = value.replaceAll(/[^0-9]/g, "");
                if( !Util.isEmpty(value) ) {
                    if( value.length > String(ConstCode.MONTHLY_PAYMENT_LIMIT_MAX).length) {
                        value = value.substring( 0, String(ConstCode.MONTHLY_PAYMENT_LIMIT_MAX).length );
                    }
                    value = Number(value);
                    $(this).val(value.toLocaleString("ko-KR"));
                }
            });
        },
        // /**
        //  * click 이벤트
        //  */
        // clickEvent: function () {
        // },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 주문 상품 리스트 영역 - 주문 상품 선택 변경시
            $(document).on("change", "input:radio[name=wptlPrdNo]", function () {
                _this.wptlPrdNo = $(this).val();
                _this.methods.getPageContent();
            })
            // 결제 방식 영역 - 결제 방식 선택 변경시
            $("input:radio[name=stlmMthdCd]").on("change", function () {
                let isBank = $(this).val() === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.BANK;
                $("#taxInfoText").toggle(isBank);
            })
        }
    },
    methods: {
        /**
         * 주문 할 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        getProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/card/doGetOrderProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<tr>' +
                           '<td class="red  f20 text-center" style="padding:90px 0;">상품 정보가 없습니다.</td>' +
                       '</tr>';
            if (code === 1) {
                _this.productList = entity;
                if (!Util.isEmpty(_this.productList)) {
                    // 운영상품 리스트에서 진입시, 해당 카드 선택
                    _this.wptlPrdNo = !Util.isEmpty(_this.wptlPrdNo) ? Number(_this.wptlPrdNo) : _this.productList[_this.productList.length - 1].wptlPrdNo
                    html = "";
                    for (let i = 0; i < _this.productList.length; i++) {
                        html += '<tr>' +
                                    '<td>' +
                                        '<label><input type="radio" class="radio" name="wptlPrdNo" value="' + _this.productList[i].wptlPrdNo + '" ' + (_this.productList[i].wptlPrdNo === _this.wptlPrdNo ? "checked" : "") + '>' +
                                        '<p><em></em><span>' + _this.productList[i].prdNm + ' (' + _this.productList[i].prdId + ')' + '</span></p></label>' +
                                    '</td>' +
                                '</tr>';
                    }
                    _this.methods.getPageContent();
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
            $("#productListWrap table tbody").html(html);
        },
        /**
         * 카드 주문 - 카드 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            // const wptlPrdNo = !Util.isEmpty(_this.wptlPrdNo) ? Number(_this.wptlPrdNo) : _this.productList[_this.productList.length - 1].wptlPrdNo
            _this.productDetail = _this.productList.find(item => item.wptlPrdNo === Number(_this.wptlPrdNo));
            const params = {
                path: "card/order/form_product",
                htmlData: {
                    productDetail: _this.productDetail,
                    unmaskYn: _this.unmaskYn
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#productDetailWrap").html(html);
            _this.methods.setAmount();
            $(".wrapper").css("display", (_this.productDetail.crdOrdRstYn === 'N' ? "block" : "none"));
            $(".tooltip-ordUnt").css("display", (Number(_this.productDetail.prdOrdUnt) > 0 ? "inline-flex" : "none"));
            $('.tooltip-ordUnt').attr('data-tooltip-text', '주문 수량 단위가 (' + _this.productDetail.prdOrdUnt + ') 로 설정되어 있습니다.');

            // 사원증 카드일때 사원증 파일 업로드 영역 노출
            const isEmployee = _this.productDetail.wptlPrdCrdTypeCd === ConstCode.CODES_PRODUCT.CRD_TYPE.EMPLOYEE;
            FH.layout.isEmployee = isEmployee;
            $("#empcFile").val("");                                          // 사원증 파일 초기화
            $("#empcFileNm").val("");
            $("#empcPhoFile").val("");
            $("#empcPhoFileNm").val("");
            $(".empcWrapF").css("display", (isEmployee ? "flex" : "none"));  // 사원증 타이틀 영역 토글
            $(".empcWrapB").css("display", (isEmployee ? "block" : "none")); // 사원증 파일 영역 토글


            // 카드 기본 한도 금액 설정 영역 노출 - 법인직불마스터카드일때
            const isCorpDebitMaster = _this.productDetail.wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER;
            FH.layout.isCorpDebitMaster = isCorpDebitMaster;

            const defaultAmount = isCorpDebitMaster ? Util.numberFormat(20000000) : '';
            $("#useLimitMonthly").val(defaultAmount);
            $("#useLimitDaily").val(defaultAmount);
            $("#useLimitOnce").val(defaultAmount);
            $("#recipientCount").text("0");
            $(".baseLimitAmountWrapF").css("display", (isCorpDebitMaster ? "flex" : "none"));  // 타이틀 영역 토글
            $(".baseLimitAmountWrapB").css("display", (isCorpDebitMaster ? "block" : "none")); // 입력 영역 토글

            // 카드 지급 대상자 영역 노출
            const isShowRecipientArea = _this.productDetail.mbRltgCrdDvCd === ConstCode.CODES_PRODUCT.CRD_KIND.MOBILE ||
                                        ((_this.productDetail.wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER || _this.productDetail.wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_MASTER)
                                            && (_this.productDetail.wlpoCrdNmWrteTypeCd === ConstCode.CODES_PRODUCT.CRD_NM_WRITE_TYPE.CORPORATE_EMPLOYEE));
            FH.layout.isShowRecipientArea = isShowRecipientArea;

            if(isShowRecipientArea) {
                $(".recipientWrapF").css("display", "flex");  // 타이틀 영역 토글
                $(".recipientWrapM").css("display", "flex");  // 수량 및 버튼 영역 토글
                $(".recipientWrapB").css("display", "block"); // 입력 영역 토글
            } else {
                $(".recipientWrapF").css("display", "none");  // 타이틀 영역 토글
                $(".recipientWrapM").css("display", "none");  // 수량 및 버튼 영역 토글
                $(".recipientWrapB").css("display", "none"); // 입력 영역 토글
            }

            // 배송지 영역 노출
            const isShowDelvAddrArea = !(_this.productDetail.mbRltgCrdDvCd === ConstCode.CODES_PRODUCT.CRD_KIND.MOBILE);
            FH.layout.isShowDelvAddrArea = isShowDelvAddrArea;
            if(isShowDelvAddrArea) {
                $(".delvAddrWrapF").css("display", "flex");
                $(".delvAddrWrapB").css("display", "flex");
            } else {
                $(".delvAddrWrapF").css("display", "none");
                $(".delvAddrWrapB").css("display", "none");
            }

            const isShowPayArea = !(_this.productDetail.mbRltgCrdDvCd === ConstCode.CODES_PRODUCT.CRD_KIND.MOBILE);
            FH.layout.isShowPayArea = isShowPayArea;
            if(isShowPayArea) {
                $(".payWrapF").css("display", "flex");
                $(".payWrapB").css("display", "flex");
            } else {
                $(".payWrapF").css("display", "none");
                $(".payWrapB").css("display", "none");
            }

            Toast.grid.clear();
        },

        /**
         * 카드 주문 내역 - 카드 지급 대상자 리스트 생성
         */
        setTable: function () {
            class LastNameRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;

                    const wlpoCrdNmWrteTypeCd = Util.nvl2(_this.productDetail, _this.productDetail.wlpoCrdNmWrteTypeCd, "");
                    const isInputHidden = wlpoCrdNmWrteTypeCd != ConstCode.CODES_PRODUCT.CRD_NM_WRITE_TYPE.CORPORATE_EMPLOYEE && !Util.isEmpty(props.value);

                    if(!Util.isEmpty(props.value)){
                        //props.value = props.value.toUpperCase();
                        const engLstn = isInputHidden ? ( _this.unmaskYn === "Y" ? grid.getRow(rowKey).unmaskEngLstn : grid.getRow(rowKey).engLstn ) : grid.getRow(rowKey).unmaskEngLstn;
                        _this.mainGrid.setValue(rowKey, "engLstn", engLstn.toUpperCase());
                        props.value = engLstn;
                        props.formattedValue = engLstn;
                    }

                    this.el = this.createElement(props, isInputHidden);
                    this.render(props);
                }
                createElement(props, isInputHidden) {
                    const {grid, rowKey} = props;

                    let createdEl;

                    const engLstn = grid.getRow(rowKey).unmaskEngLstn;
                    if(isInputHidden) {
                        createdEl = document.createElement("span");
                        createdEl.innerText = props.value;
                        createdEl.style.color = "#333";

                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "engLstn";
                        input.value = engLstn;
                        createdEl.append(input);
                        _this.mainGrid.disableCell(rowKey, "engLstn");

                    } else {
                        createdEl = document.createElement("input");
                        createdEl.type = "text";
                        createdEl.className = "inp text-center";
                        createdEl.placeholder = "성(HONG)";
                        createdEl.name = "engLstn";
                        createdEl.style.height = "35px";
                        createdEl.style.width = "180px";
                        createdEl.value = engLstn;
                    }

                    return createdEl;
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    this.el.value = props.value;
                }
            }

            class FirstNameRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;

                    const wlpoCrdNmWrteTypeCd = _this.productDetail != null ? _this.productDetail.wlpoCrdNmWrteTypeCd : "";     // 카드이름표기 (20:법인명)
                    const isInputHidden = wlpoCrdNmWrteTypeCd != ConstCode.CODES_PRODUCT.CRD_NM_WRITE_TYPE.CORPORATE_EMPLOYEE && !Util.isEmpty(props.value);

                    if(!Util.isEmpty(props.value)){
                        // props.value = props.value.toUpperCase();
                        const engFstn = isInputHidden ? ( _this.unmaskYn === "Y" ? grid.getRow(rowKey).unmaskEngFstn : grid.getRow(rowKey).engFstn ) : grid.getRow(rowKey).unmaskEngFstn;
                        _this.mainGrid.setValue(rowKey, "engFstn", engFstn.toUpperCase());
                        props.value = engFstn;
                        props.formattedValue = engFstn;
                    }

                    this.el = this.createElement(props, isInputHidden);
                    this.render(props);
                }
                createElement(props, isInputHidden) {
                    const {grid, rowKey} = props;

                    let createdEl;
                    const engFstn = grid.getRow(rowKey).unmaskEngFstn;
                    if(isInputHidden) {
                        createdEl = document.createElement("span");
                        createdEl.innerText = props.value;
                        createdEl.style.color = "#333";

                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "engFstn";
                        input.value = engFstn;

                        createdEl.append(input);

                        _this.mainGrid.disableCell(rowKey, "engFstn");
                    } else {
                        createdEl = document.createElement("input");
                        createdEl.type = "text";
                        createdEl.className = "inp text-center";
                        createdEl.placeholder = "이름(GILDONG)";
                        createdEl.name = "engFstn";
                        createdEl.style.height = "35px";
                        createdEl.style.width = "230px";
                        createdEl.value = engFstn;
                    }

                    return createdEl;
                }
                getElement() {
                    return this.el;
                }
                render(props) {
                    this.el.value = props.value;
                }
            }

            // "체크박스" cell 체크박스 customRenderer
            class CustomRenderer {
                constructor(props) {
                    const {grid, rowKey} = props;

                    const el = document.createElement("label");
                    el.className = "checkbox tui-grid-row-header-checkbox";
                    el.setAttribute("for", String(rowKey));
                    el.style.display = "block";

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "hidden-input";
                    input.id = String(rowKey);
                    input.name = "recipientCheck";
                    input.setAttribute("_wptlEmpNo", grid.getValue(rowKey, "wptlEmpNo"));
                    input.setAttribute("_rowKey",    rowKey);

                    const p = document.createElement("p");
                    const em = document.createElement("em");
                    const span = document.createElement("span");
                    span.className = "custom-input";

                    p.appendChild(em);
                    p.appendChild(span);

                    el.appendChild(input);
                    el.appendChild(p);

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
                    const checked = Boolean(props.value);
                    input.checked = checked;
                    _this.methods.validateDeleteButton();
                }
            }

            _this.mainGrid = Toast.methods.setGrid({
                el: "mainGrid",
                scrollY: false,
                bodyHeight: "auto",
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
                        header: "사원번호",
                        align: "center",
                        minWidth: 180,
                        name: "incmpEmpNo"
                    },
                    {
                        header: "임직원",
                        align: "center",
                        minWidth: 160,
                        width: "auto",
                        name: "stfNm",
                        formatter: function ({row, column, value}) {
                            return _this.unmaskYn === "Y" ? row.unmaskStfNm : row.stfNm;
                        }
                    },
                    {
                        header: "여권명(영문) 성",
                        align: "center",
                        width: "auto",
                        minWidth: 200,
                        name: "engLstn",
                        editor: 'text',
                        renderer: {
                            type: LastNameRenderer
                        },
                        onAfterChange(event) {
                            const LIMIT_LENGTH = 20;
                            const SPACE_LENGTH = 1;  // 띄어쓰기 길이

                            let thisVal = event.value;
                            let otherVal = _this.mainGrid.getValue(event.rowKey, "engFstn");
                            let otherValLen = Util.nvl(otherVal, "").length;
                            
                            if((thisVal + " " + otherVal).length > LIMIT_LENGTH) {
                                thisVal = thisVal.substr(0, (LIMIT_LENGTH - otherValLen - SPACE_LENGTH));
                            }

                            let result = Util.alphaOnly(thisVal).toUpperCase();
                            _this.mainGrid.setValue(event.rowKey, event.columnName, result);

                        },
                        formatter: function ({row, column, value}) {
                            return _this.unmaskYn === "Y" ? row.unmaskEngLstn : row.engLstn;
                        }
                    },
                    {
                        header: "여권명(영문) 이름",
                        align: "center",
                        width: "auto",
                        minWidth: 250,
                        name: "engFstn",
                        editor: 'text',
                        renderer: {
                            type: FirstNameRenderer
                        },
                        onAfterChange(event) {
                            const LIMIT_LENGTH = 20;
                            const SPACE_LENGTH = 1;  // 띄어쓰기 길이

                            let thisVal = event.value;
                            let otherVal = _this.mainGrid.getValue(event.rowKey, "engLstn");
                            let otherValLen = Util.nvl(otherVal, "").length;

                            if((thisVal + " " + otherVal).length > LIMIT_LENGTH) {
                                thisVal = thisVal.substr(0, (LIMIT_LENGTH - otherValLen - SPACE_LENGTH));
                            }

                            let result = Util.alphaOnly(thisVal).toUpperCase();
                            _this.mainGrid.setValue(event.rowKey, event.columnName, result);
                        },
                        formatter: function ({row, column, value}) {
                            return _this.unmaskYn === "Y" ? row.unmaskEngFstn : row.engFstn;
                        }
                    },
                    {
                        header: "휴대폰 번호",
                        align: "center",
                        width: "auto",
                        minWidth: 200,
                        name: "hpnmNo",
                        formatter: function ({row, column, value}) {
                            return _this.unmaskYn === "Y" ? row.unmaskHpnmNo : row.hpnmNo;
                        }
                    },
                    {
                        header: "입사일",
                        align: "center",
                        width: "auto",
                        minWidth: 160,
                        name: "entcoDt"
                    },
                    {
                        header: "보유 카드 수",
                        align: "center",
                        width: "auto",
                        minWidth: 120,
                        name: "cardCount"
                    },
                    {
                        header: "부서",
                        align: "center",
                        minWidth: 200,
                        name: "deptNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(value);
                        }
                    },
                    {
                        header: "직책",
                        align: "center",
                        minWidth: 160,
                        name: "rsbNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(value);
                        }
                    },
                    {
                        header: "직급",
                        align: "center",
                        width: "auto",
                        minWidth: 140,
                        name: "jgdNm",
                        formatter: function ({row, column, value}) {
                            return Util.emptyString(value);
                        }
                    },
                    {
                        header: "상태",
                        align: "center",
                        width: "auto",
                        minWidth: 110,
                        name: "wptlEntpWkinStNm"
                    }
                ]
            });



        },
        /**
         * 카드 지급 대상자 리스트 조회
         * @returns {Promise<void>}
         */
        doGetCardRecipientList: async function () {

        },
        /**
         * 카드 주문 수량 변경
         * @param type (수량 더하기: plus, 수량 빼기: minus)
         */
        setAmount: function(type = "") {
            let amountInput = $("#aplQty").val().trim();
            // let amount = 1;
            // if (!Util.isEmpty(amountInput)) amount = Number(Util.numberOnly(amountInput));
            let amount = Number(Util.numberOnly(amountInput));
            let orderUnit = (Number(_this.productDetail.prdOrdUnt) === 0 ? 1 : Number(_this.productDetail.prdOrdUnt));
            if (type === "plus") amount += orderUnit;
            if (type === "minus" && amount > orderUnit) amount -= orderUnit;
            // 3,000개 수량 제한
            if (amount > 3000) amount = 3000;
            amount = amount === 0 ? orderUnit : amount;
            $("#aplQty").val(Util.numberFormat(amount));
            clearTimeout(_this.typingTimer);
            _this.typingTimer = setTimeout (() => {
                amount = Math.round(amount / orderUnit) * orderUnit;
                // 3,000개 수량 제한
                if (amount > 3000) amount = amount - orderUnit;
                if (amount < orderUnit) amount = orderUnit;
                $("#aplQty").val(Util.numberFormat(amount));
                //console.log($("#aplQty").val());
                // 카드 가격
                let prdSllUprc = $("#cardAmount").attr("_prdSllUprc");
                let cardAmount = !Util.isEmpty(prdSllUprc) ? Number(prdSllUprc) : 0;
                // 합산 금액
                let orderAmount =  cardAmount * amount;
                _this.orderAmount = orderAmount === 0 ? "0" : Util.numberFormat(orderAmount);
                $("#orderAmount").text(_this.orderAmount + " 원");
                // 결제 금액
                let totalAmount =  orderAmount + ConstCode.DELIVERY_AMOUNT;
                _this.totalAmount = totalAmount === 0 ? "0" : Util.numberFormat(totalAmount);
                $("#totalAmount").text(_this.totalAmount + " 원");
            }, _this.doneTypingInterval);
        },

        /**
         * 카드 지급 대상자수에 따라 카드 주문 수량 변경
         * @param
         */
        setAmountByRecipientCount: function(cnt) {
            const amount = cnt || $("td input:checkbox[name=recipientCheck]").length;
            $("#aplQty").val(amount);

            // 카드 가격
            let prdSllUprc = $("#cardAmount").attr("_prdSllUprc");
            let cardAmount = !Util.isEmpty(prdSllUprc) ? Number(prdSllUprc) : 0;
            // 합산 금액
            let orderAmount =  cardAmount * amount;
            _this.orderAmount = orderAmount === 0 ? "0" : Util.numberFormat(orderAmount);
            $("#orderAmount").text(_this.orderAmount + " 원");
            // 결제 금액
            let totalAmount =  orderAmount + ConstCode.DELIVERY_AMOUNT;
            _this.totalAmount = totalAmount === 0 ? "0" : Util.numberFormat(totalAmount);
            $("#totalAmount").text(_this.totalAmount + " 원");

        },

        /**
         * 카드 지급 대상자 modal 열기
         * @param modalType (개별: list, 일괄: excel)
         */
        openEmpModal: async function (entity, maskingType="mask") {
            // 카드 지급 대상자 modal 열기 (js/modal/emp.js)
            _this.checkedEmpList = Toast.grid.getData().map((item) => {return item.wptlEmpNo});

            if(_this.checkedEmpList == null)
                _this.checkedEmpList = [];

            if(entity != null) {
                if(entity.successList != null) {
                    for(let i=0; i<entity.successList.length; i++) {
                        _this.checkedEmpList.push(entity.successList[i]);
                    }
                } else if (entity.wptlEmpNo != null) {
                    _this.checkedEmpList.push(entity.wptlEmpNo);
                }
            }

            EMP.methods.openEmpModal("order", "list", maskingType);
        },

        /**
         * 카드 지급 대상자 삭제
         * @param
         */
        deleteCardRecipientList: async function () {
            const promises = $(".tui-grid-lside-area td input:checkbox[name=recipientCheck]:checked").map(function (index, item) {
                const rowKey = $(item).attr("_rowKey");
                if (!Util.isEmpty(rowKey)) {
                    Toast.grid.removeRow(rowKey);
                }
            })

            await Promise.all(promises);

            // 삭제 하고 다시 버튼 비활성화
            $("#recipentDeleteBtn").addClass("disabled");

            // 주문 수량 변경
            const orderCnt = $("td input:checkbox[name=recipientCheck]").length;
            $("#recipientCount").text(orderCnt);

            _this.methods.setAmountByRecipientCount(orderCnt);
        },

        /**
         * 여권 영문명 밸리데이션 체크
         * @param
         */
        validateEngName: async function () {
            // 영문만 입력 가능

            // 자동 영문으로 변경

            // 글자수 체크

            // 필수 입력 여부 체크

        },

        /**
         * 카드 지급 대상자 삭제 버튼 disabled
         * @param
         */
        validateDeleteButton: async function () {

            if($(".tui-grid-lside-area td input:checkbox[name=recipientCheck]:checked").length == 0) {
                $("#recipentDeleteBtn").addClass("disabled");
            } else {
                $("#recipentDeleteBtn").removeClass("disabled");
            }
        },
        /**
         * 카드 지급 대상자 modal 에서 선택한 대상자 정보 조회
         * @param empList
         */
        getSelectedEmpInfo: async function (empList) {
            if(empList != null) {
                let wptlEmpNoList = empList.map(item => {return item.wptlEmpNo});

                const params = {
                    wptlEntpNo : KSM.targetWptlEntpNo // 기업 시퀀스
                    ,wptlEmpNoList: wptlEmpNoList
                }
                // console.log("params => ", params);
                const res = await ServiceExec.jsonPost('/api/card/doGetCardOrderSelectedEmpList', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {

                    $("#recipientCount").text(entity.length);

                    Toast.grid.resetData(entity);
                    Toast.grid.refreshLayout();

                    _this.methods.setAmountByRecipientCount(entity.length);

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


            }
        },

        /**
         * 임직원 modal 열기
         * @param modalType (엑셀: excel, 등록: reg, 수정: mod, 상세: info)
         * @param wptlEmpNo (임직원 시퀀스)
         * @returns {Promise<boolean>}
         */
        openEmployeeModal: async function (html) {
            if ($("#empModal").length) {
                $("#empModal").after(html);
            }
        },
        /**
         * 임직원 등록 modal 닫기
         */
        closeEmployeeModal: function () {
            if ($("#employeeModal").length) $("#employeeModal").remove();
        },

        /**
         * 주소 검색 모달 열기
         */
        openSearchAddress: function () {
            window.open("/common/doOpenJusoPopup", "pop", "width=570, height=420, scrollbars=yes, resizable=no")
            window.removeEventListener("message", FH.bindAddr);
            FH.bindAddr = function ({data}) {
                if (data.operate === "JUSO") {
                    // console.log(data.data);
                    $("#zipCd").val(data.data.zipNo);
                    $("#taklAddr").val(data.data.roadAddrPart1);
                    $("#taklDtlAddr").val(data.data.addrDetail);
                }
            }
            window.addEventListener("message", FH.bindAddr);
        },
        /**
         * 카드 주문 신청
         * @returns {Promise<boolean>}
         */
        doOrderCard: async function () {
            if (Util.isEmpty(_this.productDetail)) return false;

            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                                         // 기업 시퀀스  
                wptlPrdNo: _this.productDetail.wptlPrdNo,                                                 // 상품 시퀀스
                wptlPrdTypeCd : _this.productDetail.wptlPrdTypeCd,                                        // 복지포털상품유형코드(10:복지카드, 20:법인카드, 30: 법인마스터카드, 40: 법인직불마스터카드)
                aplQty: $("#aplQty").val(),                                                               // 수량
                empcFileNm:"",                                                                            // 사원증 엑셀 파일 이름
                empcFilePthNm: "",                                                                        // 사원증 엑셀 파일 경로
                empcPhoFileNm: "",                                                                        // 사원증 사진 파일 이름
                empcPhoFilePthNm: "",                                                                     // 사원증 사진 파일 경로
                useLimitMonthly: "",                                                                      // 월별 결제 한도
                useLimitDaily: "",                                                                        // 1일 결제 한도
                useLimitOnce: "",                                                                         // 1회 결제 한도
                recipientEmpNos: "",                                                                      // 카드 지급 대상자 직원번호
                recipientEngLstNms: "",                                                                   // 카드 지급 대상자 영문명 성
                recipientEngFstNms: "",                                                                   // 카드 지급 대상자 영문명 이름
                zipCd: "",                                                                                // 수령지 우편번호
                taklAddr: "-",                                                                             // 수령지 주소
                taklDtlAddr: "-",                                                                          // 수령지 상세 주소
                takpNm: "-",                                                                               // 수령자 이름
                takpTlno: "-",                                                                             // 수령자 연락처
                stlmMthdCd: "-",                                                                           // 결제 방식
                stlmMthdNm: "-",                                                                           // 결제 방식명
                txSoaPblYn: "N",                                                                           // 세금계신서 발행 여부
                wptlPrdCrdTypeCd: _this.productDetail.wptlPrdCrdTypeCd,                                                                    // 상품 타입\
                mbRltgCrdDvCd: Util.isEmpty(_this.productDetail.mbRltgCrdDvCd) ? "" : _this.productDetail.mbRltgCrdDvCd,                   // 상품 발급 유형
                wlpoCrdNmWrteTypeCd: Util.isEmpty(_this.productDetail.wlpoCrdNmWrteTypeCd) ? "" : _this.productDetail.wlpoCrdNmWrteTypeCd,  // 카드표기유형
                wlpoCrdNmWrteTypeNm: Util.isEmpty(_this.productDetail.wlpoCrdNmWrteTypeNm) ? "" : _this.productDetail.wlpoCrdNmWrteTypeNm,  // 카드표기유형
                signedText: ""
            }
            // 사원증 상품인 경우, 사원증 파일 추가
            if (FH.layout.isEmployee) {
                let empcFile = $("#empcFile")[0].files[0];
                let empcPhoFile = $("#empcPhoFile")[0].files[0];

                if(empcFile !== undefined) {
                    params.empcFile = empcFile; // 사원증 엑셀 파일
                }

                params.empcFileNm = $("#empcFileNm").val(); // 사원증 엑셀 파일 이름
                params.empcFilePthNm = $("#empcFilePthNm").val();   // 사원증 엑셀 파일 경로

                if(empcPhoFile !== undefined) {
                    params.empcPhoFile = empcPhoFile;   // 사원증 사진 파일
                }

                params.empcPhoFileNm = $("#empcPhoFileNm").val();   // 사원증 사진 파일 이름
                params.empcPhoFilePthNm = $("#empcPhoFilePthNm").val(); // 사원증 사진 파일 경로
            }

            // 법인 직불마스터 상품인 경우  카드 기본한도 금액 추가
            if(FH.layout.isCorpDebitMaster) {
                params.useLimitMonthly = $("#useLimitMonthly").val().replace(/,/g, ""); // 월별 결제 한도
                params.useLimitDaily = $("#useLimitDaily").val().replace(/,/g, "");     // 1일 결제 한도
                params.useLimitOnce = $("#useLimitOnce").val().replace(/,/g, "");      // 1회 결제 한도
            }

            if(FH.layout.isShowDelvAddrArea) {
                params.zipCd = $("#zipCd").val();
                params.taklAddr = $("#taklAddr").val();
                params.taklDtlAddr = $("#taklDtlAddr").val().trim();
                params.takpNm = $("#takpNm").val().trim();
                params.takpTlno = $("#takpTlno").data("realValue");
            }

            if(FH.layout.isShowPayArea) {
                let stlmMthdCd = $("input:radio[name=stlmMthdCd]:checked").val();
                params.stlmMthdCd = stlmMthdCd;                                                                   // 결제 방식
                params.stlmMthdNm = stlmMthdCd === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.CARD ? "신용카드" : stlmMthdCd === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.BANK ? "계좌이체" : "";  // 결제 방식명
                params.txSoaPblYn = stlmMthdCd === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.CARD ? "N" : "Y";         // 세금계산서 발행 여부
            }

            // 카드 지급 대상자 추가
            if(FH.layout.isShowRecipientArea) {
                // 직원번호
                let arrWptlEmpNo = [];
                $("td input:checkbox[name=recipientCheck]").each(function (index, item) {
                    const wptlEmpNo = $(item).attr("_wptlEmpNo");
                    arrWptlEmpNo.push(wptlEmpNo);
                })
                params.recipientEmpNos = arrWptlEmpNo.join(",");

                // 영문명 성
                let arrEngLstNm= [];
                $("td input[name=engLstn]").each(function (index, item) {
                    const recipientEngLastNm = $(item).val();
                    arrEngLstNm.push(recipientEngLastNm);
                })
                params.recipientEngLstNms = arrEngLstNm.join(",");

                // 영문명 이름
                let arrEngFstNm= [];
                $("td input[name=engFstn]").each(function (index, item) {
                    const recipientEngFirstNm = $(item).val();
                    arrEngFstNm.push(recipientEngFirstNm);
                })
                params.recipientEngFstNms = arrEngFstNm.join(",");
            }

            if (!_this.methods.orderValid(params)) return false;

            await FH.methods.callOrderCard(params);

            // let date = new Date();
            // let signData = params.wptlPrdNo + "_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
            // unisign.SignData(signData, null,
            //     function (signedText) {
            //         params.signedText = signedText;
            //         if (null == signedText || '' == signedText) {
            //             unisign.GetLastError(
            //                 function (errCode, errMsg) {
            //                     alert(errMsg);
            //                 }
            //             );
            //             return false;
            //         } else {
            //             FH.methods.callOrderCard(params);
            //         }
            //     }
            // );
        },
        callOrderCard: async function( params ) {
            const res = await ServiceExec.formPost('/api/card/doOrderCard', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                params.orderAmount = _this.orderAmount;
                params.totalAmount = _this.totalAmount;
                params.productDetail = _this.productDetail;
                _this.paymentParams = params;
                _this.recipientInfoList = Toast.grid.getData();

                // 카드 결제인 경우, 결제창 오픈
                if (params.stlmMthdCd === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.CARD) {
                    _this.methods.openPayment(entity);
                } else {
                    _this.paymentParams.Resultcd = "0000";
                    _this.methods.orderComplete();
                }
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        _this.methods.getProductList();
                        break;
                }
            }
        },
        /**
         * 카드 주문 신청 유효성 체크
         * @param params
         * @returns {boolean}
         */
        orderValid: function (params) {
            _this.employeeFileValidEl.html("");
            _this.deliveryValidEl.html("");

            // 결제 한도 금액 체크
            if(FH.layout.isCorpDebitMaster) {
                $("#baseLimitAmountValid").html("");

                let msg = "";
                let useLimitMonthly = params.useLimitMonthly.replace(/,/g, "");
                let useLimitDaily = params.useLimitDaily.replace(/,/g, "");
                let useLimitOnce = params.useLimitOnce.replace(/,/g, "");

                // 카드 기본 한도 금액 체크
                if (Util.isEmpty(params.useLimitOnce) || useLimitOnce < ConstCode.USE_LIMIT_ONCE_MIN || useLimitOnce > ConstCode.USE_LIMIT_ONCE_MAX) {
                    msg = "1회 결제 한도를 1만원 이상 1억원 이하로 입력해 주세요.";
                }
                if (Util.isEmpty(params.useLimitDaily) || useLimitDaily < ConstCode.USE_LIMIT_DAILY_MIN || useLimitDaily > ConstCode.USE_LIMIT_DAILY_MAX) {
                    msg = "1일 결제 한도를 1만원 이상 1억원 이하로 입력해 주세요.";
                }

                if (Util.isEmpty(params.useLimitMonthly) || useLimitMonthly < ConstCode.USE_LIMIT_MONTHLY_MIN || useLimitMonthly > ConstCode.USE_LIMIT_MONTHLY_MAX) {
                    msg = "월간 결제 한도를 1만원 이상 31억원 이하로 입력해 주세요.";
                }

                if(!Util.isEmpty(msg)) {
                    Util.validCheck(_this.scrollWrap, $("#baseLimitAmountValid"), msg);
                    return false;
                }
            }

            // 카드 지급 대상자 체크
            if(FH.layout.isShowRecipientArea) {

                $("#recipientValid").html("");

                // 카드 지급 대상자 미 추가시
                if(Util.isEmpty(params.recipientEmpNos) || params.recipientEmpNos.split(",").length == 0) {
                    Util.validCheck(_this.scrollWrap, $("#recipientValid"), "카드 지급 대상자를 추가해 주세요.");
                    return false;
                }

                // 카드 지급 대상자 체크
                if(   Util.isEmpty(params.recipientEngLstNms) || params.recipientEngLstNms.split(",").filter((item) => Util.isEmpty(item)).length > 0
                   || Util.isEmpty(params.recipientEngFstNms) || params.recipientEngFstNms.split(",").filter((item) => Util.isEmpty(item)).length > 0) {
                    Util.validCheck(_this.scrollWrap, $("#recipientValid"), "등록되어 있는 임직원의 여권명(영문)을 입력해 주세요.");
                    return false;
                }
            }

            if (FH.layout.isEmployee) {
                if (Util.isEmpty(params.empcFile) && Util.isEmpty(params.empcFileNm)) {
                    Util.validCheck(_this.scrollWrap, _this.employeeFileValidEl, "엑셀 파일을 업로드해 주세요.");
                    return false;
                }
                if (Util.isEmpty(params.empcPhoFile) && Util.isEmpty(params.empcPhoFileNm)) {
                    Util.validCheck(_this.scrollWrap, _this.employeeFileValidEl, "사진을 업로드해 주세요.");
                    return false;
                }
            }

            if(FH.layout.isShowDelvAddrArea) {
                if (Util.isEmpty(params.taklAddr)) {
                    Util.validCheck(_this.scrollWrap, _this.deliveryValidEl, "주소를 입력해 주세요.");
                    return false;
                }
                if (Util.isEmpty(params.taklDtlAddr)) {
                    Util.validCheck(_this.scrollWrap, _this.deliveryValidEl, "상세주소를 입력해 주세요.");
                    return false;
                }
                if (Util.isEmpty(params.takpNm)) {
                    Util.validCheck(_this.scrollWrap, _this.deliveryValidEl, "수령인을 입력해 주세요.");
                    return false;
                }
                if (Util.isEmpty(params.takpTlno)) {
                    Util.validCheck(_this.scrollWrap, _this.deliveryValidEl, "연락처를 입력해 주세요.");
                    return false;
                }
            }

            // if (!Util.validPhone(params.takpTlNo.replaceAll("-", ""))) {
            //     Util.validCheck(_this.scrollWrap, _this.deliveryValidEl, "올바른 휴대폰 번호를 입력해 주세요.");
            //     return false;
            // }
            return true;
        },
        /**
         * 결제창 오픈
         * @param wptlCrdOrdrNo (카드 주문 시퀀스)
         */
        openPayment: function (wptlCrdOrdrNo) {
            _this.paymentPopup = window.open("about:blank", "pop", "width=820, height=600, scrollbars=yes, resizable=no");
            _this.paymentPopup.location.href = "/api/card/openPayment?wptlCrdOrdrNo=" + wptlCrdOrdrNo;
        },
        /**
         * 결제 콜백
         * @param data
         */
        resultPayment: function (data) {
            _this.paymentPopup = null;
            _this.paymentParams.Resultcd = data.Resultcd;
            _this.paymentParams.Resultmsg = data.Resultmsg;
            setTimeout(() => {
                FH.methods.orderComplete();
            }, 1)
            // if (data.Resultcd === '0000') {
            //     setTimeout(() => {
            //         alert("결제 성공!!");
            //     }, 1)
            // } else {
            //     setTimeout(() => {
            //         alert("결제 실패!! " + data.Resultmsg);
            //     }, 1)
            // }
        },
        /**
         * 카드 주문 - 주문 완료 페이지 호출
         * @param params
         * @returns {Promise<void>}
         */
        orderComplete: async function ( maskingType = "mask" ) {
            const params = {
                path: "card/order/form_complete",
                htmlData: {
                    paymentData: _this.paymentParams,
                    recipientData: _this.recipientInfoList
                }
            }
            if( maskingType === "unmask" ) {
                params.htmlData.unmaskYn = "Y";
            } else {
                params.htmlData.unmaskYn = "N";
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);
            _this.scrollWrap.scrollTop(0);
        },
        unmaskingPage: async function( pageType ) {
            if( pageType === "complete" ) {
                FH.unmaskYn = "Y";
                await this.orderComplete( "unmask" );
            } else {
                FH.unmaskYn = "Y";
                $(".maskUserNm").text(_this.productDetail.userNm);
                $(".masking-input").each(function (idx, item) {
                    $(item).val($(item).data("realValue"));
                });

                Toast.grid.resetData(Toast.grid.getData());
                Toast.grid.refreshLayout();
            }
        }
    },
    init: function () {
        _this = this;

        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        if( $("input:radio[name=stlmMthdCd]").length < 2 ) {
            $("input:radio[name=stlmMthdCd]:eq(0)").trigger("click");
        }
        if( $("input:radio[name=stlmMthdCd]:checked").val() === ConstCode.CODES_CARD.ORDER_PAYMENT_TYPE.BANK ) {
            $("#taxInfoText").show();  // show text if BANK selected
        } else {
            $("#taxInfoText").hide();  // hide otherwise
        }
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();