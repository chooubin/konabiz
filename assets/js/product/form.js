import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 운영 상품 신청 js
let _this;
const FH = {
    mainGrid: null,
    popupGrid: null,
    scrollWrap: $(".content"),
    validEl: $("#productInfoValid"),
    productInfoValidEl: $("#productInfoValid"),
    paymentLimitValidEl: $("#paymentLimitValid"),
    productDesignValidEl: $("#productDesignValid"),
    wptlPrdNo: $("#wptlPrdNo").val(),
    mainNotiUser: [],
    popupNotiUser: [],
    mainUnmaskYn: "N",
    popupUnmaskYn: "N",
    events: {
        // /**
        //  * key 이벤트
        //  */
        keyEvent: function () {
            $(document).on("keyup", "#mmUseLmtAmt, #mmUseLmtAmtPop", function() {
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
            $(document).on("change", "#wlpoCorpEnm", function () {
                _this.validEl.html("");
                let value = $(this).val();
                if( value.length < 1 ) {
                    return;
                }
                value = value.trim();
                const regex = /^([a-zA-Z]+[ ]{0,1})+$/;
                if(!Util.validCheckRegex(value, regex)) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "여권명에는 영문만 입력 가능합니다.");
                    return;
                }
                $(this).val(value.toUpperCase());
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
            // 상품 유형 영역 - 복지/법인 선택 변경시
            $("#wptlPrdTypeCd, input:radio[name=mbRltgCrdDvCd]").on("change", function () {
                // Change card design type to BASIC when either of these fields change
                $("input:radio[name=wptlCrdDsgTypeCd][value='" + ConstCode.CODES_PRODUCT.DSG_TYPE.BASIC + "']")
                        .prop("checked", true)
                        .trigger("change");
                _this.fieldValidCheck();
            });
            // 카드 유형 영역 - 일반카드/사원증 선택 변경시
            $("input:radio[name=wptlPrdCrdTypeCd]").on("change", function () {
                let isWelfare = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.WELFARE;
                let isInstantIssuedWelfare = $("input:radio[name=wptlCrdDsgTypeCd]:checked").val() === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT;
                let isNormal = $(this).val() === ConstCode.CODES_PRODUCT.CRD_TYPE.NORMAL;
                $("#normalListWrap").css("display", (isNormal ? "block" : "none"));    // 일반카드일때 기본템플릿 노출
                $("#employeeListWrap").css("display", (!isNormal ? "block" : "none")); // 사원증일때 사원증템플릿 노출
                $("#instantDesignRadio").parent().css("display", isWelfare && isNormal ? "inline-block" : "none");
                if(!isNormal && isInstantIssuedWelfare) {
                    $("#instantDesignRadio").prop("checked", false);
                    $("#basicDesignRadio").prop("checked", true);
                    isInstantIssuedWelfare = false;
                }
                $("#instantIssuedWelfareCardListWrap").css("display", (isInstantIssuedWelfare ? "block" : "none"));
                const inputsDisable = $("#dsgFile, #dsgFileNm, #fileFindBtn");
                inputsDisable.attr("disabled", isInstantIssuedWelfare);
                _this.showDesignSelectToolTip(isWelfare, isNormal);
            });
            // 상품 디자인 영역 - 디자인 선택 변경시
            $("input:radio[name=wptlCrdDsgTypeCd]").on("change", function () {
                _this.productDesignValidEl.html("");
                let isDirect = $(this).val() === ConstCode.CODES_PRODUCT.DSG_TYPE.DIRECT;
                $(".directDsgBtn").css("display", (isDirect ? "block" : "none")); // 디자인 가이드 다운로드 버튼 토글
                let result = (isDirect ? "파일 업로드" : '로고 업로드<span class="tooltip tooltip-kbc" data-tooltip-text="AI파일만 업로드 가능합니다."></span>');
                $(".dsgfileNm").html(result);       // 파일 업로드 이름 토글
                $(".basicDsgWrap").css("display", (isDirect ? "none" : "block")); // 디자인 템플릿 선택 영역 토글
                $("#dsgFile").attr( "accept", ".ai");
                FILE.methods.removeFile( $("#dsgFile").get(0) );
                let isInstantIssuedWelfare = $(this).val() === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT;
                let isNormal = $("input:radio[name=wptlPrdCrdTypeCd]:checked").val() === ConstCode.CODES_PRODUCT.CRD_TYPE.NORMAL;
                if(isInstantIssuedWelfare) {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.INSTANT_ISSUED_WELFARE);
                }else {
                    _this.toggleCardDisign(isNormal ? ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL : ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.EMPLOYEE );
                }

                if(isInstantIssuedWelfare){
                    $("#wptlCrdAdnFncAcYn").prop("checked", false);
                    $("#wptlCrdAdnFncTcYn").prop("checked", false);
                }

                const inputsDisable = $("#dsgFile, #dsgFileNm, #fileFindBtn");
                inputsDisable.attr("disabled", isInstantIssuedWelfare);

                _this.fieldValidCheck();
            })
            $("#mmUseLmtAmt").on("blur", function() {
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
                    _this.mainGrid.refreshLayout();
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
            // "체크박스" cell 체크박스 customRenderer
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

                    const mainGridData = _this.mainGrid.getData();
                    if( isPopup && mainGridData.length > 0 ) {
                        for( let v = 0; v < mainGridData.length; v++ ) {
                            if( mainGridData[v].wlpoUserNo == wlpoUserNo ) {
                                // input.checked = true;
                                props.checkedValue = true;
                                // grid[!input.checked ? "check" : "uncheck"](rowKey);
                                break;
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

            if( isPopup ) {
                _this.popupGrid = Toast.methods.setGrid({
                    el: "popupGrid",
                    bodyHeight: "auto",
                    scrollX: false,
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
                            width: 80,
                            name: "wptlUserRoleNm"
                        },
                        {
                            header: "휴대폰 번호",
                            align: "center",
                            name: "userMphnNo",
                            formatter: function ({row, column, value}) {
                                return _this.popupUnmaskYn === "Y" ? row.unmaskUserMphnNo : row.userMphnNo;
                            }
                        },
                        {
                            header: "계정 상태",
                            align: "center",
                            width: 95,
                            name: "wptlUserStNm"
                        }
                    ]
                });
            } else {
                _this.mainGrid = Toast.methods.setGrid({
                    el: "mainGrid",
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
                            width: 190,
                            name: "userNm",
                            formatter: function ({row, column, value}) {
                                return _this.mainUnmaskYn === "Y" ? row.unmaskUserNm : row.userNm;
                            }
                        },
                        {
                            header: "권한",
                            align: "center",
                            width: 140,
                            name: "wptlUserRoleNm"
                        },
                        {
                            header: "휴대폰 번호",
                            align: "center",
                            name: "nfctMphnNo",
                            minWidth: 150,
                            formatter: function ({row, column, value}) {
                                return _this.mainUnmaskYn === "Y" ? row.unmaskNfctMphnNo : row.nfctMphnNo;
                            }
                        },
                        {
                            header: "계정 상태",
                            align: "center",
                            width: 115,
                            name: "wptlUserStNm"
                        }
                    ]
                });
            }
        },
        /**
         * 운영 상품 신청/수정
         * @param wptlPrdNo
         * @returns {Promise<boolean>}
         */
        doRedifyProduct: async function (wptlPrdNo) {
            const isWelfare = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.WELFARE;
            const isCorp = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE;
            const isCorpDebit = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER;
            const isCorpMaster = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_MASTER;
            const isCorpDebitAccount = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT;
            const isMobile = $("input:radio[name=mbRltgCrdDvCd]:eq(1)").is(":checked");

            let wptlPrdCrdTypeCd = $("input:radio[name=wptlPrdCrdTypeCd]:checked").val();
            let dsgFile = $("#dsgFile")[0].files[0];

            let wptlBscDsgTplNo;
            if( isCorpDebit ) {
                //wptlPrdCrdTypeCd = isMobile ? ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_DEBIT_MASTER : ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_DEBIT_MASTER;
                wptlBscDsgTplNo = isMobile ? $("#mobileCorpDebitListWrap input:radio[name=ra-mb-card-corp-debit]:checked").val() : $("#corpDebitListWrap input:radio[name=ra-card-corp-debit]:checked").val();
            } else if( isCorpMaster ) {
                //wptlPrdCrdTypeCd = isMobile ? ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_MASTER : ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_MASTER;
                wptlBscDsgTplNo = isMobile ? $("#mobileCorpMastListWrap input:radio[name=ra-mb-card-corp-master]:checked").val() : $("#corpMastListWrap input:radio[name=ra-card-corp-master]:checked").val();
            } else if( isCorp || isWelfare ) {
                const type = $("input:radio[name=wptlPrdCrdTypeCd]:checked").val();
                if( isMobile ) {
                    if (isWelfare) {
                        wptlBscDsgTplNo = $("#mobileWelfareListWrap input:radio[name=ra-mb-card-welfare]:checked").val();
                    } else {
                        wptlBscDsgTplNo = $("#mobileCorpListWrap input:radio[name=ra-mb-card-corp]:checked").val();
                    }
                } else {
                    const isInstantIssuedWelfare = ($("input:radio[name=wptlCrdDsgTypeCd]:checked").val() === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT);
                    if (isInstantIssuedWelfare) {
                        wptlBscDsgTplNo = $("#instantIssuedWelfareCardListWrap input:radio[name=ra-card-instant-issued-welfare]:checked").val();
                    } else if (type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL) {
                        //wptlPrdCrdTypeCd = isMobile ? ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_NORMAL : ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL;
                        wptlBscDsgTplNo = $("#normalListWrap input:radio[name=ra-card-normal]:checked").val();
                    } else {
                        //wptlPrdCrdTypeCd = isMobile ? ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_EMPLOYEE : ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.EMPLOYEE;
                        wptlBscDsgTplNo = $("#employeeListWrap input:radio[name=ra-card-employee]:checked").val();
                    }
                }
            } else if (isCorpDebitAccount) {
                wptlBscDsgTplNo = $("#corpDebitAccountListWrap input:radio[name=ra-card-corp-debit-acn]:checked").val();
            }
            let wptlCrdDsgTypeCd = $("input:radio[name=wptlCrdDsgTypeCd]:checked").val();
            if(isWelfare && wptlCrdDsgTypeCd === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT) {
                wptlCrdDsgTypeCd = ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT;
            }
            if( isCorpDebit || isCorpMaster || isMobile ) {
                wptlCrdDsgTypeCd = ConstCode.CODES_PRODUCT.DSG_TYPE.BASIC;
            } else if (isCorpDebitAccount) {
                wptlCrdDsgTypeCd = ConstCode.CODES_PRODUCT.DSG_TYPE.PREMIUM;
            }

            let cashExpPeriod = $("input:radio[name=cashExpPeriod]:checked").val();

            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                                // 기업 시퀀스
                wptlPrdNo: Util.isEmpty(wptlPrdNo) ? "" : wptlPrdNo,                             // 상품 시퀀스
                wptlPrdTypeCd: $("#wptlPrdTypeCd").val(),                                        // 상품 타입
                "wptlPrdCrdTypeCd": wptlPrdCrdTypeCd,                                              // 카드 타입
                wptlCrdAdnFncAcYn: $("#wptlCrdAdnFncAcYn").is(":checked") ? "Y" : "N",           // 출입카드 여부
                wptlCrdAdnFncTcYn: $("#wptlCrdAdnFncTcYn").is(":checked") ? "Y" : "N",           // 교통 카드 여부
                mtStnYn: $("#mtStnYn").is(":checked") ? "Y" : "N",                               // 식권 여부
                "wptlCrdDsgTypeCd": wptlCrdDsgTypeCd,                                            // 카드 디자인 타입
                mbRltgCrdDvCd: $("input:radio[name=mbRltgCrdDvCd]:checked").val(),                   // 발급유형 (실물, 모바일)
                dsgFileNm: $("#dsgFileNm").val(),                                                // 로고, 디자인 파일 이름
                dsgFilePthNm: $("#dsgFilePthNm").val(),                                          // 로고, 디자인 파일 경로
                wptlBscDsgTplNo: !Util.isEmpty(wptlBscDsgTplNo) ? Number(wptlBscDsgTplNo) : "",   // 기본 디자인 시퀀스
            }
            if ($("input:radio[name=cashExpPeriod]:checked").length) {
                params.cashExpPeriod = cashExpPeriod;
            }
            if( !isMobile && (isCorpMaster || isCorpDebit) ) {
                params.wlpoCrdNmWrteTypeCd = $("#wlpoCrdNmWrteTypeCd").val();
                params.wlpoCorpEnm = $("#wlpoCorpEnm").val();
            }
            if( isCorpDebit ) {
                let mmUseLmtAmt = $("#mmUseLmtAmt").val();
                mmUseLmtAmt = mmUseLmtAmt.replaceAll( ",", "" );
                params.mmUseLmtAmt = mmUseLmtAmt;

                const lmtOvrNfctYn = $("input:radio[name=lmtOvrNfctYn]:checked").val()
                if( lmtOvrNfctYn === "Y" ) {
                    params.notiUserList = _this.mainGrid.getData();
                    for( let v = 0; v < params.notiUserList.length; v++ ) {
                        if (Util.isEmpty(params.notiUserList[v].wlpoSvcNo)) {
                            params.notiUserList[v].wlpoSvcNo = 0;
                        }
                        params.notiUserList[v].userNm = params.notiUserList[v].unmaskUserNm;
                        params.notiUserList[v].nfctMphnNo = params.notiUserList[v].unmaskNfctMphnNo;
                        params.notiUserList[v].userMphnNo = params.notiUserList[v].unmaskUserMphnNo;
                    }
                } else {
                    params.notiUserList = [];
                }
            }

            // 복지/법인 & 실물카드일 때만 로고 디자인 파일 업로드
            if( (isWelfare || isCorp) && !isMobile ) {
                if(dsgFile !== undefined) {
                    params.dsgFile = dsgFile; // 로고, 디자인 파일
                }
            }

            if (!_this.methods.productValid(params)) return false;
            if (!confirm("선택한 상품을 신청하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/product/doRedifyProduct', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("선택한 상품을 신청하였습니다.");
                Util.replace("/product/list");
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
        unmaskingPage: function( type ) {
            if( type === "popup" ) {
                _this.popupUnmaskYn = "Y";
                _this.popupGrid.resetData(_this.popupNotiUser);
                _this.popupGrid.uncheckAll();
                _this.popupGrid.refreshLayout();
            } else if( type === "main" ) {
                _this.mainUnmaskYn = "Y";
                _this.mainGrid.resetData(_this.mainNotiUser);
                _this.mainGrid.uncheckAll();
                _this.mainGrid.refreshLayout();
            }
        },
        /**
         * 알림 대상자 설정 Modal 열기
         * @returns {Promise<boolean>}
         */
        openNotiUserModal: async function (modalType = "notiUserMod") {
            _this.popupUnmaskYn = "N";
            let mmUseLmtAmt = $("#mmUseLmtAmt").val();
            mmUseLmtAmt = mmUseLmtAmt.replaceAll( ",", "" );

            const params = {
                path: "modal/notiUserSelect",
                htmlData: {
                    modalType: modalType,
                    "mmUseLmtAmt": mmUseLmtAmt,
                    lmtOvrNfctYn: $("input:radio[name=lmtOvrNfctYn]:checked").val()
                }
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#paymentLimitModal").length) $("#paymentLimitModal").remove();
            $("body").children("a.btn-top").after(html);

            const notiUserParams = {
                wlpoEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
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
            $("#paymentLimitModal").modal({show: true});
            Toast.methods.getListInfo();
            FH.methods.setTable(true)
            if( !Util.isEmpty(entity) ) {
                _this.popupNotiUser = entity.userList;
                _this.paymentLimitValidEl.html("");
                _this.popupGrid.resetData(entity.userList);
                _this.popupGrid.refreshLayout();
            }
        },
        /**
         * 결제한도 설정 확인
         */
        confirmPaymentLimitModal: function() {
            const isCorpDebit = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER;

            if( !isCorpDebit ) {
                alert( "결제한도 설정은 법인 직물 마스터카드 상품만 설정 가능합니다." );
                return false;
            }

            const $modalScrollWrap = $(".modal-content");
            const $notiUserValidEl = $("#notiUserValid");
            $notiUserValidEl.html("");
            if( $("#mmUseLmtAmtPop").length ) {
                let mmUseLmtAmt = $("#mmUseLmtAmtPop").val();
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
                $("#mmUseLmtAmt").val( $("#mmUseLmtAmtPop").val() );
            }

            if( $("input:radio[name=lmtOvrNfctYnPop]").length ) {
                const lmtOvrNfctYn = $("input:radio[name=lmtOvrNfctYnPop]:checked").val();
                if( lmtOvrNfctYn === "Y" ) {
                    const selectUserData = _this.popupGrid.getCheckedRows();
                    if( selectUserData.length < 1 ) {
                        Util.validCheck($modalScrollWrap, $notiUserValidEl, "담당자를 선택한 후 확인 버튼을 눌러주세요.");
                        return false;
                    }
                    // for( let v = 0; v < selectUserData.length; v++ ) {
                    //     selectUserData[v].userNm = selectUserData[v].maskingUserNm;
                    //     selectUserData[v].nfctMphnNo = selectUserData[v].maskingUserMphnNo;
                    // }
                    _this.mainNotiUser = selectUserData;
                    _this.mainGrid.resetData(selectUserData);
                    _this.mainGrid.uncheckAll();
                    $("input:radio[name=lmtOvrNfctYn]:eq(0)").prop( "checked", true );
                    $("input:radio[name=lmtOvrNfctYn]:eq(0)").trigger( "change" );
                    _this.mainGrid.refreshLayout();
                } else {
                    $("input:radio[name=lmtOvrNfctYn]:eq(1)").prop( "checked", true );
                    $("input:radio[name=lmtOvrNfctYn]:eq(1)").trigger( "change" );
                }
            } else {
                const selectUserData = _this.popupGrid.getCheckedRows();
                if( selectUserData.length < 1 ) {
                    Util.validCheck($modalScrollWrap, $notiUserValidEl, "담당자를 선택한 후 확인 버튼을 눌러주세요.");
                    return false;
                }

                // for( let v = 0; v < selectUserData.length; v++ ) {
                //     selectUserData[v].userNm = selectUserData[v].maskingUserNm;
                //     selectUserData[v].nfctMphnNo = selectUserData[v].maskingUserMphnNo;
                // }
                _this.mainNotiUser = selectUserData;
                _this.mainGrid.resetData(selectUserData);
                _this.mainGrid.uncheckAll();
                _this.mainGrid.refreshLayout();
            }

            $("[data-dismiss=modal]").trigger("click");
        },
        /**
         * 운영 상품 상세 - 신청/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        productValid: function (params) {
            const isWelfare = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.WELFARE;
            const isCorp = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE;
            const isCorpDebit = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER;
            const isCorpMaster = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_MASTER;
            const isCorpDebitAccount = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT;
            const isMobile = $("input:radio[name=mbRltgCrdDvCd]:eq(1)").is(":checked");

            _this.productInfoValidEl.html("");
            _this.paymentLimitValidEl.html("");
            _this.productDesignValidEl.html("");
            if( (isCorpDebit || isCorpMaster) && !isMobile ) {
                if (Util.isEmpty(params.wlpoCorpEnm)) {
                    Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, "법인명을 입력해주세요.");
                    return false;
                }
                const regex = /^([A-Z]+[ ]{0,1})+$/;
                if(!Util.validCheckRegex(params.wlpoCorpEnm, regex) || Util.validCheckRegex(params.engFstn, regex)) {
                    Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, "법인명은 대문자 영문만 입력 가능합니다.");
                    return false;
                }
                if(params.wlpoCorpEnm.length > 20) {
                    Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, "법인명은 최대 20자까지 입력해 주세요.");
                    return false;
                }
            }
            if( isCorpDebit ) {
                if (Util.isEmpty(params.mmUseLmtAmt)) {
                    Util.validCheck(_this.scrollWrap, _this.paymentLimitValidEl, "상품 월간 결제한도를 입력해 주세요.");
                    return false;
                }
                const regex = /^[0-9]+$/g;
                if(!Util.validCheckRegex(params.mmUseLmtAmt, regex)) {
                    Util.validCheck(_this.scrollWrap, _this.paymentLimitValidEl, "상품 월간 결제한도를 잘못 입력하였습니다.");
                    return false;
                }
                if( params.mmUseLmtAmt < ConstCode.MONTHLY_PAYMENT_LIMIT_MIN || params.mmUseLmtAmt > ConstCode.MONTHLY_PAYMENT_LIMIT_MAX ) {
                    Util.validCheck(_this.scrollWrap, _this.paymentLimitValidEl, "상품 월간 결제한도는 100만원부터 1000억원까지 설정할 수 있습니다.");
                    return false;
                }

                const lmtOvrNfctYn = $("input:radio[name=lmtOvrNfctYn]:checked").val();
                if( lmtOvrNfctYn === "Y" ) {
                    if (_this.mainGrid.getRowCount() < 1) {
                        Util.validCheck(_this.scrollWrap, _this.paymentLimitValidEl, "알림 대상자를 등록해주세요.");
                        return false;
                    }
                }
            }

            if( (isWelfare || isCorp) && !isMobile ) {
                if(params.wptlCrdDsgTypeCd === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT){}
                else if (Util.isEmpty(params.dsgFile) && Util.isEmpty(params.dsgFileNm)) {
                    let fileMsg = params.wptlCrdDsgTypeCd === ConstCode.CODES_PRODUCT.DSG_TYPE.BASIC ? "로고를" : "디자인 파일을";
                    Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, fileMsg + " 업로드해 주세요.");
                    return false;
                }
            }
            if (params.wptlCrdDsgTypeCd === ConstCode.CODES_PRODUCT.DSG_TYPE.BASIC && Util.isEmpty(params.wptlBscDsgTplNo)) {
                Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, "디자인을 선택해 주세요.");
                return false;
            }

            if (params.wptlCrdDsgTypeCd === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT && Util.isEmpty(params.wptlBscDsgTplNo)) {
                Util.validCheck(_this.scrollWrap, _this.productInfoValidEl, "디자인을 선택해 주세요.");
                return false;
            }
            return true;
        },
        removeNotiUser: function() {
            const rowKeys = _this.mainGrid.getCheckedRowKeys();
            _this.mainGrid.removeRows( rowKeys );
            _this.mainNotiUser = _this.mainGrid.getData();
        }
    },
    fieldValidCheck: function() {
        const isWelfare = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.WELFARE;
        const isCorp = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE;
        const isCorpDebit = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER;
        const isCorpMaster = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_MASTER;
        const isCorpDebitAccount = $("#wptlPrdTypeCd").val() === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_ACCOUNT_DEBIT;
        const isMobile = $("input:radio[name=mbRltgCrdDvCd]:eq(1)").is(":checked");

        let isNormal = $("input:radio[name=wptlPrdCrdTypeCd]:checked").val() === ConstCode.CODES_PRODUCT.CRD_TYPE.NORMAL;
        let isInstantIssuedWelfare = $("input:radio[name=wptlCrdDsgTypeCd]:checked").val() === ConstCode.CODES_PRODUCT.DSG_TYPE.INSTANT;
        if(!isWelfare && isInstantIssuedWelfare) {
            isInstantIssuedWelfare = false;
            $("#instantDesignRadio").prop("checked", false);
            $("#basicDesignRadio").prop("checked", true);
        }
        $("#instantDesignRadio").parent().css("display", isWelfare && isNormal ? "inline-block" : "none");
        if(isInstantIssuedWelfare){
            $("#isInstantIssuedWelfareClicked").show();
        }
        else{
            $("#isInstantIssuedWelfareClicked").hide();
        }
        _this.showDesignSelectToolTip(isWelfare, isNormal);
        const inputsDisable = $("#dsgFile, #dsgFileNm, #fileFindBtn");
        inputsDisable.attr("disabled", isInstantIssuedWelfare);
        if (isInstantIssuedWelfare) {
            FILE.methods.removeFile($("#dsgFile").get(0));
            $("#dsgFile").val("");
            $("#dsgFileNm").val("");
        }

        const $mtStnYn = $("#mtStnYn");
        const $wptlCrdAdnFncTcYn = $("#wptlCrdAdnFncTcYn");                                      // 법인 카드 - 교통카드 기능 X
        const $wptlCrdAdnFncAcYn = $("#wptlCrdAdnFncAcYn");
        if( !isWelfare || isCorpDebitAccount) {
            $wptlCrdAdnFncTcYn.prop("checked", false);                                             // "교통카드 기능" 체크해제
        }
        if( isMobile || isCorpDebitAccount ) {
            $wptlCrdAdnFncAcYn.prop("checked", false);
            $wptlCrdAdnFncTcYn.prop("checked", false);
        }

        $wptlCrdAdnFncAcYn.attr("disabled", isMobile || isInstantIssuedWelfare || isCorpDebitAccount);
        $wptlCrdAdnFncAcYn.next().find("em").css("background", (isMobile || isInstantIssuedWelfare || isCorpDebitAccount ? "#f7f9fc" : "#fff"));
        $wptlCrdAdnFncTcYn.attr("disabled", !isWelfare || isMobile || isInstantIssuedWelfare || isCorpDebitAccount);                                           // "교통카드 기능" disabled 토글
        $wptlCrdAdnFncTcYn.next().find("em").css("background", (!isWelfare || isMobile || isInstantIssuedWelfare || isCorpDebitAccount ? "#f7f9fc" : "#fff")); // "교통카드 기능" 비활성화 색상 변경


        $mtStnYn.attr("disabled", isCorpDebitAccount);
        $mtStnYn.next().find("em").css("background", (isCorpDebitAccount ? "#f7f9fc" : "#fff"));

        const $cashExpPeriod = $("input[name=cashExpPeriod]");
        $cashExpPeriod.eq(0).attr("disabled", isCorpDebitAccount);
        $cashExpPeriod.eq(0).next().find("em").css("background", (isCorpDebitAccount ? "#f7f9fc" : "#fff"));
        $cashExpPeriod.eq(1).attr("disabled", isCorpDebitAccount);
        $cashExpPeriod.eq(1).next().find("em").css("background", (isCorpDebitAccount ? "#f7f9fc" : "#fff"));

        const $rltgCrdDvCd = $("input:radio[name=mbRltgCrdDvCd]");
        $rltgCrdDvCd.eq(1).attr("disabled", isCorpDebitAccount);
        $rltgCrdDvCd.eq(1).next().find("em").css("background", (isCorpDebitAccount ? "#f7f9fc" : "#fff"));
        if (isCorpDebitAccount) {
            $mtStnYn.prop("checked", false);
            $rltgCrdDvCd.eq(0).prop("checked", true);
            $("input[name=cashExpPeriod]:checked").prop("checked", false);
        } else {
            if (!$("input[name=cashExpPeriod]:checked").length) {
                $("input[name=cashExpPeriod]:eq(0)").prop("checked", true);
            }
        }

        const $wptlPrdCrdTypeCd = $("input:radio[name=wptlPrdCrdTypeCd]");
        // 사원증 disabled 처리
        if( isCorpMaster || isCorpDebit || isMobile || isCorpDebitAccount ) {
            $wptlPrdCrdTypeCd.eq(0).prop("checked", true);
        }
        $wptlPrdCrdTypeCd.eq(1).attr("disabled", isCorpMaster || isCorpDebit || isMobile || isInstantIssuedWelfare || isCorpDebitAccount);
        $wptlPrdCrdTypeCd.eq(1).next().find("em").css("background", (isCorpMaster || isCorpDebit || isMobile || isInstantIssuedWelfare || isCorpDebitAccount ? "#f7f9fc" : "#fff"));

        $("#wlpoCrdNmWrteTypeCd").attr("disabled", isWelfare || isCorp || isMobile || isCorpDebitAccount);
        if( isWelfare || isCorp || isMobile || isCorpDebitAccount) {
            $("#wlpoCorpEnm").val("");
        }
        $("#wlpoCorpEnm").attr("disabled", isWelfare || isCorp || isMobile || isCorpDebitAccount);

        if( isWelfare || isCorp ) {
            const type = $("input:radio[name=wptlPrdCrdTypeCd]:checked").val();
            if( isMobile ) {
                $("#designSelectWrap").hide();
                if (isWelfare) {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_WELFARE );
                } else {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE );
                }
            } else {
                $("#designSelectWrap").show();
                if (isInstantIssuedWelfare) {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.INSTANT_ISSUED_WELFARE);
                }else if (type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL) {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL );
                } else {
                    _this.toggleCardDisign( ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.EMPLOYEE );
                }
            }
        } else {
            $("#designSelectWrap").hide();
            if( isCorpDebit ) {
                isMobile ? _this.toggleCardDisign(ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_DEBIT_MASTER) : _this.toggleCardDisign(ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_DEBIT_MASTER);
            } else if( isCorpMaster ) {
                isMobile ? _this.toggleCardDisign(ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_MASTER) : _this.toggleCardDisign(ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_MASTER);
            } else if (isCorpDebitAccount) {
                _this.toggleCardDisign(ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_ACCOUNT_DEBIT);
            }
        }

        if( isCorpDebit ) {
            $("#paymentLimitWrap").show();
        } else {
            $("#paymentLimitWrap").hide();
        }
    },
    toggleCardDisign: function( type ) {
        if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.NORMAL ) {
            $("#normalListWrap").show();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.EMPLOYEE ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").show();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_DEBIT_MASTER ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").show();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_MASTER ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").show();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_WELFARE ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").show();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").show();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_MASTER ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").show();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.MOBILE_CORPORATE_DEBIT_MASTER ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").show();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").hide();
        } else if( type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.INSTANT_ISSUED_WELFARE ) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").show();
            $("#corpDebitAccountListWrap").hide();
        } else if (type === ConstCode.CODES_PRODUCT.DSG_TEMPLATE_TYPE.CORPORATE_ACCOUNT_DEBIT) {
            $("#normalListWrap").hide();
            $("#employeeListWrap").hide();
            $("#corpDebitListWrap").hide();
            $("#corpMastListWrap").hide();
            $("#mobileWelfareListWrap").hide();
            $("#mobileCorpListWrap").hide();
            $("#mobileCorpMastListWrap").hide();
            $("#mobileCorpDebitListWrap").hide();
            $("#instantIssuedWelfareCardListWrap").hide();
            $("#corpDebitAccountListWrap").show();
        }

    },
    showDesignSelectToolTip: function(isWelfare, isNormal) {
        const text = `<b>기본디자인</b>: 제공된 템플릿 중 선택 + 카드 앞면 우측 하단에 회사 로고 삽입<br>
                      <b>직접디자인</b>: 디자인 가이드를 참고하여 직접 디자인 진행`;
        const tooltipText = (isWelfare && isNormal) ? text + `<br><b>바로 발급 디자인</b>: 고정 템플릿으로 제작되어 빠르게 발급되며, 로고 삽입은 불가` : text;
        //const tooltipText = text;
        $('#designSelectTooltip')
            .attr('data-tooltip-text', tooltipText)
            .data('tooltipText', tooltipText);
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        _this.fieldValidCheck();
        const lmtOvrNfctYn = $("input:radio[name=lmtOvrNfctYn]:checked").val();
        if( lmtOvrNfctYn === "Y" ) {
            $("#notiUserList").show();
        } else {
            $("#notiUserList").hide();
        }
        Toast.methods.getListInfo(FH.methods.setTable());

        if( !Util.isEmpty(notiUserList) ) {
            _this.mainNotiUser = notiUserList;
            _this.mainGrid.resetData(notiUserList);
        }

        _this.mainGrid.refreshLayout();
        stopLoading();
    }
}

window.FH = FH;
FH.init();