const EMP_MODAL = {
    scrollWrap: null,
    empValidEl: null,
    cardValidEl: null,
    entpNm: KSM.targetEntpNm,
    posCardList: [],
    cardParams: {},
    empCardList: [],
    empUploadList: [],
    empUploadSaveYn: "N",
    empModUnmaskYn: "N",
    isCheckId: false,
    isOverlapModal: FH.isOverlapModal || false,
    empSmsIsYn: "",
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
            // 임직원 등록/수정 modal - 지급카드 정보 영역 - 상품 선택 변경시
            $(document).on("change", "#wptlPrdNo", function () {
                let wptlPrdNo = $(this).val();
                $("#selectCardBtnWrap").css("display", (!Util.isEmpty(wptlPrdNo) ? "block" : "none"));
            });

            $(document).on("change", "#engLstn, #engFstn", function () {
                EMP_MODAL.empValidEl.html("");
                let value = $(this).val();
                const engLstn = $("#engLstn").val();
                const engFstn = $("#engFstn").val();
                const regex = /^([a-zA-Z]+[ ]{0,1})+$/;
                if( engLstn.length < 1 ) {
                    return;
                }
                if(!Util.validCheckRegex(engLstn, regex)) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명에는 영문만 입력 가능합니다.");
                    return;
                }
                if( engFstn.length < 1 ) {
                    return;
                }
                if(!Util.validCheckRegex(engFstn, regex)) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명에는 영문만 입력 가능합니다.");
                    return;
                }

                if( value.length < 1 ) {
                    return;
                }
                $(this).val(value.toUpperCase());
            });

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
        }
    },
    methods: {
        /**
         * 임직원 modal 열기
         * @param modalType (엑셀: excel, 등록: reg, 수정: mod, 상세: info)
         * @param wptlEmpNo (임직원 시퀀스)
         * @returns {Promise<boolean>}
         */
        openEmployeeModal: async function (modalType = "reg", wptlEmpNo, unmaskYn, empSmsIsYn) {
            EMP_MODAL.empUploadSaveYn = "N";
            EMP_MODAL.empUploadList = [];
            EMP_MODAL.empModUnmaskYn = "N";
            EMP_MODAL.isCheckId = false; // 사원번호 중복 확인 flag 초기화
            const params = {
                path: "modal/employee",
                htmlData: {
                    modalType: modalType,
                    entpNm: EMP_MODAL.entpNm,
                    isOverlapModal: EMP_MODAL.isOverlapModal
                }
            }
            if (modalType === "reg" || modalType === "mod") {
                const dept = await ServiceExec.post('/api/group/doGetDeptList', {wptlEntpNo : KSM.targetWptlEntpNo});
                params.htmlData.deptList = dept.entity;
                const jgd = await ServiceExec.post('/api/group/doGetJgdList', {wptlEntpNo : KSM.targetWptlEntpNo});
                params.htmlData.jgdList = jgd.entity;
                const rsb = await ServiceExec.post('/api/group/doGetRsbList', {wptlEntpNo : KSM.targetWptlEntpNo});
                params.htmlData.rsbList = rsb.entity;
                const prd = await ServiceExec.post('/api/group/doGetPrdList', {wptlEntpNo : KSM.targetWptlEntpNo});
                // 기업 상품 리스트
                params.htmlData.prdList = prd.entity.prdInfoList;
            }
            if (modalType === "mod" || modalType === "info") {
                let detailParams = { wptlEmpNo : Number(wptlEmpNo) };
                if (modalType === "mod") {
                    EMP_MODAL.isCheckId = true;
                    detailParams.modifyInput = "Y";
                } else {
                    detailParams.unmaskYn = Util.isEmpty(unmaskYn) ? "N" : unmaskYn;
                }
                const user = await ServiceExec.post('/api/group/doGetEmpDetail', detailParams);
                // 임직원 상세
                params.htmlData.empDetail = user.entity;
                const crd = await ServiceExec.post('/api/group/doGetEmpCrdList', detailParams);
                // 임직원 보유 카드 리스트
                params.htmlData.empCrdList = crd.entity.empCardList;
                params.htmlData.unmaskYn = detailParams.unmaskYn;
            }
            if( Util.isEmpty(params.htmlData.unmaskYn) ) {
                params.htmlData.unmaskYn = "N";
            }

            params.htmlData.empSmsIsYn = Util.isEmpty(empSmsIsYn) ? "N" : empSmsIsYn;

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#employeeModal").length) $("#employeeModal").remove();

            if(EMP_MODAL.isOverlapModal) {
                FH.methods.openEmployeeModal(html);
            } else {
                $("body").children("a.btn-top").after(html);
            }

            $("#employeeModal").modal({show: true});
            if( modalType === "mod" || modalType === "reg" ) {
                const elements = document.querySelectorAll("#employeeModal .masking-input");
                addEventListenerByElements( elements );
                elements.forEach( (el) => {
                    //el.dataset.realValue = el.value;
                    el.dispatchEvent( new Event("input") );
                });
            }
        },
        unmaskingPage: function( type, el ) {
            unmaskingInput(el);
            $(".card-num").each( function(idx, item) {
                $(item).text( $(item).data("realValue") );
            });
            if( type === "mod" || type === "reg" ) {
                EMP_MODAL.empModUnmaskYn = "Y";
                $("#employeeModal .conneted-cards div.num").each( function(idx, item) {
                    const realValue = $(item).data("realValue");
                    $(item).text( realValue );
                });
            }
        },
        /**
         * 임직원 일괄 등록 modal - 엑셀 업로드
         * @param saveYn
         * @returns {Promise<boolean>}
         */
        doRegistEmpExcel: async function (el, empSmsIsYn) {
            EMP_MODAL.empUploadList = [];
            EMP_MODAL.empUploadSaveYn = "N";

            let columns = EMP_MODAL.methods.getColumnTitles(empSmsIsYn);

            const props = {
                fileInput: el,
                uploadUrl: "/api/group/doRegistEmpExcel",
                columnTitles: columns,
                setColumns: function (line) {
                    line.stfNm = Util.trim(line["*임직원명"]);
                    if( line["*생년월일"] instanceof Date ) {
                        let dt = line["*생년월일"];
                        line.birthDt = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
                    } else {
                        line.birthDt = Util.trim(line["*생년월일"]);
                    }
                    line.incmpEmpNo = Util.trim(line["*사원번호"]);
                    if( line["입사일"] instanceof Date ) {
                        let dt = line["입사일"];
                        line.entcoDt = dt.getFullYear() + "/" + String(dt.getMonth() + 1).padStart(2, "0") + "/" + String(dt.getDate()).padStart(2, "0");
                    } else {
                        line.entcoDt = Util.trim(line["입사일"]);
                    }
                    line.wptlEntpWkinStNm = Util.trim(line["*사용자 상태"]);
                    line.hpnmNo = Util.trim(line["*휴대폰 번호"]);
                    line.emailAddr = Util.trim(line["이메일"]);
                    line.jgdNm = Util.trim(line["직급"]);
                    line.rsbNm = Util.trim(line["직책"]);
                    line.deptNm = Util.trim(line["부서"]);
                    line.engLstn = Util.trim(line["여권명 성(영문)"]);
                    line.engFstn = Util.trim(line["여권명 이름(영문)"]);
                    if(empSmsIsYn === "Y") {
                        if(Util.trim(line["*결제 SMS 알림"]) === "허용") {
                            line.smsNfctYn = "Y";
                        } else if(Util.trim(line["*결제 SMS 알림"]) === "차단") {
                            line.smsNfctYn = "N";
                        } else {
                            line.smsNfctYn = null;
                        }
                    }

                    line.wptlEntpNo = KSM.targetWptlEntpNo;
                    if( Util.isEmpty(line.stfNm) && Util.isEmpty(line.birthDt) && Util.isEmpty(line.incmpEmpNo) && Util.isEmpty(line.entcoDt)
                        && Util.isEmpty(line.wptlEntpWkinStNm) && Util.isEmpty(line.hpnmNo) && Util.isEmpty(line.emailAddr) && Util.isEmpty(line.jgdNm)
                        && Util.isEmpty(line.rsbNm) && Util.isEmpty(line.deptNm) && Util.isEmpty(line.engLstn) && Util.isEmpty(line.engFstn) && Util.isEmpty(line.smsNfctYn) ) {
                        return null;
                    } else {
                        return line;
                    }
                },
                setUploadList: function(entity) {
                    EMP_MODAL.empUploadList.push(...entity.empUploadList);
                },
                setComplete: function(result) {
                    if( result.rejectCount < 1 ) {
                        EMP_MODAL.empUploadSaveYn = "Y";
                    }
                }
            }
            await FILE.methods.fileUpload(props);
        },
        /**
         * 컬럼 Title
         */
        getColumnTitles: function (empSmsIsYn) {
            let columns = ["*임직원명", "*생년월일", "*사원번호", "입사일", "*사용자 상태", "*휴대폰 번호", "이메일", "직급", "직책", "부서", "여권명 성(영문)", "여권명 이름(영문)"];

            if(empSmsIsYn === "Y") {
                columns.push("*결제 SMS 알림");
            }

            return columns;
        },
        /**
         * 임직원 일괄등록 Confirm
         * @param wptlEmpNo
         */
        doRegistEmpExcelConfirm: async function() {
            if (EMP_MODAL.empUploadSaveYn !== "Y") {
                if(EMP_MODAL.isOverlapModal) {
                    FH.methods.closeEmployeeModal();
                    FH.methods.openEmpModal(entity);
                } else {
                    $("#employeeModal").modal({show: false}).remove();
                }
                return;
            }
            if (!confirm("임직원 정보를 등록 하시겠습니까?")) return false;
            startLoading();
            const params = {
                empUploadList: EMP_MODAL.empUploadList
            }
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/group/doRegistEmpExcelConfirm', params);
            stopLoading();
            const code = res.code;
            const message = res.message;
            const entity = res.entity;

            if (code === 1) {
                alert("임직원 정보를 등록하였습니다.");
                if(EMP_MODAL.isOverlapModal) {
                    FH.methods.closeEmployeeModal();
                    FH.methods.openEmpModal(entity);
                } else {
                    $("#employeeModal").modal({show: false}).remove();
                }
                // 임직원 리스트 갱신
                FH.page = 1;
                FH.methods.doGetEmpList();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case -2005: // 중복된 부서가 있는경우
                    //     break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 임직원 등록/수정 modal - 사원번호 중복 확인
         * @param wptlEmpNo (임직원 시퀀스: 수정인 경우)
         * @returns {Promise<boolean>}
         */
        doCheckDuplIncmpEmpNo: async function (wptlEmpNo = "") {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                             // 기업 시퀀스
                wptlEmpNo: !Util.isEmpty(wptlEmpNo) ? Number(wptlEmpNo) : "", // 임직원 시퀀스
                incmpEmpNo: $("#employeeModal #incmpEmpNo").val().trim()      // 사원번호
            }
            if (!EMP_MODAL.methods.duplIncmpValid(params)) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doCheckDuplIncmpEmpNo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                EMP_MODAL.isCheckId = true;
                EMP_MODAL.empValidEl.html('<span class="blue2">사용 가능한 사원번호입니다.</span>');
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl);
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -2001 : 중복된 사원번호인 경우
                    case -2001:
                        Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 임직원 등록/수정 modal - 사원번호 중복 확인 유효성 체크
         * @param params
         * @returns {boolean}
         */
        duplIncmpValid: function (params) {
            EMP_MODAL.empValidEl.html("");
            if (Util.isEmpty(params.incmpEmpNo)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "사원번호를 입력해 주세요.");
                return false;
            }
            return true;
        },
        /**
         * 임직원 등록/수정 modal - 임직원 등록/수정
         * @param modalType (등록: reg, 수정: mod)
         * @param wptlEmpNo
         * @returns {Promise<boolean>}
         */
        doRedifyEmp: async function (modalType = "reg", wptlEmpNo) {
            let wptlDeptNo = $("#employeeModal #wptlDeptNo").val();
            let wptlJgdNo = $("#employeeModal #wptlJgdNo").val();
            let wptlRsbNo = $("#employeeModal #wptlRsbNo").val();
            let engLstn = $("#engLstn").val().toUpperCase();
            let engFstn = $("#engFstn").val().toUpperCase();
            let smsNfctYn = $("input[name=smsNfctYn]:checked").val();
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                // 기업 시퀀스
                wptlEmpNo: !Util.isEmpty(wptlEmpNo) ? Number(wptlEmpNo) : "",    // 임직원 시퀀스
                wptlDeptNo: !Util.isEmpty(wptlDeptNo) ? Number(wptlDeptNo) : "", // 부서 시퀀스
                incmpEmpNo: $("#employeeModal #incmpEmpNo").val().trim(),        // 사원번호
                wptlEntpWkinStCd: $("#employeeModal #wptlEntpWkinStCd").val(),   // 재직상태
                stfNm: $("#employeeModal #stfNm").val().trim(),                  // 임직원명
                engLstn: engLstn,              // 영문성
                engFstn: engFstn,              // 영문이름
                hpnmNo: $("#employeeModal #hpnmNo").data("realValue").trim(),                // 휴대폰 번호
                entcoDt: $("#employeeModal #entcoDt").val().trim(),              // 입사일
                birthDt: $("#employeeModal #birthDt").val().trim(),              // 생년월일
                emailAddr: $("#employeeModal #emailAddr").val().trim(),          // 이메일
                wptlJgdNo: !Util.isEmpty(wptlJgdNo) ? Number(wptlJgdNo) : "",    // 직급 시퀀스
                wptlRsbNo: !Util.isEmpty(wptlRsbNo) ? Number(wptlRsbNo) : "",     // 직책 시퀀스
                smsNfctYn: !Util.isEmpty(smsNfctYn) ? smsNfctYn : "" // 결제 SMS 알림
            }
            if (!EMP_MODAL.methods.employeeValid(params)) return false;
            if (!confirm("임직원 정보를 " + (modalType == "reg" ? "등록" : "수정") + "하시겠습니까?")) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doRedifyEmp', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // entity : {wptlEmpNo: 296479807}
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                let parList = EMP_MODAL.methods.getProvideCardList();
                // 지급 카드 영역에 카드 정보 있으면 카드 지급
                if (!Util.isEmpty(parList)) {
                    const subRes = await ServiceExec.jsonPost('/api/group/doProvideCrd', {
                        wptlEmpNo: entity.wptlEmpNo,
                        parList: parList
                    });
                    if (subRes.code !== 1) {
                        alert(subRes.message);
                        return false;
                    }
                }

                alert("임직원 정보를 " + (modalType === "reg" ? "등록" : "수정") + "하였습니다.");

                if( EMP_MODAL.isOverlapModal ) {
                    FH.methods.closeEmployeeModal();
                    FH.methods.openEmpModal(entity);
                } else {
                    $("#employeeModal").modal({show: false}).remove();
                    if (modalType === "reg") FH.page = 1;
                    FH.methods.doGetEmpList();
                }
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -2001 : 중복된 사원번호인 경우
                    case -2001:
                        Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 임직원 등록/수정 modal - 임직원 등록/수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        employeeValid: function (params) {
            EMP_MODAL.empValidEl.html("");
            if (Util.isEmpty(params.incmpEmpNo)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "사원번호를 입력해 주세요.");
                return false;
            }
            if (!EMP_MODAL.isCheckId) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "사원번호 중복확인을 클릭해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.stfNm)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "임직원명을 입력해 주세요.");
                return false;
            }
            if( !Util.isEmpty(params.stfNm) ) {
                const regex = /^(?:[가-힣0-9]+|[A-Z0-9]+)$/;
                if(!Util.validCheckRegex(params.stfNm, regex)) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "한글 또는 영문 대문자만 가능, 혼합 불가");
                    return false;
                }
            }
            if (!Util.isEmpty(params.engLstn) || !Util.isEmpty(params.engFstn)) {
                if( Util.isEmpty(params.engLstn) ) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명 성을 입력해 주세요.");
                    return false;
                }
                if( Util.isEmpty(params.engFstn) ) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명 이름을 입력해 주세요.");
                    return false;
                }
                const regex = /^([a-zA-Z]+[ ]{0,1})+$/;
                if(!Util.validCheckRegex(params.engLstn, regex) || !Util.validCheckRegex(params.engFstn, regex)) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명에는 영문만 입력 가능합니다.");
                    return false;
                }
                if((params.engLstn + " " + params.engFstn).length > 20) {
                    Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "여권명은 최대 20자까지 입력해 주세요.");
                    return false;
                }
            }
            if (Util.isEmpty(params.hpnmNo)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "휴대폰 번호를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.birthDt)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "생년월일을 입력해 주세요.");
                return false;
            }
            if (!Util.validBirth(params.birthDt.replaceAll("/", ""))) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "생년월일이 입력 형식에 맞지 않습니다.");
                return false;
            }
            // Phase69.0 이메일 선택값으로 변경
            // if (Util.isEmpty(params.emailAddr)) {
            //     Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "이메일을 입력해 주세요.");
            //     return false;
            // }
            if (!Util.isEmpty(params.emailAddr) && !Util.validEmail(params.emailAddr)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
//            Date of joining (changed from required to optional)
//            if (Util.isEmpty(params.entcoDt)) {
//                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "입사일을 입력해 주세요.");
//                return false;
//            }
            if (Util.isEmpty(params.wptlEntpWkinStCd)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "재직 상태를 선택해 주세요.");
                return false;
            }
            // Phase69.0 부서, 직급, 직책 선택값으로 변경
            // if (Util.isEmpty(params.wptlDeptNo)) {
            //     Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "부서를 선택해주세요.");
            //     return false;
            // }
            // if (Util.isEmpty(params.wptlJgdNo)) {
            //     Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "직급을 선택해 주세요.");
            //     return false;
            // }
            // if (Util.isEmpty(params.wptlRsbNo)) {
            //     Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.empValidEl, "직책을 선택해 주세요.");
            //     return false;
            // }
            if ($("#employeeModal #wptlEntpWkinStCd").val() === "99" && $("input[name=newLinkedCard]").length) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.cardValidEl, "퇴사한 임직원은 카드지급을 할 수 없습니다.");
                return false;
            }
            return true;
        },
        /**
         * 임직원 등록/수정 modal - 지급한 카드 연결 해제
         * @param el (연결 해제 버튼)
         * @param wptlEmpNo (임직원 시퀀스)
         * @returns {Promise<boolean>}
         */
        doReleaseCrd: async function (el, wptlEmpNo) {
            if (!confirm("선택한 카드를 연결해제 하시겠습니까?")) return false;
            if (Util.isEmpty(wptlEmpNo)) {
                alert("선택한 카드를 연결해제 하였습니다.");
                $(el).closest("li").remove();
                return false;
            }
            const params = {
                wptlEmpNo: wptlEmpNo,                 // 임직원 시퀀스
                par: $(el).closest("li").attr("_par") // 카드 par
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doReleaseCrd', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("선택한 카드를 연결해제 하였습니다.");
                $(el).closest("li").remove();
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
         * 임직원 등록/수정 modal - 지급한 카드 폐기
         * @param el (카드 폐기 버튼)
         * @returns {Promise<boolean>}
         */
        doChangeCardStatusToTerminate: async function (el, wptlEmpNo, prdId) {
            if (!confirm("카드를 폐기 하시겠습니까?")) return false;

            const params = {
                par: $(el).closest("li").attr("_par"), // 카드 par
                wptlEmpNo: wptlEmpNo,                 // 임직원 시퀀스
                bizStatusEnum: ConstCode.CODES_CARD.CARD_STATUS_CHANGE_TYPE.TERMINATE,
                prdId : prdId
            }

            // 카드 연결 해제 완료 후 카드 폐기 실행
            const res = await ServiceExec.post('/api/card/doChangeCardStatus', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            //console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("카드를 폐기 하였습니다.");
                $(el).closest("li").remove();

/*

                const releaseCardRes = await ServiceExec.post('/api/group/doReleaseCrd', params);
                const releaseCardCode = releaseCardRes.code;
                const releaseCardMessage = releaseCardRes.message;
                const releaseCardEntity = releaseCardRes.entity;

                if(releaseCardCode === 1) {
                    $(el).closest("li").remove();
                } else {
                    switch (releaseCardCode) {
                        // 예외처리 경우
                        // case :
                        //     break;
                        default:
                            alert(releaseCardMessage);
                            break;
                    }
                }
*/

            } else {
                switch (code) {
                    // 예외처리 경우
                    case -4001 :
                        alert("잔액 회수 후 폐기 가능합니다.");
                        break;
                    case -4002 :
                        alert("잔여 포인트 회수 후 폐기 가능합니다.");
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 임직원 등록/수정 modal - 지급 카드 영역 리스트 가져오기
         * @returns {*[]}
         */
        getProvideCardList: function () {
            let parList = [];
            $("#employeeModal .conneted-cards ul li").each(function(index, item) {
                let par = $(item).attr("_par");
                if (!Util.isEmpty(par))
                    parList.push(par);
            })
            return parList;
        },
        /* ---------------------------------------- 카드 modal start ---------------------------------------- */
        /**
         * 카드 리스트 데이터 조회
         * @returns {Promise<boolean>}
         */
        doGetPosCrdList: async function ( type="info" ) {
            let wptlPrdNo = $("#employeeModal #wptlPrdNo").val();

            EMP_MODAL.cardParams.wptlEntpNo = KSM.targetWptlEntpNo;                       // 기업 시퀀스
            EMP_MODAL.cardParams.wptlPrdNo = !Util.isEmpty(wptlPrdNo) ? Number(wptlPrdNo) : "";                // 상품 시퀀스
            const $input = $("#cardModal #searchText");
            if( type === "search" ) {
                EMP_MODAL.cardParams.searchType = $("#cardModal").length ? $("#cardModal #searchType").val() : "2"; // 검색 분류
                EMP_MODAL.cardParams.searchText = $("#cardModal").length
                    ? ($input.data("realValue") || $input.val().trim())
                    : "";  // 검색어
            } else if( type === "unmask" ) {
                EMP_MODAL.cardParams.searchType = $("#cardModal").length ? $("#cardModal #searchType").val() : "2"; // 검색 분류
                EMP_MODAL.cardParams.searchText = $("#cardModal").length
                    ? ($input.data("realValue") || $input.val().trim())
                    : "";
                EMP_MODAL.cardParams.unmaskYn = "Y";
            } else {
                EMP_MODAL.cardParams.searchType = "2";
                EMP_MODAL.cardParams.searchText = "";
                EMP_MODAL.cardParams.unmaskYn = "N";
            }
            EMP_MODAL.cardParams.searchText = EMP_MODAL.cardParams.searchText.replaceAll( "-", "" );
            const params = { ...EMP_MODAL.cardParams };
            if (!EMP_MODAL.methods.posCardValid(params)) return false;
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doGetPosCrdList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                EMP_MODAL.posCardList = entity.posCrdList;
                params.cardInfo = entity;
                // 이미 선택한 카드 disabled 처리를 위한 카드 리스트(지급 카드 영역) 추가
                params.cardInfo.prvCrdList = EMP_MODAL.methods.getProvideCardList();
                params.pageType = ''
                EMP_MODAL.methods.openCardModal(type, params);
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
         * 카드 리스트 데이트 조회 유효성 체크
         * @param params
         * @returns {boolean}
         */
        posCardValid: function (params) {
            EMP_MODAL.cardValidEl.html("");
            if (Util.isEmpty(params.wptlPrdNo)) {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.cardValidEl, "상품을 선택해주세요.");
                return false;
            }
            if ($("#employeeModal #wptlEntpWkinStCd").val() === "99") {
                Util.validCheck(EMP_MODAL.scrollWrap, EMP_MODAL.cardValidEl, "퇴사한 임직원은 카드지급을 할 수 없습니다.");
                return false;
            }

            return true;
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
            $("#employeeModal").after(html);
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
                $("#cardModal #searchText").attr( "maxlength", "4" );
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
         * 지급할 카드 리스트 modal - 카드 선택
         * @param par (카드 par)
         * @returns {Promise<void>}
         */
        selectCard: async function (par) {
            let cardInfo = EMP_MODAL.posCardList.find(item => item.par === par);
            if (!Util.isEmpty(cardInfo)) {
                EMP_MODAL.methods.setSelectCardInfo(cardInfo);
                EMP_MODAL.methods.closeCardModal();
            }
        },
        /**
         * 지급할 카드 리스트 modal - 선택 카드 정보 임직원 등록/수정 modal에 바인딩
         * @param cardInfo
         * @returns {Promise<void>}
         */
        setSelectCardInfo: async function (cardInfo) {
            let html = "";
            html += '<li _par="' + cardInfo.par + '">' +
                '<div class="item">' +
                '<input type="hidden" name="newLinkedCard">' +
                '<dl>' +
                '<dt>상품명</dt>' +
                '<dd>' +
                '<div style="max-width:270px; margin-top: 5px; margin-bottom: 5px;" class="name">' + cardInfo.prdNm + '</div>' +
                '<button class="btn-type8 btn-round btn-s" onclick="EMP_MODAL.methods.doReleaseCrd(this)">' +
                '<strong>연결해제</strong>' +
                '</button>' +
                '</dd>' +
                '</dl>' +
                '<dl>' +
                '<dt>카드번호</dt>' +
                '<dd>' +
                '<div class="num" data-real-value="' + cardInfo.unmaskCdno + '">' + (EMP_MODAL.empModUnmaskYn === "N" ? cardInfo.maskCdno : cardInfo.unmaskCdno) + '</div>' +
                '</dd>' +
                '</dl>' +
                '</div>' +
                '</li>';
            $("#employeeModal .conneted-cards ul").append(html);
            $("#employeeModal .modal-body").scrollTop($("#employeeModal .modal-body")[0].scrollHeight);
            $("#employeeModal .conneted-cards").scrollTop($("#employeeModal .conneted-cards")[0].scrollHeight);
        },
        autoFormatDate: function (obj, elmId) {
            const $error = $(elmId);
            let val = obj.value.replace(/\D/g, "");
            let result = "";

            if (val.length < 5) {
                result = val;
            } else if (val.length < 7) {
                result = val.substring(0, 4) + "/" + val.substring(4);
            } else {
                result = val.substring(0, 4) + "/" + val.substring(4, 6) + "/" + val.substring(6, 8);
            }
            obj.value = result;
            $error.text("").css("display", "none");

            const isEmpty = obj.value.length === 0;
            const isFullDate = obj.value.length === 10;
            const isJoinDateField = elmId === '#joinDateErrorMessage';

            let showError = false;

            if (isFullDate) {
                showError = !EMP_MODAL.methods.validateDate(obj.value);
            } else if (!(isJoinDateField && isEmpty)) {
                showError = true;
            }

            if (showError) {
                $error.text("유효하지 않은 날짜입니다. 다시 입력해 주세요.").show();
            } else {
                $error.text("").hide();
            }
        },

        validateDate: function (dateStr) {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return false;

            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);

            const date = new Date(year, month - 1, day);
            const now = new Date();

            const isValidDate = date.getFullYear() === year && (date.getMonth() + 1) === month && date.getDate() === day;

            if (!isValidDate || date > now || year < 1900) {
                return false;
            }
            return true;
        },
        /**
         * 지급할 카드 리스트 modal 닫기
         */
        closeCardModal: function () {
            if ($("#cardModal").length) $("#cardModal").remove();
        }
        /* ---------------------------------------- 카드 modal end ---------------------------------------- */
    },
    init: function () {
        for (let eventFunc in EMP_MODAL.events) {
            EMP_MODAL.events[eventFunc]();
        }
        Util.setDatePicker();
    }
}

window.EMP_MODAL = EMP_MODAL;
EMP_MODAL.init();