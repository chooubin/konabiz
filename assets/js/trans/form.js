import "/js/common/Toast.js?version=2025052101";
import "/js/modal/emp.js?version=2025100802";
import "/js/common/Auth.js?version=2025010801";

// 지급/회수 등록 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: $("#transValid"),
    wptlPrdTypeCd: "",
    woBalaRtrvlDvCd: ConstCode.CODES_TRANS.TRANS_AMOUNT_TYPE.EACH, // 금액, 전체잔액 여부
    isAmountApply: false,                                          // 금액 적용 여부  
    isEach: true,
    transTargetEmpList: [],
    dsbRtrvlTrgpFileNm: "",                                        // 일괄등록 엑셀 파일 이름
    dsbRtrvlTrgpFilePthNm: "",                                     // 일괄등록 엑셀 파일 경로
    transUnmaskYn: "N",
    transAuthUnmaskYn: "N",
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
            // 지급/회수 금액 영역 - 금액 버튼들 클릭시
            $("button[name=applyAmountBtn]").on("click", function () {
                $("#dsbRtrvlAmt").val($(this).attr("_amount")); // 금액 input에 값 바인딩
                _this.methods.removeErrorHighlight("#dsbRtrvlAmt");
            })
            // 지급/회수 금액 영역 - 적용 클릭시
            $("#addApply").on("click", function () {
                let amount = $("#dsbRtrvlAmt").val().trim();
                if (Util.isEmpty(amount)) return;
                if (amount <= 0) {
                    Util.validCheck(_this.scrollWrap, _this.validEl, "지급/회수 금액 항목에 1 이상의 숫자를 입력해 주세요.");
                    _this.methods.highlightError("#dsbRtrvlAmt");
                    return;
                }
                _this.validEl.text("");
                // 전체 잔액 적용시
                if (amount === "전체 잔액") {
                    $("#applyAmount").text("전체 잔액");
                    // 지급/회수 금액 타입 - "전체" 코드로 변경
                    _this.woBalaRtrvlDvCd = ConstCode.CODES_TRANS.TRANS_AMOUNT_TYPE.ALL;
                }
                // 금액 적용시
                else {
                    amount = Util.numberFormat(amount) + " 원";
                    $("#applyAmount").text(amount);
                    // 지급/회수 금액 타입 - "금액" 코드로 변경
                    _this.woBalaRtrvlDvCd = ConstCode.CODES_TRANS.TRANS_AMOUNT_TYPE.EACH;
                }
                _this.isAmountApply = true;                  // 금액 적용 flag true
                $("#applyWrap").css("display", "table-row"); // 금액 적용 영역 보임
                $(".applyEl").prop("disabled", true);        // 금액 버튼 비활성화
                $(".applyEl").removeClass("hover");
                if (!Util.isEmpty(_this.transTargetEmpList)) // 등록 대상자 리스트 금액 적용 (금액 추가)
                    _this.methods.setEmpInfoList(_this.transTargetEmpList);
            })
            // 지급/회수 금액 영역 - 삭제 클릭시
            $("#deleteApply").on("click", function () {
                _this.isAmountApply = false;                 // 금액 적용 flag false
                $("#applyWrap").css("display", "none");      // 금액 적용 영역 숨김
                $(".applyEl").prop("disabled", false);       // 금액 버튼 활성화
                $(".applyEl").addClass("hover");
                if (!Util.isEmpty(_this.transTargetEmpList)) // 등록 대상자 리스트 금액 적용 (금액 빠짐)
                    _this.methods.setEmpInfoList(_this.transTargetEmpList);
            })
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            $("#executionDate").on("change", function () {
                const selectedValue = $(this).val();
                console.log('selectedValue',selectedValue)
               if (selectedValue === "30") {
                   $("#dateTimeWrapper").hide(); // sets display: none
               } else {
                   $("#dateTimeWrapper").css("display", "flex");
               }
            });
            // 상품명 영역 - 상품 선택 변경시
            $("#wptlPrdNo").on("change", function () {
                $("#cashWithBalaWrap").css("display", "none");
                _this.wptlPrdTypeCd = $("option:selected", this).attr("_wptlPrdTypeCd");
                if (Util.isEmpty(_this.wptlPrdTypeCd)) { // 상품명 "전체"
                    $("#dsbRtrvlDvCd").html('<option value="">선택해 주세요.</option>');
                    $("#wlCrdDsbVlDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);    // 복지 카드 유효기간 영역 값 초기화
                    $("#periodMonth").css("display", "flex");
                    $("#periodFixed").css("display", "none");
                    $("input[name=wlCrdDsbVlDt]").val("");
                    $(".periodWrap").css("display", "none");                           // 복지카드 유효기간 영역 노츨
                    $("#periodMonth").css("display", "none");                          // 복지카드 유효기간 개월 영역 노출
                    return false;
                }
                
                const crdPntUsePsblYn = $("option:selected", this).attr("_crdPntUsePsblYn");
                const balaUsePsblYn = $("option:selected", this).attr("_balaUsePsblYn");

                $("#dsbRtrvlDvCd").html('<option value="">선택해 주세요.</option>');

                if( crdPntUsePsblYn === "Y" ) {
                    $("#dsbRtrvlDvCd").append( '<option value="10" _dsbRtrvlType="10">카드포인트 지급</option>' +
                                               '<option value="20" _dsbRtrvlType="10">카드포인트 회수</option>' );
                }
                if( balaUsePsblYn === "Y" && _this.wptlPrdTypeCd !== ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER ) {
                    $("#dsbRtrvlDvCd").append( '<option value="10" _dsbRtrvlType="20">잔액 충전</option>' +
                                               '<option value="20" _dsbRtrvlType="20">잔액 회수</option>' );
                }

                $(".periodWrap").css("display", "none");                        // 복지카드 유효기간 영역 노츨
                $("#periodMonth").css("display", "none");                                 // 복지카드 유효기간 개월 영역 노출
                $(".periodBorder").css("display", "table-cell");
                $("#apExpsPhrCn").attr("disabled", true);                          // 앱 노출문구 disabled 토글

                $("#wlCrdDsbVlDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 복지카드 유효기간 타입 값 초기화
                $("#periodMonth").css("display", "flex");                                 // 복지카드 유효기간 개월 영역 노출
                $("#periodFixed").css("display", "none");                                 // 복지카드 유효기간 특정일 영역 숨김
                $("input[name=wlCrdDsbVlDt]").val("");                                    // 복지카드 유효기간 값 초기화
                $("#apExpsPhrCn").val("");                                                // 앱 노출문구 초기화

                _this.methods.setEmpInfoList([]);                                   // 등록 대상자 리스트 초기화
            })
            // 지급/회수 분류 영역 - 지급/회수 선택 변경시
            $("#dsbRtrvlDvCd").on("change", function () {
                let isTake = $(this).val() === ConstCode.CODES_TRANS.TRANS_TYPE.TAKE;
                $("#totalRemainAmount").css("display",(isTake ? "inline-block" : "none"));  // 회수인 경우 "전체 잔액" 버튼 노출

                const dsbRtrvlType = $("#dsbRtrvlDvCd option:selected").attr("_dsbRtrvlType");
                if( Util.isEmpty($(this).val()) ) {
                    $("#cashWithBalaWrap").css("display", "none");
                    $("input[name=wlCrdDsbVlDt]").val("");
                    $("#crdCashWithBalaId").html( '<option value="">등록할 카드포인트/잔액을 선택해 주세요.</option>' );
                    $("#wlCrdDsbVlDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 복지카드 유효기간 타입 값 초기화
                    $("#periodMonth").css("display", "flex");                                 // 복지카드 유효기간 개월 영역 노출
                    $("#periodFixed").css("display", "none");                                 // 복지카드 유효기간 특정일 영역 숨김
                    $("input[name=wlCrdDsbVlDt]").val("");                                    // 복지카드 유효기간 값 초기화
                    return;
                } else {
                    _this.methods.doGetCashBalaDepositList(dsbRtrvlType);                          // 캐시/잔액명 리스트 조회
                    $("#cashWithBalaWrap").css("display", "table-row");
                }
                if(dsbRtrvlType === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH) {
                    $("#apExpsPhrCn").attr("disabled", false);                          // 앱 노출문구 disabled 토글
                } else {
                    $("#apExpsPhrCn").attr("disabled", true);                          // 앱 노출문구 disabled 토글
                    $("#apExpsPhrCn").val("");
                }

                if(isTake || dsbRtrvlType === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA) {
                    $(".periodWrap").css("display",  "none" );   // 유효기간 영역 비노츨
                    $(".periodBorder").css("display",  "table-cell" );
                    $("#wlCrdDsbVlDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 복지카드 유효기간 타입 값 초기화
                    $("#periodMonth").css("display", "flex");                                 // 복지카드 유효기간 개월 영역 노출
                    $("#periodFixed").css("display", "none");                                 // 복지카드 유효기간 특정일 영역 숨김
                    $("input[name=wlCrdDsbVlDt]").val("");                                    // 복지카드 유효기간 값 초기화
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
                            _this.methods.setEmpInfoList(_this.transTargetEmpList);
                    }
                }
            })
            // 실행일시 영역 - 날짜 선택 변경시
            $("#dedDt").on("change", function () {
                const currentDate = new Date();
                const dedDate = new Date($(this).val());
                const isToday = currentDate.getFullYear() === dedDate.getFullYear() && currentDate.getMonth() === dedDate.getMonth() && currentDate.getDate() === dedDate.getDate();
                const hour = currentDate.getHours()
                const minute = currentDate.getMinutes();
                const isFirstDay = dedDate.getDate() === 1;
                const hiddenTimes = ['08:00', '08:30', '09:00', '09:30', '10:00'];//for first day of each month.
                let options = "";
                for (let i = 0; i < 24; i++) {
                    if (isToday) {
                        if (i < hour) continue;
                        if (i === hour) {
                            if (minute < 30) {
                                let timeStr = (i < 10 ? '0' + i + ':30' : i + ':30');

                                // Skip if disallowed on 1st day
                                if (isFirstDay && hiddenTimes.includes(timeStr)) continue;

                                options += '<option value="' + timeStr + '">' + timeStr + '</option>';
                            }
                            continue;
                        }
                    }

                    if (i > 0) {
                        let time00 = (i < 10 ? '0' + i + ':00' : i + ':00');
                        if (!(isFirstDay && hiddenTimes.includes(time00))) {
                            options += '<option value="' + time00 + '">' + time00 + '</option>';
                        }
                    }

                    let time30 = (i < 10 ? '0' + i + ':30' : i + ':30');
                    if (!(isFirstDay && hiddenTimes.includes(time30))) {
                        options += '<option value="' + time30 + '">' + time30 + '</option>';
                    }
                }
                _this.methods.removeErrorHighlight("#dedTm");
                $("#dedTm").html(options);
            })
            // 유효기간 영역 (복지카드만) - 개월,특정일 선택 변경시
            $("#wlCrdDsbVlDvCd").on("change", function () {
                let isMonth = $(this).val() === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH;
                $("#periodMonth").css("display", (isMonth ? "flex" : "none")); // 개월 영역 토글
                $("#periodFixed").css("display", (isMonth ? "none" : "flex")); // 특정일 영역 토글
                $("input[name=wlCrdDsbVlDt]").val("");                         // 입력 값 초기화
            })
            // 대상자 등록 방식 영역 - 개별/일괄등록 선택 변경시
            $("input:radio[name=dsbTrtvlTrgpRegDvCd]").on("change", function () {
                let isEach = $(this).val() === ConstCode.CODES_TRANS.TRANS_TARGET_TYPE.EACH;
                _this.isEach = isEach;
                $(".eachRegist").css("display", (isEach ? "block" : "none"));            // 지급/회수 금액 영역 토글
                $(".eachRegistBtn").css("display", (isEach ? "inline-block" : "none"));  // 대상자 등록 버튼 토글
                $(".batchRegistBtn").css("display", (isEach ? "none" : "inline-block")); // 대상자 일괄등록 버튼 토글
                if (!isEach) _this.isAmountApply = false;                                // 일괄등록인 경우, 금액 적용 flag false
                _this.methods.setEmpInfoList([]);                                  // 등록 대상자 리스트 초기화
            });

            $(document).on("input", ".dsbRtrvlAmtInp", function () {
                Util.inputNumberFormat(this);
                let totTransAmt = 0;
                $(".dsbRtrvlAmtInp").each(function () {
                    totTransAmt += parseInt($(this).val().replace(/,/g, '')) || 0;
                });
                document.getElementById("transTotalAmountEl").innerText = `${totTransAmt.toLocaleString()} 원`;
                _this.transTargetEmpList.map(item => {
                    let dsbRtrvlAmt = Util.numberOnly($("#" +  item.unmaskCdno).val());
                    item.dsbRtrvlAmtNm = !Util.isEmpty(dsbRtrvlAmt)
                        ?  Util.numberFormat(dsbRtrvlAmt)
                        : "";
                    item.dsbRtrvlAmt = !Util.isEmpty(dsbRtrvlAmt)
                        ? Number(dsbRtrvlAmt.replaceAll(",", ""))
                        : "";
                })
            });

            // 카드캐시/잔액명 영역 - 선택 변경시
            // $("#crdCashWithBalaId").on("change", function () {
            //     const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");
            //     if(depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.CASH) {
            //         $(".periodWrap").css("display", "table-cell");      // 유효기간 영역 노출
            //         $("#periodMonth").css("display", "table-cell");
            //         $(".periodBorder").css("display", "none");
            //         $("#apExpsPhrCn").attr("disabled", false);          // 앱 노출문구 활성화
            //     } else {
            //         $(".periodWrap").css("display", "none");                        // 복지카드 유효기간 영역 숨김
            //         $("#periodMonth").css("display", "none");                       // 복지카드 유효기간 개월 숨김
            //         $(".periodBorder").css("display", "table-cell");
            //         $("#apExpsPhrCn").attr("disabled", true);                       // 앱 노출문구 disabled 토글
            //     }
            //     $("#wlCrdDsbVlDvCd").val(ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH);        // 유효기간 타입 값 초기화
            //     $("#periodFixed").css("display", "none");                                 // 유효기간 특정일 영역 숨김
            //     $("input[name=wlCrdDsbVlDt]").val("");                                    // 유효기간 값 초기화
            //     $("#apExpsPhrCn").val("");                                                // 앱 노출문구 초기화
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
                    if( !(entity[i].wptlPrdTypeCd === ConstCode.CODES_PRODUCT.PRD_TYPE.CORPORATE_DEBIT_MASTER && entity[i].crdPntUsePsblYn !== "Y") ) {
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
         * 지급/회수 대상자 modal 열기
         * @param modalType (개별: list, 일괄: excel)
         */
        openEmpModal: async function (modalType = "list") {
            const wptlPrdNo = $("#wptlPrdNo").val();
            if (Util.isEmpty(wptlPrdNo)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "상품명을 선택해 주세요.");
                _this.methods.highlightError("#wptlPrdNo");
                return;
            }

            if (modalType === "excel") {
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
            }
            //Force cleanup before opening any modal type
            await _this.methods.forceCleanupModal();
            // 지급/회수 대상자 modal 열기 (js/modal/emp.js)
            EMP.methods.openEmpModal("trans", modalType);
        },
        /**
         * 지급/회수 대상자 엑셀 다운로드(업로드 양식)
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
         * 지급/회수 대상자 리스트 가공
         * @param entity (지급/회수 대상자 리스트)
         * @returns {Promise<void>}
         */
        setEmpInfoList: async function (entity) {
            _this.transTargetEmpList = entity;
            let isEach = $("input[name=dsbTrtvlTrgpRegDvCd]:checked").val() === ConstCode.CODES_TRANS.TRANS_TARGET_TYPE.EACH;
            let dsbTrtvlTrgpRegDvNm = isEach ? "개별 등록" : "일괄 등록";
            let transTotalAmount = "0 원";
            // 개별 등록인 경우
            if (isEach) {
                let dsbRtrvlAmt = _this.isAmountApply ? $("#dsbRtrvlAmt").val().trim() : "";
                if (!Util.isEmpty(dsbRtrvlAmt)) {
                    if (dsbRtrvlAmt === "전체 잔액") {
                        transTotalAmount = "전체 잔액";
                    } else {
                        let amount = dsbRtrvlAmt.replaceAll(",", "");
                        transTotalAmount = Util.numberFormat(_this.transTargetEmpList.length * Number(amount)) + " 원";
                    }
                }
                _this.transTargetEmpList.map(item => {
                    item.dsbTrtvlTrgpRegDvNm = dsbTrtvlTrgpRegDvNm;
                    item.dsbRtrvlAmtNm = !Util.isEmpty(dsbRtrvlAmt)
                                          ? (dsbRtrvlAmt === "전체 잔액" ? "전체 잔액" : dsbRtrvlAmt)
                                          : "";
                    item.dsbRtrvlAmt = !Util.isEmpty(dsbRtrvlAmt)
                                        ? (dsbRtrvlAmt === "전체 잔액" ? "" : Number(dsbRtrvlAmt.replaceAll(",", "")))
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
                if(!_this.isAmountApply){
                    let sum = 0;
                    _this.transTargetEmpList.map(item => {
                        let dsbRtrvlAmt = Util.numberOnly($("#" +  item.unmaskCdno).val());
                        item.dsbRtrvlAmtNm = !Util.isEmpty(dsbRtrvlAmt)
                            ?  Util.numberFormat(dsbRtrvlAmt)
                            : "";
                        item.dsbRtrvlAmt = !Util.isEmpty(dsbRtrvlAmt)
                            ? Number(dsbRtrvlAmt.replaceAll(",", ""))
                            : "";
                        sum += Util.isEmpty(item.dsbRtrvlAmt) ? 0 : item.dsbRtrvlAmt;
                    })
                    transTotalAmount = Util.numberFormat(sum) + " 원";
                }

            }
            // 일괄 등록인 경우
            else {
                let totalAmount = 0;
                _this.transTargetEmpList.map(item => {
                    item.dsbTrtvlTrgpRegDvNm = dsbTrtvlTrgpRegDvNm;
                    item.dsbRtrvlAmtNm = Util.numberFormat(item.dsbRtrvlAmt);
                    if (!Util.isEmpty(item.dsbRtrvlAmt))
                        totalAmount += Number(item.dsbRtrvlAmt.replaceAll(",", ""));
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

            // 지급/회수 대상자 - 내용 페이지 호출
            const params = {
                path: "trans/form_target",
                htmlData: {
                    empList: _this.transTargetEmpList,
                    transTotalAmount: transTotalAmount,
                    unmaskYn: _this.transUnmaskYn,
                    isAmountApply: _this.isAmountApply,
                    isEach: _this.isEach
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".table-content").html(html);
            Util.setReportHeight( $(".table-body")[0] );
        },
        /**
         * 지급/회수 대상자 개별 삭제
         */
        removeTransTarget: async function( rowIdx ) {
            if (!confirm("선택된 대상자를 삭제하시겠습니까?")) return;
            _this.transTargetEmpList.splice(rowIdx, 1);
            await _this.methods.setEmpInfoList( _this.transTargetEmpList );
        },
        /**
         * 지급/회수 등록 (인증번호 인증)
         * @returns {Promise<void>}
         */
        doAuthConfirm: async function () {
            await _this.methods.doRegistTrans();
        },
        /**
         * 엑셀업로드한 내역 대상자 등록
         */
        doConfirmTransTargetExcel: function() {
            if (Util.isEmpty(_this.dsbRtrvlTrgpFileNm) && Util.isEmpty(_this.dsbRtrvlTrgpFilePthNm)) {
                $("#empModal").modal({show: false}).remove();
                return;
            }
            if (!confirm("지급/회수 대상자 정보를 등록 하시겠습니까?")) return;
            setTimeout(() => {
                alert("지급/회수 대상자 정보를 등록 하였습니다.");
                _this.methods.setEmpInfoList(_this.transTargetEmpList);
                $("#empModal").modal({show: false}).remove();
            }, 300)
        },
        /**
         * 일괄등록 엑셀 업로드
         * @param el
         * @returns {Promise<void>}
         */
        doRegistTransTargetExcel: async function (el) {
            _this.transTargetEmpList = [];
            _this.dsbRtrvlTrgpFileNm = "";
            _this.dsbRtrvlTrgpFilePthNm = "";

            const props = {
                fileInput: el,
                uploadUrl: "/api/trans/doRegistTransTargetExcel",
                columnTitles: ["대상자명", "사원번호", "부서", "카드번호", "카드 상태", "배정금액"],
                setColumns: function (line) {
                    line.stfNm = Util.trim(line["대상자명"]);
                    line.incmpEmpNo = Util.trim(line["사원번호"]);
                    line.deptNm = Util.trim(line["부서"]);
                    line.cdno = Util.trim(line["카드번호"]);
                    line.dsbRtrvlAmt = line["배정금액"];
                    line.wptlPrdNo = $("#wptlPrdNo").val();
                    line.wptlEntpNo = KSM.targetWptlEntpNo;
                    if( Util.isEmpty(line.incmpEmpNo) && Util.isEmpty(line.stfNm) && Util.isEmpty(line.cdno) && Util.isEmpty(line.dsbRtrvlAmt) ) {
                        return null;
                    } else {
                        return line;
                    }
                },
                setUploadList: function(entity) {
                    _this.transTargetEmpList.push(...entity.transTargetEmpList);
                },
                setComplete: function(result) {
                    _this.dsbRtrvlTrgpFileNm = result.fileBean.originalFileName;
                    _this.dsbRtrvlTrgpFilePthNm = result.fileBean.fileUrlPath;
                }
            }
            await FILE.methods.fileUpload(props);
        },
        /**
         * 지급/회수 등록
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
            const executionCode = $("#executionDate").val();
            const params = {
                authToken: AUTH.authToken,
                authCode: $("#authCode").val().trim(),                                                     // 인증 코드
                wptlEntpNo: KSM.targetWptlEntpNo,                                        // 기업 시퀀스
                regWptlUserNo: KSM.targetWptlUserNo,                                     // 회원 시퀀스
                wptlPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "",            // 상품 시퀀스
                prdId: $("#wptlPrdNo option:selected").attr("_prdId"),                   // 상품 ID
                wptlPrdTypeCd: $("#wptlPrdNo option:selected").attr("_wptlPrdTypeCd"),   // 상품 타입
                dsbRtrvlDvCd: $("#dsbRtrvlDvCd").val(),                                  // 지급/회수 분류
                dsbRtrvlRsnCn: $("#dsbRtrvlRsnCn").val().trim(),                         // 지급/회수 사유
                crdCashId: "",                                                           // 카드캐시 ID
                crdCashWithBalaId: $("#crdCashWithBalaId option:selected").val(),                        // 카드캐시/잔액 ID
                rcgId: "",                                                               // 예치금 계좌 ID
                wlCrdDsbVlDvCd: "",                                                      // 유효기간 타입
                wlCrdDsbVlDt: "",                                                        // 유효기간 값
                apExpsPhrCn: $("#apExpsPhrCn").val().trim(),                             // APP 노출 문구
                dsbTrtvlTrgpRegDvCd: $("input[name=dsbTrtvlTrgpRegDvCd]:checked").val(), // 대상자 등록 방식
                woBalaRtrvlDvCd: _this.woBalaRtrvlDvCd,                                  // 지급/회수 금액 타입
                dsbRtrvlAmt: $("#dsbRtrvlAmt").val().trim(),                             // 지급/회수 금액
                transTargetEmpList: _this.transTargetEmpList,                            // 등록 대상자 리스트
                dsbRtrvlTrgpFileNm: "",                                                  // 등록 대상자 파일이름 (일괄 등록시)
                dsbRtrvlTrgpFilePthNm: "",                                                // 등록 대상자 파일경로 이름 (일괄 등록시)
                dsbRtrvTypeCd: $("#dsbRtrvlDvCd option:selected").attr("_dsbrtrvltype")                                                // 지급회수 유형코드(10:캐시, 20:잔액)
            }
            const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");
            if (executionCode === "30") {
                params.dsbRtrvlStCd = "98"; // 즉시
            } else {
                params.dedDt= $("#dedDt").val().trim() + " " + $("#dedTm").val(); // 실행 일시
            }
            if (depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER) {
                params.rcgId = params.crdCashWithBalaId;
                // params.dsbRtrvTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA;
            } else {
                params.crdCashId = params.crdCashWithBalaId;
                let wlCrdDsbVlDvCd = $("#wlCrdDsbVlDvCd").val();
                params.wlCrdDsbVlDvCd = wlCrdDsbVlDvCd;
                if (params.dsbRtrvlDvCd === ConstCode.CODES_TRANS.TRANS_TYPE.GIVE) {
                    params.wlCrdDsbVlDt = wlCrdDsbVlDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH
                                           ? $("#periodMonth input[name=wlCrdDsbVlDt]").val().trim()
                                           : $("#periodFixed input[name=wlCrdDsbVlDt]").val().trim();
                }
                // params.dsbRtrvTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH;
            }

            if (!_this.methods.updateCardValid(params)) return;
//            if (!confirm("지급/회수 정보를 등록하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/trans/doRegistTrans', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("지급/회수 정보를 등록하였습니다.");
                Util.replace("/trans/list");
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
         * 지급/회수 등록 유효성 체크
         * @param params
         * @returns {boolean}
         */
        updateCardValid: function (params) {
            _this.validEl.html("");
            let alertMessage="";
            let invalidMessage="";
            if (Util.isEmpty(params.wptlPrdNo) || Util.isEmpty(params.prdId) || Util.isEmpty(params.wptlPrdTypeCd)) {
                alertMessage+=(alertMessage ? ", " : "") + "상품명";
                _this.methods.highlightError("#wptlPrdNo");
            }
            if (Util.isEmpty(params.dsbRtrvlDvCd)) {
                alertMessage+=(alertMessage ? ", " : "") + "지급/회수 분류";
                _this.methods.highlightError("#dsbRtrvlDvCd");

            }
            if (Util.isEmpty(params.dsbRtrvlRsnCn)) {
                alertMessage+=(alertMessage ? ", " : "") + "지급/회수 사유";
                _this.methods.highlightError("#dsbRtrvlRsnCn");
            }
            const executionCode = $("#executionDate").val();
            if (executionCode !== "30" && Util.isEmpty($("#dedDt").val().trim())) {
                alertMessage+=(alertMessage ? ", " : "") + "실행 일시";
                _this.methods.highlightError("#dedDt");
            }

            if (Util.isEmpty(params.crdCashWithBalaId) && !Util.isEmpty(params.dsbRtrvlDvCd)) {
                alertMessage+=(alertMessage ? ", " : "") + "카드포인트/잔액명";
                _this.methods.highlightError("#crdCashWithBalaId");
            }

            if (params.dsbRtrvTypeCd === ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH && params.dsbRtrvlDvCd === ConstCode.CODES_TRANS.TRANS_TYPE.GIVE) {
                if (Util.isEmpty(params.wlCrdDsbVlDt) && !Util.isEmpty(params.dsbRtrvlDvCd)) {
                    alertMessage+=(alertMessage ? ", " : "") + "유효기간";
                    let periodType = $("#wlCrdDsbVlDvCd").val();
                    if (periodType === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH) {
                        _this.methods.highlightError("#periodMonth input[name=wlCrdDsbVlDt]");
                    } else {
                        _this.methods.highlightError("#periodFixed input[name=wlCrdDsbVlDt]");
                    }
                }
            }
            if (params.dsbTrtvlTrgpRegDvCd === ConstCode.CODES_TRANS.TRANS_TARGET_TYPE.EACH) {
                if(_this.isAmountApply){
                    if (Util.isEmpty(params.dsbRtrvlAmt)) {
                        alertMessage+=(alertMessage ? ", " : "") + "지급/회수 금액";
                        _this.methods.highlightError("#dsbRtrvlAmt");
                    }
                    else if (this.dsbRtrvlAmt <= 0) {
                        alertMessage+=(alertMessage ? ", " : "") + "지급/회수 금액";
                        _this.methods.highlightError("#dsbRtrvlAmt");
                    }
                }else {
                    const isAnyEmpty = params.transTargetEmpList.some(item => Util.isEmpty(item.dsbRtrvlAmtNm));

                    if (isAnyEmpty) {
                        if(alertMessage){
                            alertMessage+=(alertMessage ? ", " : "") + "지급/회수 금액";
                            params.transTargetEmpList.forEach(item => {
                                if (Util.isEmpty(item.dsbRtrvlAmtNm)) {
                                    _this.methods.highlightError("#" + item.unmaskCdno);
                                }
                            });
                        }
                        else{
                            alert("지급/회수 금액 항목에 1 이상의 숫자를 입력해 주세요.");
                            params.transTargetEmpList.forEach(item => {
                                if (Util.isEmpty(item.dsbRtrvlAmtNm) || Number(item.dsbRtrvlAmtNm) <= 0) {
                                    _this.methods.highlightError("#" + item.unmaskCdno);
                                }
                            });
                            return false;
                        }
                    }

                }
            }
            if(alertMessage){
                alertMessage+=" 항목이 작성되지 않았습니다.";
                alert(alertMessage);
                return false;
            }
            else{
                const currentDate = new Date();
                const dedDate = new Date(params.dedDt);
                const isToday = currentDate.getFullYear() === dedDate.getFullYear() && currentDate.getMonth() === dedDate.getMonth() && currentDate.getDate() === dedDate.getDate();
                const isAfterHour = currentDate.getHours() >= dedDate.getHours();
                const isAfterMinute = currentDate.getMinutes() >= dedDate.getMinutes();
                const isPastDate = dedDate < currentDate;
                if (isPastDate && !isToday) {
                    alert("실행 일시를 오늘 이후로 입력해 주세요.");
                    _this.methods.highlightError("#dedDt");
                    return false;
                }
                else if (isToday && isAfterHour && isAfterMinute) {
                    alert("실행 일시를 오늘 이후로 입력해 주세요.");
                    _this.methods.highlightError("#dedTm");
                    return false;

                }

                const isAnyInvalidAmt = params.transTargetEmpList.some(item => {
                    if (item.dsbRtrvlAmt === "") return false;
                    const val = item.dsbRtrvlAmt;

                    return (Number(val) <= 0);
                });
                if (isAnyInvalidAmt) {
                    alert("지급/회수 금액 항목에 1 이상의 숫자를 입력해 주세요.");
                    params.transTargetEmpList.forEach(item => {
                        if (Number(item.dsbRtrvlAmt) <= 0) {
                            _this.methods.highlightError("#" + item.unmaskCdno);
                        }
                    });

                   return false;
                }

            }

            if (Util.isEmpty(_this.transTargetEmpList)) {
                alert("지급/회수 대상자를 등록해 주세요.");
                return false;
            }
            return true;
        },
        /**
         * 휴대폰 인증번호 발송
         * @returns {Promise<void>}
         */
        doTransSendAuthCode: async function (modal) {
            let wptlPrdNo = $("#wptlPrdNo").val();
            const executionCode = $("#executionDate").val();
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                        // 기업 시퀀스
                regWptlUserNo: KSM.targetWptlUserNo,                                     // 회원 시퀀스
                wptlPrdNo: !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "",            // 상품 시퀀스
                prdId: $("#wptlPrdNo option:selected").attr("_prdId"),                   // 상품 ID
                wptlPrdTypeCd: $("#wptlPrdNo option:selected").attr("_wptlPrdTypeCd"),   // 상품 타입
                dsbRtrvlDvCd: $("#dsbRtrvlDvCd").val(),                                  // 지급/회수 분류
                dsbRtrvlRsnCn: $("#dsbRtrvlRsnCn").val().trim(),                         // 지급/회수 사유
                crdCashId: "",                                                           // 카드캐시 ID
                crdCashWithBalaId: $("#crdCashWithBalaId option:selected").val(),                                                           // 카드캐시/잔액 ID
                rcgId: "",                                                               // 예치금 계좌 ID
                wlCrdDsbVlDvCd: "",                                                      // 유효기간 타입
                wlCrdDsbVlDt: "",                                                        // 유효기간 값
                apExpsPhrCn: $("#apExpsPhrCn").val().trim(),                             // APP 노출 문구
                dsbTrtvlTrgpRegDvCd: $("input[name=dsbTrtvlTrgpRegDvCd]:checked").val(), // 대상자 등록 방식
                woBalaRtrvlDvCd: _this.woBalaRtrvlDvCd,                                  // 지급/회수 금액 타입
                dsbRtrvlAmt: $("#dsbRtrvlAmt").val().trim(),                             // 지급/회수 금액
                transTargetEmpList: _this.transTargetEmpList,                            // 등록 대상자 리스트
                dsbRtrvlTrgpFileNm: "",                                                  // 등록 대상자 파일이름 (일괄 등록시)
                dsbRtrvlTrgpFilePthNm: "",                                                // 등록 대상자 파일경로 이름 (일괄 등록시)
                dsbRtrvTypeCd: $("#dsbRtrvlDvCd option:selected").attr("_dsbrtrvltype")                                                // 지급회수 유형코드(10:캐시, 20:잔액)
            }
            const depositType = $("#crdCashWithBalaId option:selected").attr("_depositType");
            if (executionCode === "30") {
                params.dsbRtrvlStCd = "98"; // 즉시
            } else {
                params.dedDt= $("#dedDt").val().trim() + " " + $("#dedTm").val();              // 실행 일시
            }
            if (depositType === ConstCode.CODES_VIRTUAL_ACCOUNT.TYPE.RECHARGER) {
                params.rcgId = params.crdCashWithBalaId;
                // params.dsbRtrvTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.BALA;
            } else {
                params.crdCashId = params.crdCashWithBalaId;
                let wlCrdDsbVlDvCd = $("#wlCrdDsbVlDvCd").val();
                params.wlCrdDsbVlDvCd = wlCrdDsbVlDvCd;
                if (params.dsbRtrvlDvCd === ConstCode.CODES_TRANS.TRANS_TYPE.GIVE) {
                    params.wlCrdDsbVlDt = wlCrdDsbVlDvCd === ConstCode.CODES_TRANS.PERIOD_TYPE.MONTH
                        ? $("#periodMonth input[name=wlCrdDsbVlDt]").val().trim()
                        : $("#periodFixed input[name=wlCrdDsbVlDt]").val().trim();
                }
                // params.dsbRtrvTypeCd = ConstCode.CODES_TRANS.TRANS_DSB_RTRVL_TYPE.CASH;
            }
            console.log('params: ', params)
            if (!_this.methods.updateCardValid(params)) return;

            if(!modal) {
                if (!confirm("지급/회수 정보를 등록하시겠습니까?")) return;
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
         * 지급/회수 인증 modal 열기
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
                    pageType: 'trans'
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
                _this.methods.setEmpInfoList(_this.transTargetEmpList);
            } else if( pageType === "transAuth" ) {
                _this.transAuthUnmaskYn = "Y";
                $("#transAutheModal .masking-input").each( function(idx, item) {
                    $(item).val( $(item).data("realValue") );
                });
            }
        },
        /**
         * Highlight error on element with red border
         * @param element - DOM element or selector
         */
        highlightError: function(element) {
            const $el = $(element);

            // Store original border style if not already stored
            if (!$el.data('original-border')) {
                $el.data('original-border', $el.css('border'));
                $el.data('original-box-shadow', $el.css('box-shadow'));
            }

            // Apply red border using inline styles
            $el.css({
                'border': '2px solid #ff0000',
                'box-shadow': '0 0 5px rgba(255, 0, 0, 0.3)'
            });

            // Remove error styling when user starts typing/selecting
            $el.one('input change', function() {
                _this.methods.removeErrorHighlight(this);
            });
        },

        /**
         * Remove error highlight and restore original style
         * @param element - DOM element or selector
         */
        removeErrorHighlight: function(element) {
            const $el = $(element);

            // Restore original border style
            if ($el.data('original-border')) {
                $el.css({
                    'border': $el.data('original-border'),
                    'box-shadow': $el.data('original-box-shadow')
                });
            }

        },

        /**
         * Clear all error highlights from the page
         */
        clearAllErrors: function() {

            $('input, select, textarea').each(function() {
                if ($(this).data('original-border')) {
                     _this.methods.removeErrorHighlight(this);
                }
            });
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

            // Small delay to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Util.setDatePicker("after");
        _this.methods.doGetProductList();
    }
}

window.FH = FH;
FH.init();
