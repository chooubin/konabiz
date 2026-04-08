import "/js/common/File.js?version=2025010801";

// 임직원 검색 modal js
// let _this;
const EMP = {
    scrollWrap: null,
    validEl: null,
    empList: [],
    checkEmpList: [],
    maskingType: "mask",
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
            $(document).on("change", "input:checkbox[name=empCheck]", function() {
                let total = $("#empModal input[name=empCheck]").length;
                let emp = $("#empModal input[name=empCheck]:checked").length;
                $("#empAllCheck").prop("checked", total === emp);

                const par = $(this).attr("_par");
                if( $(this).is(":checked") ) {
                    EMP.checkEmpList = EMP.checkEmpList.concat(par);
                    EMP.checkEmpList = EMP.checkEmpList.filter( (item, pos) => EMP.checkEmpList.indexOf(item) === pos );
                } else {
                    EMP.checkEmpList = EMP.checkEmpList.filter( (item) => item !== par );
                }
            });
        }
    },
    methods: {
        /**
         * 임직원 검색 modal 열기
         * @param pageType (복지/법인 카드 지급: card, 지급/회수 대상: trans, 카드 주문 지급 대상: order)
         * @param modalType (지급/회수 대상 선택: list, 지급/회수 엑셀: excel)
         * @returns {Promise<void>}
         */
        openEmpModal: async function (pageType, modalType = "list", maskingType = "mask") {
            EMP.maskingType = "N";
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                                      // 기업 시퀀스 
                wptlDeptNo: $("#empModal").length ? $("#empModal #wptlDeptNo").val() : "",             // 부서 번호 
                wptlEntpWkinStCd: $("#empModal").length ? $("#empModal #wptlEntpWkinStCd").val() : "", // 재직 상태
                searchText: $("#empModal").length ? $("#empModal #searchText").val() : "",              // 검색어
                searchType: $("#searchType").length ? $("#searchType").val() : ""
            }
            if (modalType !== "excel") {
                //if ( maskingType !== "unmask" && !EMP.methods.empValid(params)) return;
                if( maskingType === "unmask" ) {
                    params.unmaskYn = "Y";
                    EMP.maskingType = maskingType;
                }
                const dept = await ServiceExec.post('/api/group/doGetDeptList', {wptlEntpNo: params.wptlEntpNo});
                // 복지/법인카드 관리 - 상세 페이지 - 지급 대상자 조회시
                if (pageType === "card") {
                    const emp = await ServiceExec.post('/api/card/doGetEmpList', params);
                    EMP.empList = emp.entity;
                    params.empList = EMP.empList;
                    params.wptlEmpNo = $("#wptlEmpNo").val().trim();
                }
                // 지급/회수 관리 - 지급/회수 등록 페이지 - 지급/회수 대상자 조회시
                // 또는 정기 지급 관리 - 정기지급 등록 페이지 - 정기지급 대상자 조회시
                if (pageType === "trans" || pageType === "transSearch" || pageType === "regularTrans" || pageType === "regularTransSearch") {
                    params.wptlPrdNo = $("#wptlPrdNo").val();
                    const emp = await ServiceExec.post('/api/trans/doGetTransTargetSearchList', params);
                    if( pageType === "transSearch" || pageType === "regularTransSearch") {
                        pageType = pageType === "transSearch" ? "trans" : "regularTrans";
                        params.empList = emp.entity;
                        params.transTargetEmpList = EMP.checkEmpList;
                    } else {
                        EMP.empList = emp.entity;
                        params.empList = EMP.empList;
                        params.transTargetEmpList = FH.transTargetEmpList.map(item => { return item.par });
                        EMP.checkEmpList = params.transTargetEmpList;
                    }
                }
                // TODO 카드 주문 관리 - 카드 지급 대상자 조회시
                if (pageType === "order") {
                    const emp = await ServiceExec.post('/api/card/doGetEmpList', params);
                    EMP.empList = emp.entity;

                    let totalListCount = EMP.empList.length;
                    let checkedListCount = 0;

                    // 선택한 대상자만 체크
                    if(FH.checkedEmpList != null) {
                        for(let i=0; i<EMP.empList.length; i++) {
                            if(FH.checkedEmpList.indexOf(EMP.empList[i].wptlEmpNo) > -1) {
                                EMP.empList[i].checked = true;
                                checkedListCount++;
                            } else {
                                EMP.empList[i].checked = false;
                            }
                        }
                    }

                    // 전체 체크 여부
                    if(checkedListCount > 0 && totalListCount == checkedListCount) {
                        params.empAllChecked = true;
                    } else {
                        params.empAllChecked = false;
                    }
                    
                    params.empList = EMP.empList;
                }
                params.deptList = dept.entity;
            }
            params.pageType = pageType;
            params.modalType = modalType;
            const html = await ServiceExec.htmlGet('/common/doGetHtml', { path:"modal/emp", htmlData: params });
            if ($("#empModal").length) $("#empModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#empModal").modal({show: true});

            EMP.methods.updateValidation(false);
        },

        updateValidation: function (removeInput) {
            var searchType = $("#searchType").val();
            var $input = $("#tt #searchText");
            if(removeInput)
                $input.val('');
            $input.off('input.numberOnly');

            if (searchType === '3') {
                $input.attr('maxlength', '4');

                $input.on('input.numberOnly', function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            } else {
                $input.removeAttr('maxlength');
            }
        },

        /**
         * 임직원 검색 유효성 체크
         * @param params
         * @returns {boolean}
         */
        empValid: function (params) {
            if ($("#empModal").length === 0) return true;
            EMP.validEl.html("");
            if (Util.isEmpty(params.searchText)) {
                Util.validCheck(EMP.scrollWrap, EMP.validEl, "사번 또는 이름을 입력해주세요.");
                return false;
            }
            return true;
        },

        /* ---------------------------------------- 복지/법인카드 상세 페이지 start ---------------------------------------- */
        /**
         * 복지/법인카드 상세 페이지 - 복지/법인 카드 지급 임직원 확인
         * @param empInfo
         */
        selectEmpInfo: function (wptlEmpNo) {
            const empInfo = EMP.empList.find(item => item.wptlEmpNo === Number(wptlEmpNo));
            if (!Util.isEmpty(empInfo)) {
                FH.methods.setEmpInfo(empInfo);
                $("#empModal").modal({show: false}).remove();
            }
        },
        /* ---------------------------------------- 복지/법인카드 상세 페이지 end ---------------------------------------- */

        /* ---------------------------------------- 지급/회수 페이지 start ---------------------------------------- */
        /**
         * 지급/회수 페이지 - 지급/회수 대상자 - 전체 체크 이벤트
         * @param event
         */
        empAllCheck: function (event) {
            $("#empModal input[name=empCheck]").prop("checked", event.target.checked);
            $("#empModal input[name=empCheck]").each(function(index, item) {
                $(item).prop("checked", event.target.checked);
                const par = $(item).attr("_par");
                if( $(item).is(":checked") ) {
                    EMP.checkEmpList = EMP.checkEmpList.concat(par);
                    EMP.checkEmpList = EMP.checkEmpList.filter( (item, pos) => EMP.checkEmpList.indexOf(item) === pos );
                } else {
                    EMP.checkEmpList = EMP.checkEmpList.filter( (item) => item !== par );
                }
            });
        },
        /**
         * 지급/회수 페이지 - 지급/회수 대상자 - 개별 체크 이벤트
         */
        empCheck: function () {
            let total = $("#empModal input[name=empCheck]").length;
            let emp = $("#empModal input[name=empCheck]:checked").length;
            $("#empAllCheck").prop("checked", total === emp);
        },
        /**
         * 지급/회수 페이지 - 지급/회수 대상자 리스트 확인
         */
        selectEmpInfoList: function (pageType) {
            EMP.validEl.html("");
            let empList = [];
            EMP.checkEmpList.forEach( function(value) {
                const empInfo = EMP.empList.find(item => item.par === value);
                if (!Util.isEmpty(empInfo)) empList.push(empInfo);
            });
            // $("#empModal input:checkbox[name=empCheck]:checked").each(function (index, item) {
            //     const par = $(item).attr("_par")
            //     const empInfo = EMP.empList.find(item => item.par === par);
            //     if (!Util.isEmpty(empInfo)) empList.push(empInfo);
            // })

            let prixMsg = pageType === 'trans' ? "지급/회수" : "정기지급";

            if (empList.length === 0) {
                Util.validCheck(EMP.scrollWrap, EMP.validEl, `${prixMsg} 대상자를 선택해주세요.`);
                return;
            }
            if (!confirm(`${prixMsg} 대상자를 등록 하시겠습니까?`)) return;
            setTimeout(() => {
                alert(`${prixMsg} 대상자를 등록 하였습니다.`);
                if(pageType === 'trans') {
                    FH.methods.setEmpInfoList(empList);
                } else {
                    FH.methods.setEmpInfoListByRegularTrans(empList);
                }
                $("#empModal").modal({show: false}).remove();
            }, 300)
        },
        /* ---------------------------------------- 지급/회수 페이지 end ---------------------------------------- */

        /* ---------------------------------------- 정기지급 페이지 start ---------------------------------------- */
        /**
         * 정기지급 페이지 - 정기지급 대상자 리스트 확인
         * @param modalType (정기지급 대상 선택: list, 정기지급 엑셀: excel)
         */
        selectEmpInfoListByRegularTrans: function (modalType = "list") {
            EMP.validEl.html("");
            let empList = [];
            EMP.checkEmpList.forEach( function(value) {
                const empInfo = EMP.empList.find(item => item.par === value);
                if (!Util.isEmpty(empInfo)) empList.push(empInfo);
            });
            if (empList.length === 0) {
                Util.validCheck(EMP.scrollWrap, EMP.validEl, "정기지급 대상자를 선택해주세요.");
                return;
            }
            if (!confirm("정기지급 대상자를 등록 하시겠습니까?")) return;
            setTimeout(() => {
                alert("정기지급 대상자를 등록 하였습니다.");
                FH.methods.setEmpInfoListByRegularTrans(empList, modalType);
                $("#empModal").modal({show: false}).remove();
            }, 300)
        },
        /* ---------------------------------------- 지급/회수 페이지 end ---------------------------------------- */

        /* ---------------------------------------- 카드 지급 대상자 추가 페이지 start ---------------------------------------- */
        /**
         * 카드 주문 내역 - 카드 지급 대상자 확인
         * @param empInfo
         */
        selectCardOrderEmpInfoList: function () {
            EMP.validEl.html("");
            let empList = [];
            $("#empModal input:checkbox[name=empCheck]:checked").each(function (index, item) {
                const wptlEmpNo = $(item).attr("_wptlEmpNo")
                const empInfo = EMP.empList.find(e => e.wptlEmpNo+'' === wptlEmpNo);
                if (!Util.isEmpty(empInfo)) {
                    empList.push(empInfo);
                }
            })
            if (empList.length === 0) {
                Util.validCheck(EMP.scrollWrap, EMP.validEl, "카드 지급 대상자를 선택해주세요.");
                return;
            }
            //if (!confirm("카드 지급 대상자를 추가 하시겠습니까?")) return;
            setTimeout(() => {
                //alert("카드 지급 대상자를 추가 하였습니다.");
                FH.methods.getSelectedEmpInfo(empList);
                $("#empModal").modal({show: false}).remove();
            }, 300)
        },
        /* ---------------------------------------- 복지/법인카드 상세 페이지 end ---------------------------------------- */
    },
    init: function () {
        for (let eventFunc in EMP.events) {
            EMP.events[eventFunc]();
        }
    }
}

window.EMP = EMP;
EMP.init();