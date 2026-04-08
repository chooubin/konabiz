// 사용처/제한처 modal js
// let _this;
const USING_MC = {
    usingEl: null,
    usingInfo: {},
    usingList: [],
    pagination: null,
    paginationFlag: false,
    page: 1,
    limit: 50,
    totalCount: 0,
    virtualNum: 0,
    modalType: "info",
    initSearch: "N",
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
            $(document).on("change", "#usingMerchantModal input:checkbox[name=usingCheck]", function() {
                $("#checkAll").prop("checked", $("#tabPlace tr:gt(0):visible input[name=usingCheck]:checked").length === $("#tabPlace tr:gt(0):visible").length);
                if($("#checkCntText").length ) {
                    if($("#tabPlace tr:gt(0):visible input[name=usingCheck]:checked").length) {
                        $("#checkCntText").show();
                    } else {
                        $("#checkCntText").hide();
                    }
                }
                if( $(this).is(":checked") ) {
                    USING_MC.usingList.push($(this).val());
                } else {
                    USING_MC.usingList = USING_MC.usingList.filter((item) => item !== $(this).val());
                }
                USING_MC.usingList = USING_MC.usingList.filter((v, idx) => USING_MC.usingList.indexOf(v) === idx);
                $("#checkCnt").text( USING_MC.usingList.length );
            });
        }
    },
    methods: {
        checkAll: function (event) {
            const isChecking = event.target.checked;
            let confirmMessage;

            if (isChecking) {
                confirmMessage = "해당 페이지 내 모든 항목을 선택하시겠습니까?\n기존에 선택된 항목을 포함하여 전체가 선택 상태로 변경됩니다.";
            } else {
                confirmMessage = "해당 페이지 내 모든 항목의 선택을 해제하시겠습니까?\n전체 항목이 선택 해제 상태로 변경됩니다.";
            }

            if (!confirm(confirmMessage)) {
                event.target.checked = !isChecking;
                return;
            }
            $("#tabPlace input[name=usingCheck]").each(function(index, item) {
                $(item).prop("checked", event.target.checked);
                if( $(item).is(":checked") ) {
                    USING_MC.usingList.push($(item).val());
                } else {
                    USING_MC.usingList = USING_MC.usingList.filter( (v) => v !== $(item).val() );
                }
            });
            USING_MC.usingList = USING_MC.usingList.filter((v, idx) => USING_MC.usingList.indexOf(v) === idx);
            $("#checkCnt").text( USING_MC.usingList.length );
        },
        /**
         * 사용처/제한처 설정 정보 세팅
         * @param el
         * @param params
         * @returns {Promise<void>}
         */
        setUsingInfo: async function (el, params) {
            USING_MC.usingEl = $(el).closest(".flip-box").length ? $(el).closest(".flip-box") : null;
            USING_MC.usingInfo = params;
            USING_MC.usingInfo.bizPlaceTypeNm = USING_MC.usingInfo.placeType === "BLOCK_PLAYER" ? "제한 가맹점" : "사용 가맹점";
            USING_MC.methods.openUsingModal("info");
        },
        /**
         * 사용처/제한처 modal 열기
         * @param modalType (상세: info, 수정: mod)
         * @returns {Promise<void>}
         */
        openUsingModal: async function (modalType) {
            const params = {
                path: "modal/using_merchant",
                htmlData: {
                    modalType: modalType,
                    usingDetail: { ...USING_MC.usingInfo }
                }
            }
            if(modalType === "info") {
                USING_MC.usingList = [];
            }
            USING_MC.pagination = null;
            USING_MC.page = 1;
            USING_MC.initSearch = "Y";
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#usingMerchantModal").length) $("#usingMerchantModal").remove();
            $("body").children("a.btn-top").after(html);
            await USING_MC.methods.doGetPlayerInfoList(modalType, "Y");

            $("#usingMerchantModal").modal({show: true});
            USING_MC.modalType = modalType;
        },
        searchPlayerList: async function (modalType) {
            const searchType = $("#searchType").val();
            const searchText = $("#searchText").val();
            if(searchType === "1" && searchText.trim().length < 2) {
                alert("가맹점명을 2글자 이상 입력해주세요.");
                return;
            }
            if(searchType === "2" && searchText.trim().length < 1) {
                alert("가맹점코드를 입력해주세요.");
                return;
            }
            USING_MC.initSearch = "N";
            USING_MC.page = 1;
            if( modalType === "mod" ) {
                $(".total").html("총 선택 <strong id=\"checkCnt\">0</strong> / 검색결과 <strong id=\"totalCnt\">0</strong>");
            }
            startLoading();
            await USING_MC.methods.doGetPlayerInfoList(modalType);
        },
        doGetPlayerInfoList: async function(modalType) {
            const searchType = $("#searchType").val();
            const searchText = $("#searchText").val();
            if(USING_MC.initSearch === "N" && searchType === "1" && searchText.trim().length < 2) {
                alert("가맹점명을 2글자 이상 입력해주세요.");
                return;
            }
            if(USING_MC.initSearch === "N" && searchType === "2" && searchText.trim().length < 1) {
                alert("가맹점코드를 입력해주세요.");
                return;
            }
            let params = {
                page: USING_MC.page,
                limit: USING_MC.limit,
                searchType: $("#searchType").val(),
                searchText: $("#searchText").val(),
                initSearch: USING_MC.initSearch
            }
            params = {...params, ...USING_MC.usingInfo};

            startLoading();
            let url;
            if (modalType === "mod") {
                url = "/api/product/doGetSettingPlayerInfo";
            } else {
                url = "/api/product/doGetCheckPlayerInfo";
            }

            // console.log(params);
            const res = await ServiceExec.post(url, params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if(!Util.isEmpty(entity) && !Util.isEmpty(entity.groupPlayerList)) {
                    if(modalType === 'info' && params.searchText === "") {
                        USING_MC.usingList = entity.bizPlayerCodeList;
                    }
                    $("#checkCnt").text( USING_MC.usingList.length );
                    $("#totalCnt").text(entity.groupPlayerList.totalCount);
                    USING_MC.totalCount = entity.groupPlayerList.totalCount;
                    USING_MC.virtualNum = entity.groupPlayerList.virtualNum;
                    await USING_MC.methods.setContent(entity.groupPlayerList.list, modalType);

                } else {
                    USING_MC.usingList = [];
                    $("#totalCnt").text("0");
                    USING_MC.totalCount = 0;
                    USING_MC.virtualNum = 0;
                    await USING_MC.methods.setContent(null, modalType);
                }

                if( modalType === "mod" ) {
                    $("#checkAll").prop("checked", USING_MC.totalCount > 0 && $("#tabPlace input[name=usingCheck]:checked").length === $("#tabPlace input[name=usingCheck]").length);
                }
                USING_MC.methods.setPagination();
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
            USING_MC.modalType = modalType;
        },
        setContent: async function (items, modalType) {
            const params = {
                path: "modal/using_merchant_content",
                htmlData: {
                    virtualNum: USING_MC.virtualNum,
                    bizPlayerInfoList: items,
                    modalType: modalType
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $("#playerList").html(html);

            if( modalType === 'mod' ) {
                $("#usingMerchantModal input:checkbox[name=usingCheck]").each(function (index, item) {
                    let code = $(item).val();
                    if (USING_MC.usingList.includes(code)) {
                        $(item).prop("checked", true);
                    }
                });
            }

            $("#usingMerchantModal .overflow-auto").animate({scrollTop: 0}, 300);
        },
        /**
         * toast pagination 생성 (grid pagination 아님, custom 생성)
         */
        getPagination: function () {
            USING_MC.pagination = new tui.Pagination($("#usingMerchantModal .pagenate").get(0), {
                totalItems: USING_MC.totalCount,
                itemsPerPage: USING_MC.limit,
                page: USING_MC.page,
                visiblePages: 7,
                template: {
                    page: '<a href="#">{{page}}</a>',
                    currentPage: '<a href="#" class="active">{{page}}</a>',
                    moveButton: '<a href="#" class="{{type}}"><span class="hidden">{{type}}</span></a>',
                    disabledMoveButton: '<a href="#" class="{{type}} disabled"><span class="hidden">{{type}}</span></a>',
                    moreButton: '<a style="display: none;">...</a>'
                }
            })
            // pagination 클릭시, 변경 전 이벤트
            USING_MC.pagination.on("beforeMove", function(e) {
                USING_MC.paginationFlag = true;
                USING_MC.page = e.page;
                USING_MC.methods.doGetPlayerInfoList(USING_MC.modalType);
            });
        },
        /**
         * toast pagination 생성 및 업데이트
         * @returns {boolean}
         */
        setPagination: function () {
            // paging 없으면 생성
            if (USING_MC.pagination == null) {
                USING_MC.methods.getPagination();
                return false;
            }
            if(USING_MC.pagination._options.totalItems != USING_MC.totalCount) {
                USING_MC.methods.getPagination();
                return false;
            }
            if (USING_MC.paginationFlag) { // pagination 클릭시, 페이지 사용 flag 변경
                USING_MC.paginationFlag = false;
            } else {                    // 검색,보기 개수 변경시 pagination 리셋
                USING_MC.pagination.reset(USING_MC.totalCount);
            }
        },
        /**
         * 사용처/제한처 설정
         * @returns {Promise<void>}
         */
        doSettingPlayerInfo: async function () {
            if (!USING_MC.methods.usingValid()) return;
            const params = {
                wptlEntpNo: USING_MC.usingInfo.wptlEntpNo,
                wptlPrdNo: USING_MC.usingInfo.wptlPrdNo,
                crdCashId: USING_MC.usingInfo.crdCashId,
                playerList: USING_MC.usingList,
                placeType: USING_MC.usingInfo.placeType
            }
            if (!confirm(USING_MC.usingInfo.bizPlaceTypeNm + " 설정을 저장하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/product/doSettingPlayerInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(USING_MC.usingInfo.bizPlaceTypeNm + " 설정이 저장되었습니다.");
                USING_MC.methods.openUsingModal("info");
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
         * 사용처/제한처 설정 유효성 체크
         * @returns {boolean}
         */
        usingValid: function () {
            if (USING_MC.usingList.length === 0) {
                if(USING_MC.usingInfo.placeType === "BLOCK_PLAYER") {
                    alert("결제를 제한할 가맹점을 선택해주세요.");
                } else {
                    alert("결제를 허용할 가맹점을 선택해주세요.");
                }
                return false;
            }
            return true;
        },
        closeUsingModal: function () {
            $("#usingMerchantModal").modal({show: false}).remove();
        },

        downloadExcel:function(type){
            let params = {
                page: USING_MC.page,
                limit: -1,
                searchType: $("#searchType").val(),
                searchText: $("#searchText").val(),
                initSearch: USING_MC.initSearch
            }
            params = {...params, ...USING_MC.usingInfo};

            if (USING_MC.totalCount != 0) {
                ServiceExec.downPost("/api/product/doGetSettingPlayerInfo", params);
                return;
            }

            alert("다운로드 할 데이터가 없습니다.");
        },
    },
    init: function () {
        // _this = this;
        for (let eventFunc in USING_MC.events) {
            USING_MC.events[eventFunc]();
        }
    }
}

USING_MC.init();
window.USING_MC = USING_MC;