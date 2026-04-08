import "/js/common/Toast.js?version=2025052101";
import "/js/modal/emp.js?version=2025100802";
import "/js/common/Auth.js?version=2025010801";

// 정기 지급 등록 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#transValid"),
    wptlPrdTypeCd: "",
    woBalaRtrvlDvCd: ConstCode.CODES_TRANS.TRANS_AMOUNT_TYPE.EACH, // 금액, 전체잔액 여부
    isAmountApply: false,                                          // 금액 적용 여부  
    transTargetEmpList: [],
    trgpFileNm: "",                                        // 일괄등록 엑셀 파일 이름
    trgpFilePthNm: "",                                     // 일괄등록 엑셀 파일 경로
    transUnmaskYn: "N",
    transAuthUnmaskYn: "N",
    modalType: "",
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $(document).on("keyup", "#authCode", function (e) {
                if (e.keyCode === 13) {
                    if (!Util.isEmpty($("#authCode").val().trim())) {
                        _this.methods.doRegistTrans();
                    } else {
                        $("#authCode").focus();
                    }
                }
            });
        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // 정기지급 금액 영역 - 금액 버튼들 클릭시
            $("button[name=applyAmountBtn]").on("click", function () {
                $("#dsbAmt").val($(this).attr("_amount")); // 금액 input에 값 바인딩
            })
            // 정기지급 금액 영역 - 적용 클릭시
            $("#addApply").on("click", function () {
                let amount = $("#dsbAmt").val().trim();
                if (Util.isEmpty(amount)) return;
                if (amount <= 0) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "지급 금액을 잘못 입력하였습니다.");
                    return;
                }
                _this.validEl.text("");

                amount = Util.numberFormat(amount) + " 원";
                $("#applyAmount").text(amount);

                _this.isAmountApply = true;                  // 금액 적용 flag true
                $("#applyWrap").css("display", "table-row"); // 금액 적용 영역 보임
                $(".applyEl").prop("disabled", true);        // 금액 버튼 비활성화

                $(".applyEl").removeClass("hover");

                if (!Util.isEmpty(_this.transTargetEmpList)) // 등록 대상자 리스트 금액 적용 (금액 추가)
                    _this.methods.setEmpInfoListByRegularTrans(_this.transTargetEmpList);
            });
            // 정기지급 금액 영역 - 삭제 클릭시
            $("#deleteApply").on("click", function () {
                _this.isAmountApply = false;                 // 금액 적용 flag false
                $("#applyWrap").css("display", "none");      // 금액 적용 영역 숨김
                $(".applyEl").prop("disabled", false);       // 금액 버튼 활성화
                $(".applyEl").addClass("hover");
                if (!Util.isEmpty(_this.transTargetEmpList)) // 등록 대상자 리스트 금액 적용 (금액 빠짐)
                    _this.methods.setEmpInfoListByRegularTrans(_this.transTargetEmpList);
            });
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 상품명 영역 - 상품 선택 변경시
            $("#wptlPrdNo").on("change", function () {
                $("#cashWithBalaWrap").css("display", "none");
                _this.wptlPrdTypeCd = $("option:selected", this).attr("_wptlPrdTypeCd");
                if (Util.isEmpty(_this.wptlPrdTypeCd)) { // 상품명 "전체"
                    $("#fxtmDsbTypeCd").html('<option value="">선택해 주세요.</option>');
                    $("#corporateWrap").css("display", "none");                           // 법인 카드 영역 숨김
                    $("#welfareWrap").css("display", "none");                             // 복지 카드 영역 숨김
                    $("#fxtmDsbVlPridDvCd").val("10");    // 복지 카드 유효기간 영역 값 초기화
                    $("#periodMonth").css("display", "flex");
                    $("input[name=pntVlDt]").val("");
                    $(".periodWrap").css("display", "none");                           // 복지카드 유효기간 영역 노츨
                    $("#periodMonth").css("display", "none");                          // 복지카드 유효기간 개월 영역 노출
                    return false;
                }

                const crdPntUsePsblYn = $("option:selected", this).attr("_crdPntUsePsblYn");
                const balaUsePsblYn = $("option:selected", this).attr("_balaUsePsblYn");

                $("#fxtmDsbTypeCd").html('<option value="">선택해 주세요.</option>');

                if( crdPntUsePsblYn === "Y" ) {
                    $("#fxtmDsbTypeCd").append( '<option value="10" _dsbRtrvlType="10">카드포인트 지급</option>' );
                }
                if( balaUsePsblYn === "Y" && _this.wptlPrdTypeCd !== ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER ) {
                    $("#fxtmDsbTypeCd").append( '<option value="10" _dsbRtrvlType="20">잔액 충전</option>' );
                }

                $(".periodWrap").css("display", "none");                           // 복지카드 유효기간 영역 노츨
                $("#periodMonth").css("display", "none");                          // 복지카드 유효기간 개월 영역 노출
                $(".periodBorder").css("display", "table-cell");
                $("#apExpsMsgCn").attr("disabled", true);                          // 앱 노출문구 disabled 토글

                $("#fxtmDsbVlPridDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 복지카드 유효기간 타입 값 초기화
                $("#periodMonth").css("display", "flex");                           // 복지카드 유효기간 개월 영역 노출
                $("input[name=pntVlDt]").val("");                                   // 복지카드 유효기간 값 초기화
                $("#apExpsMsgCn").val("");                                          // 앱 노출문구 초기화

                _this.methods.setEmpInfoListByRegularTrans([]);                // 등록 대상자 리스트 초기화
            })
            // 지급 분류 영역 - 지급 선택 변경시
            $("#fxtmDsbTypeCd").on("change", function () {
                let isTake = $(this).val() === ConstCode.CODES_TRANS.TRANS_TYPE.TAKE;
                $("#totalRemainAmount").css("display",(isTake ? "inline-block" : "none"));  // 회수인 경우 "전체 잔액" 버튼 노출

                const dsbRtrvlType = $("#fxtmDsbTypeCd option:selected").attr("_dsbRtrvlType");
                if( Util.isEmpty($(this).val()) ) {
                    $("#cashWithBalaWrap").css("display", "none");
                    $("input[name=wlCrdDsbVlDt]").val("");
                    $("#crdCashWithBalaId").html( '<option value="">등록할 카드포인트/잔액을 선택해 주세요.</option>' );
                    $("#periodMonth").css("display", "flex");                                 // 복지카드 유효기간 개월 영역 노출
                    $("#periodFixed").css("display", "none");                                 // 복지카드 유효기간 특정일 영역 숨김
                    $("input[name=wlCrdDsbVlDt]").val("");                                    // 복지카드 유효기간 값 초기화
                    $("#apExpsMsgCn").attr("disabled", true);                          // 앱 노출문구 disabled 토글
                    $("#apExpsMsgCn").val("");
                    return;
                } else {
                    _this.methods.doGetCashBalaDepositList(dsbRtrvlType);                          // 캐시/잔액명 리스트 조회
                    $("#cashWithBalaWrap").css("display", "table-row");
                }
                if(dsbRtrvlType === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH) {
                    $("#apExpsMsgCn").attr("disabled", false);                          // 앱 노출문구 disabled 토글
                } else {
                    $("#apExpsMsgCn").attr("disabled", true);                          // 앱 노출문구 disabled 토글
                    $("#apExpsMsgCn").val("");
                }

                if(isTake || dsbRtrvlType === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA) {
                    $(".periodWrap").css("display",  "none" );   // 유효기간 영역 비노츨
                    $(".periodBorder").css("display",  "table-cell" );
                    $("#periodMonth").css("display", "flex");                                 // 복지카드 유효기간 개월 영역 노출
                    $("#periodFixed").css("display", "none");                                 // 복지카드 유효기간 특정일 영역 숨김
                    $("input[name=pntVlDt]").val("");                                    // 복지카드 유효기간 값 초기화
                } else {
                    $(".periodWrap").css("display",  "table-cell" );   // 유효기간 영역 노츨
                    $(".periodBorder").css("display",  "none" );
                }

                if (!isTake) { // 지급 선택, "전체 잔액"으로 세팅 되있는 경우
                    if ($("#dsbRtrvlAmt").val() === "전체 잔액") {
                        $("#dsbRtrvlAmt").val("");                   // 금액 입력값 초기화
                        _this.isAmountApply = false;                 // 금액 적용 flag false
                        $("#applyWrap").css("display", "none");      // 금액 적용 영역 숨김
                        $(".applyEl").prop("disabled", false);       // 금액 버튼 활성화
                        if (!Util.isEmpty(_this.transTargetEmpList)) // 등록 대상자 리스트 금액 적용 (금액 빠짐)
                            _this.methods.setEmpInfoListByRegularTrans(_this.transTargetEmpList);
                    }
                }
            })
            // 정기지급대상자 영역 - 정기지급대상자 선택 변경시
            $("#fxtmDsbTrgpTypeCd").on("change", function () {
                let isServed = $(this).val() === "10"; //재직상태 눌렀을 경우
                let isSpecificPerson = $(this).val() === "20"; //특정인 등록 눌렀을 경우

                if(isServed) {
                    $("#servedCheckboxWrap").css("display", "block");
                    $("#regularTargetsWrap").css("display", "none");
                    $("#specificSpanWrap").css("display", "none");
                    $("#servedSpanWrap").css("display", "block");
                    $("#targetsRegistWrap").css("display", "none");
                } else if(isSpecificPerson) {
                    $("#regularTargetsWrap").css("display", "block");
                    $("#specificSpanWrap").css("display", "block");
                    $("#servedCheckboxWrap").css("display", "none");
                    $("#servedSpanWrap").css("display", "none");
                    $("#targetsRegistWrap").css("display", "");
                } else {
                    $("#servedCheckboxWrap").css("display", "none");
                    $("#specificSpanWrap").css("display", "none");
                    $("#servedSpanWrap").css("display", "none");
                    $("#regularTargetsWrap").css("display", "none");
                    $("#targetsRegistWrap").css("display", "none");
                }

            })
            // 유효기간 영역 (복지카드만) - 개월,특정일 선택 변경시
            $("#fxtmDsbVlPridDvCd").on("change", function () {
                let isMonth = $(this).val() === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH;
                $("#periodMonth").css("display", (isMonth ? "flex" : "none")); // 개월 영역 토글
                $("input[name=pntVlDt]").val("");                         // 입력 값 초기화
            })

            // 대상자 등록 방식 영역 - 개별/일괄등록 선택 변경시
            $("input:radio[name=dsbTrtvlTrgpRegDvCd]").on("change", function () {
                let isEach = $(this).val() === ConstCode.CODES_TRANS.TRANS_TARGET_TYPE.EACH;
                $(".eachRegistBtn").css("display", (isEach ? "inline-block" : "none"));  // 대상자 등록 버튼 토글
                $(".batchRegistBtn").css("display", (isEach ? "none" : "inline-block")); // 대상자 일괄등록 버튼 토글
                $(".eachRegistAmt").css("display", (isEach ? "block" : "none"));            // 지급 금액 영역 토글
                if( isEach ) {
                    if(!Util.isEmpty($("#applyAmount").text())) {
                        _this.isAmountApply = true;  // 개별등록인 경우, 적용금액 값이 있는 경우, 금액 적용 flag true
                    }
                } else {
                    _this.isAmountApply = false;                                // 일괄등록인 경우, 금액 적용 flag false
                }
                _this.methods.setEmpInfoListByRegularTrans([]);                                  // 등록 대상자 리스트 초기화
            });

            //Execution date area -When Date Selection Changes
            function populateExcuTiOptions(selectedDay) {
                const isFirstDay = parseInt(selectedDay, 10) === 1;
                const hiddenTimes = ['08:00', '08:30', '09:00', '09:30', '10:00'];
                let options = "";

                for (let i = 0; i < 24; i++) {
                    // :00 option (skip 00:00)
                    if (i > 0) {
                        const time00 = (i < 10 ? '0' + i + ':00' : i + ':00');
                        if (!(isFirstDay && hiddenTimes.includes(time00))) {
                            options += '<option value="' + time00.replace(':', '') + '">' + time00 + '</option>';
                        }
                    }

                    // :30 option
                    const time30 = (i < 10 ? '0' + i + ':30' : i + ':30');
                    if (!(isFirstDay && hiddenTimes.includes(time30))) {
                        options += '<option value="' + time30.replace(':', '') + '">' + time30 + '</option>';
                    }
                }

                $("#excuTi").html(options);
            }

            // Bind event to day dropdown
            $("#fxtmDsbExcuDd").on("change", function () {
                populateExcuTiOptions($(this).val());
            });

            // Initialize on page load
            populateExcuTiOptions($("#fxtmDsbExcuDd").val());



            // 카드캐시/잔액명 영역 - 선택 변경시
            // $("#crdCashWithBalaId").on("change", function () {
            //     $("#fxtmDsbTypeCd").html('<option value="">선택해 주세요.</option>');
            //     const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");
            //     if(depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH) {
            //         $("#fxtmDsbTypeCd").append( '<option value="10">카드캐시 지급</option>' );
            //
            //         $(".periodWrap").css("display", "table-cell");      // 유효기간 영역 노출
            //         $("#periodMonth").css("display", "table-cell");
            //         $(".periodBorder").css("display", "none");
            //         $("#apExpsMsgCn").attr("disabled", false);          // 앱 노출문구 활성화
            //     } else {
            //         $("#fxtmDsbTypeCd").append( '<option value="20">잔액 충전</option>' );
            //
            //         $(".periodWrap").css("display", "none");                        // 복지카드 유효기간 영역 숨김
            //         $("#periodMonth").css("display", "none");                       // 복지카드 유효기간 개월 숨김
            //         $(".periodBorder").css("display", "table-cell");
            //         $("#apExpsMsgCn").attr("disabled", true);                       // 앱 노출문구 disabled 토글
            //     }
            //     $("#fxtmDsbVlPridDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 복지카드 유효기간 타입 값 초기화
            //     $("#periodMonth").css("display", "flex");                           // 복지카드 유효기간 개월 영역 노출
            //     $("input[name=pntVlDt]").val("");                                   // 복지카드 유효기간 값 초기화
            //     $("#apExpsMsgCn").val("");                                          // 앱 노출문구 초기화
            // });

            window.onresize = function() {
                if( $(".table-body").length ) {
                    Util.setReportHeight( $(".table-body")[0] );
                }
            }
        }
    },
    methods: {
        /**
         * 기업 상품 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetProductList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                useYn: "Y"                        // 사용중 여부 (사용중인 카드만 조회)
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/common/doGetProductList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<option value="" _wptlPrdTypeCd="" _crdPntUsePsblYn="" _balaUsePsblYn="">선택해 주세요.</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++) {
                    if (!(entity[i].wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER && entity[i].crdPntUsePsblYn !== "Y")) {
                        html += '<option value="' + entity[i].wptlPrdNo + '" _wptlPrdTypeCd="' + entity[i].wptlPrdTypeCd + '" _prdId="' + entity[i].prdId + '" _crdPntUsePsblYn="' + entity[i].crdPntUsePsblYn + '" _balaUsePsblYn="' + entity[i].balaUsePsblYn + '">' + entity[i].prdNm + '</option>';
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
            $("#wptlPrdNo").html(html);
        },
        /**
         * 카드 캐시/잔액명 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetCashBalaDepositList: async function (dsbRtrvTypeCd) {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                wptlPrdNo: $("#wptlPrdNo").val()  // 상품 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/common/doGetCashBalaDepositList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            let html = '<option value="">등록할 카드포인트/잔액을 선택해 주세요.</option>';
            if (code === 1) {
                for (let i = 0; i < entity.length; i++) {
                    if( dsbRtrvTypeCd === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA ) {
                        if (entity[i].depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER && entity[i].wptlPrdTypeCd !== ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER) {
                            html += '<option value="' + entity[i].rcgId + '" _depositType="' + entity[i].depositType + '" >' + entity[i].balaNm + '</option>';
                        }
                    } else if( dsbRtrvTypeCd === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH ) {
                        if (entity[i].depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH) {
                            html += '<option value="' + entity[i].crdCashId + '" _depositType="' + entity[i].depositType + '">' + entity[i].crdCashNm + '</option>';
                        }
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
            $("#crdCashWithBalaId").html(html);
        },
        /**
         * 정기지급 대상자 modal 열기
         * @param modalType (개별: list, 일괄: excel)
         */
        openEmpModal: async function (modalType = "list") {
            const wptlPrdNo = $("#wptlPrdNo").val();
            if (Util.isEmpty(wptlPrdNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "상품명을 선택해 주세요.");
                return;
            }

            if (modalType === "excel") {
                _this.modalType = "excel";

                const params = {
                    wptlEntpNo: KSM.targetWptlEntpNo,
                    wptlPrdNo: $("#wptlPrdNo").val(),
                    searchTransTargetAllYn: "Y"
                }
                // console.log(params);
                const res = await ServiceExec.post('/api/trans/doGetTransTargetSearchListCount', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;

                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    if(entity < 1) {
                        alert("배정대상자 목록이 없습니다.");
                        return;
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
            } else {
                _this.modalType = "list";
            }
            //Force cleanup before opening any modal type
            await _this.methods.forceCleanupModal();
            // 정기지급 대상자 modal 열기 (js/modal/emp.js)
            EMP.methods.openEmpModal("regularTrans", modalType);
        },
        /**
         * 정기지급 대상자 엑셀 다운로드(업로드 양식)
         * @returns {Promise<void>}
         */
        doDownTransTargetExcel: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,
                wptlPrdNo: $("#wptlPrdNo").val(),
                searchTransTargetAllYn: "Y"
            }
            params.limit = -1;
            DOWNLOAD_MODAL.methods.download('/api/trans/doDownTransTargetExcel', params);
            return;
        },
        /**
         * 정기지급 대상자 리스트 가공
         * @param entity (정기지급 대상자 리스트)
         * @param modalType (정기지급 대상 선택: list, 정기지급 엑셀: excel)
         * @returns {Promise<void>}
         */
        setEmpInfoListByRegularTrans: async function (entity, modalType = "list") {
            _this.transTargetEmpList = entity;
            let isEach = modalType === "list";
            // let dsbTrtvlTrgpRegDvNm = isEach ? "개별 등록" : "일괄 등록";
            let transTotalAmount = "0 원";
            // 개별 등록인 경우

            if (isEach) {
                let dsbAmt = _this.isAmountApply ? $("#dsbAmt").val().trim() : "";

                if (!Util.isEmpty(dsbAmt)) {
                    // if (dsbAmt === "전체 잔액") {
                    //     transTotalAmount = "전체 잔액";
                    // } else {
                    let amount = dsbAmt.replaceAll(",", "");
                    transTotalAmount = Util.numberFormat(_this.transTargetEmpList.length * Number(amount)) + " 원";
                    // }
                }
                _this.transTargetEmpList.map(item => {
                    // item.dsbTrtvlTrgpRegDvNm = dsbTrtvlTrgpRegDvNm;
                    item.dsbAmtNm = !Util.isEmpty(dsbAmt)
                                          ? (dsbAmt)
                                          : "";
                    item.dsbAmt = !Util.isEmpty(dsbAmt)
                                        ? (Number(dsbAmt.replaceAll(",", "")))
                                        : "";
                    if( _this.transUnmaskYn === "Y" ) {
                        item.stfNm = item.unmaskStfNm;
                        item.cdno = item.unmaskCdno;
                    } else {
                        item.stfNm = item.maskStfNm;
                        item.cdno = item.maskCdno;
                    }
                    return item;
                })
            }
            // 일괄 등록인 경우
            else {
                let totalAmount = 0;
                _this.transTargetEmpList.map(item => {
                    if (!Util.isEmpty(item.dsbAmt))
                        totalAmount += Number(item.dsbAmt.replaceAll(",", ""));

                    item.dsbAmtNm = Util.numberFormat(item.dsbAmt);
                    item.dsbAmt = !Util.isEmpty(item.dsbAmt)
                        ? (Number(item.dsbAmt.replaceAll(",", "")))
                        : "";
                    if( _this.transUnmaskYn === "Y" ) {
                        item.stfNm = item.unmaskStfNm;
                        item.cdno = item.unmaskCdno;
                    } else {
                        item.stfNm = item.maskStfNm;
                        item.cdno = item.maskCdno;
                    }
                    return item;
                })

                transTotalAmount = Util.numberFormat(totalAmount) + " 원";
            }
            $("#targetEmpCount").text(_this.transTargetEmpList.length);

            // 정기지급 대상자 - 내용 페이지 호출
            const params = {
                path: "regularTrans/form_target",
                htmlData: {
                    empList: _this.transTargetEmpList,
                    transTotalAmount: transTotalAmount,
                    unmaskYn: _this.transUnmaskYn
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".table-content").html(html);
            Util.setReportHeight( $(".table-body")[0] );
        },
        /**
         * 정기지급 대상자 개별 삭제
         */
        removeTransTarget: async function( rowIdx ) {
            if (!confirm("선택된 대상자를 삭제하시겠습니까?")) return;
            _this.transTargetEmpList.splice(rowIdx, 1);
            await _this.methods.setEmpInfoListByRegularTrans( _this.transTargetEmpList );
        },
        doAuthConfirmByRegularTrans: async function () {
            await _this.methods.doRegistTrans();
        },
        doConfirmTransTargetExcel: function() {
            if (Util.isEmpty(_this.trgpFileNm) && Util.isEmpty(_this.trgpFilePthNm)) {
                $("#empModal").modal({show: false}).remove();
                return;
            }
            if (!confirm("정기지급 대상자 정보를 등록 하시겠습니까?")) return;
            setTimeout(() => {
                alert("정기지급 대상자 정보를 등록 하였습니다.");
                _this.methods.setEmpInfoListByRegularTrans(_this.transTargetEmpList, 'excel');
                $("#empModal").modal({show: false}).remove();
            }, 300)
        },
        doRegistTransTargetExcel: async function (el) {
            _this.transTargetEmpList = [];
            _this.trgpFileNm = "";
            _this.trgpFilePthNm = "";

            const props = {
                fileInput: el,
                uploadUrl: "/api/regular/trans/doRegistTransTargetExcel",
                columnTitles: ["대상자명", "사원번호", "부서", "카드번호", "카드 상태", "배정금액"],
                setColumns: function (line) {
                    line.stfNm = Util.trim(line["대상자명"]);
                    line.incmpEmpNo = Util.trim(line["사원번호"]);
                    line.deptNm = Util.trim(line["부서"]);
                    line.cdno = Util.trim(line["카드번호"]);
                    line.dsbAmt = line["배정금액"];
                    line.wptlPrdNo = $("#wptlPrdNo").val();
                    line.wptlEntpNo = KSM.targetWptlEntpNo;
                    if( Util.isEmpty(line.incmpEmpNo) && Util.isEmpty(line.stfNm) && Util.isEmpty(line.cdno) && Util.isEmpty(line.dsbAmt) ) {
                        return null;
                    } else {
                        return line;
                    }
                },
                setUploadList: function(entity) {
                    _this.transTargetEmpList.push(...entity.transTargetEmpList);
                },
                setComplete: function(result) {
                    _this.trgpFileNm = result.fileBean.originalFileName;
                    _this.trgpFilePthNm = result.fileBean.fileUrlPath;
                }
            }
            await FILE.methods.fileUpload(props);
        },
        /**
         * 정기지급 등록
         * @returns {Promise<void>}
         */
        doRegistTrans: async function () {
            if(!AUTH.isSendAuth) {
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

            let wptlPrdNo = $("#wptlPrdNo").val();
            const params = {
                authToken: AUTH.authToken,
                authCode: $("#authCode").val().trim(),                                                     // 인증 코드
                wlpoEntpNo: KSM.targetWptlEntpNo,                                        // 기업 시퀀스
                regWptlUserNo: KSM.targetWptlUserNo,                                     // 회원 시퀀스
                wlpoPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "",            // 상품 시퀀스
                svcId: $("#wptlPrdNo option:selected").attr("_prdId"),                   // 상품 ID
                wlpoPrdTypeCd: $("#wptlPrdNo option:selected").attr("_wptlPrdTypeCd"),   // 상품 타입
                fxtmDsbTypeCd: $("#fxtmDsbTypeCd option:selected").attr("_dsbrtrvltype"),                                  // 지급 분류
                dsbRsnCn: $("#dsbRsnCn").val().trim(),                         // 지급 사유
                fxtmDsbExcuDd: $("#fxtmDsbExcuDd option:selected").val(),               // 실행 일시(일자)
                excuTi: String($("#excuTi option:selected").val()),               // 실행 일시(시분초)
                strtDttm: $("#strtDttm").val(),               // 정기지급기간
                endDttm: $("#endDttm").val(),               // 정기지급기간
                crdPntPlcyId: "",                                                           // 카드캐시 ID
                crdCashWithBalaId: $("#crdCashWithBalaId option:selected").val(),
                rcId: "",                                                               // 예치금 계좌 ID
                fxtmDsbVlPridDvCd: "",                                                      // 유효기간 타입
                pntVlDt: "",                                                        // 유효기간 값
                apExpsMsgCn: $("#apExpsMsgCn").val().trim(),                             // APP 노출 문구
                dsbAmt: Number($("#dsbAmt").val().replaceAll(",", "").trim()),                             // 지급 금액
                transTargetEmpList: _this.transTargetEmpList,                            // 등록 대상자 리스트
                trgpFileNm: "",                                                  // 등록 대상자 파일이름 (일괄 등록시)
                trgpFilePthNm: "",                                                // 등록 대상자 파일경로 이름 (일괄 등록시)
                fxtmDsbTrgpTypeCd: $("#fxtmDsbTrgpTypeCd option:selected").val(),   //정기지급 대상자 유형코드
                fxtmPymanStTypeCd: "",   //정기지급 대상자 재직상태코드
                fxtmDsbTrgpRegTypeCd: $("input[name=dsbTrtvlTrgpRegDvCd]:checked").val() // 대상자 등록 방식
            }
            const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");

            if (depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER) {
                params.rcId = params.crdCashWithBalaId;
                // params.fxtmDsbTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA;
            } else {
                params.crdPntPlcyId = params.crdCashWithBalaId;
                let fxtmDsbVlPridDvCd = $("#fxtmDsbVlPridDvCd").val();
                params.fxtmDsbVlPridDvCd = fxtmDsbVlPridDvCd;
                if (fxtmDsbVlPridDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH) {
                    params.pntVlDt = $("#periodMonth input[name=pntVlDt]").val().trim();
                }
                // params.fxtmDsbTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH;
            }

            // TODO: 정기지급대상자 '재직상태'로 선택했을 경우
            if(params.fxtmDsbTrgpTypeCd === '10') {
                let servedStatusArray = [];
                $("input[type=checkbox]").each( function(idx, item) {
                    if( $(this).is(":checked") ) {
                        servedStatusArray.push($(item).val());
                    }
                });

                params.fxtmPymanStTypeCd = servedStatusArray.join(',').trim();
            }

            if (!_this.methods.updateCardValid(params)) return;

            if(_this.modalType === 'excel') {
                params.dsbAmt = params.transTargetEmpList[0].dsbAmt;
            }

           if (!confirm("정기지급 정보를 등록하시겠습니까?")) return;

            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/regular/trans/doRegistRegularTrans', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("정기지급 정보를 등록하였습니다.");
                Util.replace("/regular/trans/list");
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
                        break;
                }
            }
        },
        /**
         * 정기지급 등록 유효성 체크
         * @param params
         * @returns {boolean}
         */
        updateCardValid: function (params) {
            _this.validEl.html("");
            if (Util.isEmpty(params.wlpoPrdNo) || Util.isEmpty(params.svcId) || Util.isEmpty(params.wlpoPrdTypeCd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "상품명을 선택해 주세요.");
                return false;
            }

            if(Util.isEmpty(params.fxtmDsbTypeCd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "지급 분류를 선택해 주세요.");
                return false;
            }

            if (Util.isEmpty(params.dsbRsnCn)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "지급 사유를 입력해 주세요.");
                return false;
            }

            if (Util.isEmpty(params.crdCashWithBalaId)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "카드포인트/잔액명을 선택해 주세요.");
                return false;
            }

            if(params.fxtmDsbTypeCd === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH) {
                if(params.fxtmDsbVlPridDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH && Util.isEmpty(params.pntVlDt)) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "유효기간을 입력해 주세요.");
                    return false;
                }
            }

            if (_this.modalType !== 'excel' && ( params.dsbAmt == 0 || !_this.isAmountApply )) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "지급 금액을 입력해 주세요.");
                return false;
            }

            if (_this.isAmountApply && params.dsbAmt <= 0) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "지급 금액을 잘못 입력하였습니다.");
                return false;
            }

            if (Util.isEmpty(params.fxtmDsbExcuDd.trim())) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "지급 실행 일시를 입력해 주세요.");
                return false;
            }

            if (Util.isEmpty(params.strtDttm) || Util.isEmpty(params.endDttm)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "정기 지급 기간을 입력해 주세요.");
                return false;
            }

            let StartDate = moment(params.strtDttm).format('YYYY/MM/DD');
            let EndDate = moment(params.endDttm).format('YYYY/MM/DD');

            if(!Util.checkOverSearchDateLimit(StartDate,EndDate, 1, 'year')) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "정기 지급 기간이 1년을 초과하였습니다. 다시 확인해 주세요.\n");
                return false;
            }

            if (Util.isEmpty(params.fxtmDsbTrgpTypeCd)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "정기지급 대상자를 선택해 주세요.");
                return false;
            }

            if (params.fxtmDsbTrgpTypeCd !== ConstCode.CODES_TRANS.FXTM_DSB_TARGET_TYPE.EMP_STATUS && Util.isEmpty(params.transTargetEmpList)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "정기지급 대상자를 등록해 주세요.");
                return false;
            }

            if(params.fxtmDsbTrgpTypeCd === ConstCode.CODES_TRANS.FXTM_DSB_TARGET_TYPE.EMP_STATUS) {
                let servedStatusValid = false;
                $("input[type=checkbox]").each( function(idx, item) {
                    if( $(this).is(":checked") ) {
                        servedStatusValid = true;
                    }
                });
                if(!servedStatusValid) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "재직상태를 선택해 주세요.");
                    return false;
                }
            }

            return true;
        },
        /**
         * 휴대폰 인증번호 발송
         * @returns {Promise<void>}
         */
        doTransSendAuthCode: async function (modal) {
            let wptlPrdNo = $("#wptlPrdNo").val();

            const params = {
                wlpoEntpNo: KSM.targetWptlEntpNo,                                        // 기업 시퀀스
                regWptlUserNo: KSM.targetWptlUserNo,                                     // 회원 시퀀스
                wlpoPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "",            // 상품 시퀀스
                svcId: $("#wptlPrdNo option:selected").attr("_prdId"),                   // 상품 ID
                wlpoPrdTypeCd: $("#wptlPrdNo option:selected").attr("_wptlPrdTypeCd"),   // 상품 타입
                fxtmDsbTypeCd: $("#fxtmDsbTypeCd option:selected").attr("_dsbrtrvltype"),                                  // 지급 분류
                dsbRsnCn: $("#dsbRsnCn").val().trim(),                         // 지급 사유
                fxtmDsbExcuDd: $("#fxtmDsbExcuDd option:selected").val(),               // 실행 일시(일자)
                excuTi: String($("#excuTi option:selected").val()),               // 실행 일시(시분초)
                strtDttm: $("#strtDttm").val(),               // 정기지급기간
                endDttm: $("#endDttm").val(),               // 정기지급기간
                crdCashWithBalaId: $("#crdCashWithBalaId option:selected").val(),
                crdPntPlcyId: "",                                                           // 카드캐시 ID
                rcId: "",                                                               // 예치금 계좌 ID
                fxtmDsbVlPridDvCd: "",                                                      // 유효기간 타입
                pntVlDt: "",                                                        // 유효기간 값
                apExpsMsgCn: $("#apExpsMsgCn").val().trim(),                             // APP 노출 문구
                dsbAmt: Number($("#dsbAmt").val().replaceAll(",", "").trim()),                             // 지급 금액
                transTargetEmpList: _this.transTargetEmpList,                            // 등록 대상자 리스트
                trgpFileNm: "",                                                  // 등록 대상자 파일이름 (일괄 등록시)
                trgpFilePthNm: "",                                                // 등록 대상자 파일경로 이름 (일괄 등록시)
                fxtmDsbTrgpTypeCd: $("#fxtmDsbTrgpTypeCd option:selected").val(),   // 정기지급 대상자 유형코드
                fxtmPymanStTypeCd: "" ,  //정기지급 대상자 재직상태코드
                fxtmDsbTrgpRegTypeCd: $("input[name=dsbTrtvlTrgpRegDvCd]:checked").val() // 대상자 등록 방식
            }

            const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");

            if (depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER) {
                params.rcId = params.crdCashWithBalaId;
                // params.fxtmDsbTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA;
            } else {
                params.crdPntPlcyId = params.crdCashWithBalaId;
                let fxtmDsbVlPridDvCd = $("#fxtmDsbVlPridDvCd").val();
                params.fxtmDsbVlPridDvCd = fxtmDsbVlPridDvCd;
                if (fxtmDsbVlPridDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH) {
                    params.pntVlDt = $("#periodMonth input[name=pntVlDt]").val().trim();
                }
                // params.fxtmDsbTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH;
            }

            console.log('params: ', params);
            if (!_this.methods.updateCardValid(params)) return;

            if(!modal) {
                if (!confirm("정기지급 정보를 등록하시겠습니까?")) return;
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
        /* ---------------------------------------- 지급/회수 인증 modal start ---------------------------------------- */
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
        unmaskingPage: function (pageType = "trans") {
            if( pageType === "trans" ) {
                _this.transUnmaskYn = "Y";
                if ($("#rcgId").length) {
                    $("#rcgId option").each(function (idx, item) {
                        if( idx > 0 ) {
                            $(item).text($(item).data("bankNm") + " " + $(item).data("vtlAcno"));
                        }
                    });
                }
                _this.methods.setEmpInfoListByRegularTrans(_this.transTargetEmpList);
            } else if( pageType === "transAuth" ) {
                _this.transAuthUnmaskYn = "Y";
                $("#transAutheModal .masking-input").each( function(idx, item) {
                    $(item).val( $(item).data("realValue") );
                });
            }
        },
        /**
         * Force cleanup any existing modal before opening a new one
         */
        forceCleanupModal: async function() {
            const $existingModal = $("#empModal");

            if ($existingModal.length) {
                // Remove all modal event listeners
                $existingModal.off('.bs.modal');

                // If modal is visible, hide it properly
                if ($existingModal.hasClass('show') || $existingModal.css('display') === 'block') {
                    $existingModal.modal('hide');

                    // Wait for hide animation
                    await new Promise(resolve => {
                        const checkHidden = setInterval(() => {
                            if (!$existingModal.hasClass('show')) {
                                clearInterval(checkHidden);
                                resolve();
                            }
                        }, 50);

                        // Timeout after 500ms
                        setTimeout(() => {
                            clearInterval(checkHidden);
                            resolve();
                        }, 500);
                    });
                }

                // Force remove modal
                $existingModal.remove();
            }

            // Clean up all modal artifacts
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding-right', '');

            // Small delay to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker("specific", 2);
        _this.methods.doGetProductList();
    }
}

window.FH = FH;
FH.init();
