const Grid = tui.Grid;
const Pagination = tui.Pagination;
const Editor = toastui.Editor;

// let _this;
const Toast = {
    currentDate: "",
    selectDate: "",
    selectYear: "",
    selectMonth: "",
    dateRagne: {},
    listInfo: {},
    grid: null,
    grids: [],
    gridsBodyHeight: [],
    pagination: null,
    paginationFlag: false,
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $("#searchText").on("keyup", function (e) {
                if (e.keyCode === 13)
                    Toast.methods.searchList();
            })
        },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // 검색 영역 - 돋보기 클릭시
            $(".h2-head .btn-srch").on("click", function (){
                $(this).closest(".h2-head").addClass("srch-on");
                $(this).closest(".h2-head").siblings(".board-srch").slideDown(300);

            })

            // $("#columnCustomize").on("click", function (){
            //     console.log('::Clicked::')
            // })

            // 검색 영역 - X 클릭시
            $(".h2-head .btn-srch-close").on("click", function (){
                $(this).closest(".h2-head").removeClass("srch-on");
                $(this).closest(".h2-head").siblings(".board-srch").slideUp(300);
            })
            // 검색 영역 - datepicker "날짜" 선택 변경시
            $("input:radio[name=dateSelect]").on("click", function () {
                let dateType = $(this).val();
                let dateRange = Util.dateSelect(dateType);
                if( $(this).data( "option" ) !== "optional" ) {
                    if (!Util.isEmpty(dateRange.startDate)) {
                        $("#searchStartDate").val(dateRange.startDate);
                    }
                    if (!Util.isEmpty(dateRange.endDate)) {
                        $("#searchEndDate").val(dateRange.endDate);
                    }
                } else {
                    let dateRange = Util.dateSelect($(this).val());
                    $("#searchStartDate").val(dateRange.startDate);
                    $("#searchEndDate").val(dateRange.endDate);
                }
            });
            $("input:radio[name=shippingDateSelect]").on("click", function () {
                let dateType = $(this).val();

                let dateRange = Util.dateSelect(dateType);
                if( $(this).data( "option" ) !== "optional" ) {
                    if (!Util.isEmpty(dateRange.startDate)) {
                        $("#shippingStartDate").val(dateRange.startDate);
                    }
                    if (!Util.isEmpty(dateRange.endDate)) {
                        $("#shippingEndDate").val(dateRange.endDate);
                    }
                } else {
                    let dateRange = Util.dateSelect($(this).val());
                    $("#shippingStartDate").val(dateRange.startDate);
                    $("#shippingEndDate").val(dateRange.endDate);
                }
            });
            // 검색 영역 - 초기화 클릭시
            $(".btns .reset").on("click", function () {
                Toast.methods.resetSearch();
                if(typeof FH.methods.resetSearchInit === "function") {
                    FH.methods.resetSearchInit();
                }
            })
            // 검색 영역 - 조회 클릭시
            $(".btns .search").on("click", function () {
                Toast.methods.searchList();
            })
        },
        /**
         * change 이벤트
         */
        changeEvent: function () {
            // 테이블 우측 상단 - OO개씩 보기 변경시
            $("#viewCount, #viewOrder").on("change", function () {
                Toast.methods.changeViewCount();
            });
            $("#searchStartDate").on("change", function () {
                if( Util.isEmpty(Toast.dateRagne) || (!Util.isEmpty(Toast.dateRagne) && Toast.dateRagne.startDate !== $(this).val()) ) {
                    if( $("input:radio[name=dateSelect]:eq(0)").data("option") !== "optional" ) {
                        $("input:radio[name=dateSelect]:eq(0)").trigger("click");
                    }
                }
            });
            $("#searchEndDate").on("change", function () {
                if( Util.isEmpty(Toast.dateRagne) || (!Util.isEmpty(Toast.dateRagne) && Toast.dateRagne.endDate !== $(this).val()) ) {
                    if( $("input:radio[name=dateSelect]:eq(0)").data("option") !== "optional" ) {
                        $("input:radio[name=dateSelect]:eq(0)").trigger("click");
                    }
                }
            });
            $("#shippingStartDate").on("change", function () {
                if( Util.isEmpty(Toast.dateRagne) || (!Util.isEmpty(Toast.dateRagne) && Toast.dateRagne.startDate !== $(this).val()) ) {
                    if( $("input:radio[name=shippingDateSelect]:eq(0)").data("option") !== "optional" ) {
                        $("input:radio[name=shippingDateSelect]:eq(0)").trigger("click");
                    }
                }
            });

            // 출고 기간 - 종료일 변경시
            $("#shippingEndDate").on("change", function () {
                if( Util.isEmpty(Toast.dateRagne) || (!Util.isEmpty(Toast.dateRagne) && Toast.dateRagne.endDate !== $(this).val()) ) {
                    if( $("input:radio[name=shippingDateSelect]:eq(0)").data("option") !== "optional" ) {
                        $("input:radio[name=shippingDateSelect]:eq(0)").trigger("click");
                    }
                }
            });

            window.onresize = function() {
                Toast.methods.setGridHeight(200);
            }
        }
    },
    methods: {
        /* ---------------------------------------- 검색영역 및 보기개수 관련 start ---------------------------------------- */
        /**
         * 검색 날짜 생성후 조회
         * @param operate
         * @returns {boolean}
         */
        setDate: function (operate, reload = true) {
            // console.log(Toast.selectYear)
            // console.log(Toast.selectMonth)

            if (Util.isEmpty(operate)) {
                // 커스텀 셀렉트 박스
                if($(".SlectBox").length) {
                    $(".SlectBox").SumoSelect();
                    $(".SlectBox").on("sumo:closing", function () {
                        FH.getList();
                    })
                }
                Toast.currentDate = new Date();
                Toast.selectDate = Util.isEmpty(Toast.selectDate) ? new Date() : Toast.selectDate;
            }
            let currentYear = Toast.currentDate.getFullYear();
            let selectYear = Toast.selectDate.getFullYear();
            if (operate === "prev") {
                if (selectYear <= 1970) return false;
                Toast.selectDate.setFullYear(selectYear - 1);
            }
            if (operate === "next") {
                if (selectYear >= currentYear) return false;
                Toast.selectDate.setFullYear(selectYear + 1);
            }
            let currentMonth = Toast.currentDate.getMonth() + 1;
            Toast.selectYear = Toast.selectDate.getFullYear();
            let selectMonth = (currentYear === Toast.selectYear) ? currentMonth : 12;
            $("#selectYear").text(Toast.selectYear + "년");
            if($("#selectMonth").length) {
                let html = '<option value="">전체</option>';
                for (let i = 1; i <= selectMonth; i++) {
                    html += '<option value="' + (i < 10 ? ("0" + i) : i) + '">' + i + '월</option>';
                }
                $("#selectMonth").html(html);
            }

            if($(".SlectBox").length) {
                $(".SlectBox")[0].sumo.reload();
                if (!Util.isEmpty(Toast.selectMonth)) {
                    $(".SlectBox")[0].sumo.selectItem(Toast.selectMonth);
                    Toast.selectMonth = "";
                }
            }

            if( reload ) {
                FH.getList();
            }
        },
        /**
         * 검색 form 초기화
         */
        resetSearch: function () {
            $("#searchForm").each(function () {
                this.reset();
                //removing error messages when reset
                $("#dateErrorMessage").text("").css("display", "none");
                //removing button disabled when reset
                $("#search_btn").prop("disabled", false);
                $("#download_btn").prop("disabled", false);
                
                $("#searchForm input[type=hidden]").val("");
                $("#searchForm select").prop("selectedIndex", 0);
                if ($("#searchForm #searchStartDate").length) $("#searchForm #searchStartDate").attr("disabled", false);
                if ($("#searchForm #searchEndDate").length) $("#searchForm #searchEndDate").attr("disabled", false);
            })
        },
        /**
         * 검색 form 조회
         */
        searchList: function () {
            // 조회 후 닫기 체크시, 검색영역 닫기
            if ($("#afterClose").is(":checked")) {
                $(".h2-head").removeClass("srch-on");
                $(".h2-head").siblings(".board-srch").slideUp(300);
            }

            // 검색 기간 체크
            if ($("#searchStartDate").length && $("#searchEndDate").length) {
                let startDate = $("#searchStartDate").val();
                let endDate = $("#searchEndDate").val();

                if( !Util.isEmpty(FH.searchPeriod) ) {
                    if (Util.isEmpty(startDate) || Util.isEmpty(endDate)) {
                        alert("검색 기간이 입력 형식에 맞지 않습니다.");
                        return;
                    }
                }

                if (!Util.isEmpty(startDate) && !Util.isEmpty(endDate)) {
                    let sdt = new Date(startDate);
                    let edt = new Date(endDate);
                    if (sdt > edt) {
                        alert("검색 기간이 입력 형식에 맞지 않습니다.");
                        return;
                    }
                    if( !Util.isEmpty(FH.searchPeriod) ) {
                        let tSdt = new Date(endDate);
                        tSdt.setMonth(edt.getMonth() - FH.searchPeriod);
                        if( tSdt > sdt ) {
                            let message;
                            if( Util.isEmpty(FH.searchPeriodMessage) ) {
                                message = "검색 가능한 기간은 " + FH.searchPeriod + "개월 입니다.";
                            } else {
                                message = FH.searchPeriodMessage;
                            }
                            alert( message );
                            return;
                        }
                    }
                }
            }

            if ($("#shippingStartDate").length && $("#shippingEndDate").length) {
                let shippingStartDate = $("#shippingStartDate").val();
                let shippingEndDate = $("#shippingEndDate").val();

                // Only validate if BOTH dates are entered
                if (!Util.isEmpty(shippingStartDate) && !Util.isEmpty(shippingEndDate)) {
                    let sdt = new Date(shippingStartDate);
                    let edt = new Date(shippingEndDate);
                    if (sdt > edt) {
                        alert("검색 기간이 입력 형식에 맞지 않습니다.");
                        return;
                    }
                }
            }
            FH.page = 1;
            FH.getList();
        },
        /**
         * 리스트 보기 개수 변경
         */
        changeViewCount: function () {
            let viewCount = Number($("#viewCount").val());
            let viewOrder = $("#viewOrder").val();
            FH.page = 1;
            FH.limit = viewCount;
            if($('#viewOrder').length) FH.pageSortBy = viewOrder;
            Toast.pagination.setItemsPerPage(viewCount);
            FH.getList();
        },
        /**
         * 리스트 정보 쿠키에 저장
         */
        setListInfo: function () {
            Toast.listInfo.path = window.location.pathname;                                            // 현재 페이지 path
            Toast.listInfo.scroll = $(".content").scrollTop();                                         // 스크롤 위치
            if (FH.params) {
                Toast.listInfo.params = FH.params;                                                     // 검색 영역 params
                if ($(".content-body .h2-head").length)
                    Toast.listInfo.params.isOpen = $(".content-body .h2-head").hasClass('srch-on'); // 검색 영역 펼침 여부
                if ($("#afterClose").length)
                    Toast.listInfo.params.afterClose = $("#afterClose").is(":checked");                // 검색 영역 "조회 후 닫기" 체크 여부
            }
            Util.setCookie("listInfo", encodeURIComponent(JSON.stringify(Toast.listInfo)))
        },
        /**
         * 리스트 정보 쿠키에서 가져온 후 바인딩
         * @param callback (콜백 method)
         */
        getListInfo: function (callback) {
            let listInfo = Util.getCookie("listInfo");
            if (!Util.isEmpty(listInfo)) {
                Toast.listInfo = JSON.parse(decodeURIComponent(listInfo));
                if (window.location.pathname === Toast.listInfo.path) {
                    for (const key in Toast.listInfo.params) {
                        switch (key) {
                            case "isOpen":
                                if ($(".content-body .h2-head").length && $(".content-body .board-srch").length) {
                                    if (Toast.listInfo.params[key]) {
                                        $(".content-body .h2-head").addClass('srch-on');
                                        $(".content-body .board-srch").css("display", "block");
                                    }
                                }
                                break;
                            case "afterClose":
                                if ($("#afterClose").length)
                                    $("#afterClose").prop("checked", Toast.listInfo.params[key]);
                                break;
                            case "page":
                                if (FH.page)
                                    FH.page = Toast.listInfo.params[key];
                                break;
                            case "limit":
                                if (FH.limit) {
                                    FH.limit = Toast.listInfo.params[key];
                                    $("#viewCount").val(FH.limit);
                                }
                                break;
                            case "dateSelect" :
                                if ($("input:radio[name=dateSelect]").length) {
                                    if (!Util.isEmpty(Toast.listInfo.params[key])) {
                                        $("input:radio[name=dateSelect][value=" + Toast.listInfo.params[key] + "]").prop("checked", true);
                                        // $("#searchStartDate").prop("disabled", true);
                                        // $("#searchEndDate").prop("disabled", true);
                                    }
                                }
                                break;
                            case "shippingDateSelect":
                                if ($("input:radio[name=shippingDateSelect]").length) {
                                    if (!Util.isEmpty(Toast.listInfo.params[key])) {
                                        $("input:radio[name=shippingDateSelect][value=" + Toast.listInfo.params[key] + "]").prop("checked", true);
                                    }
                                }
                                break;
                            case "searchYear" :
                                if (!Util.isEmpty(Toast.listInfo.params[key])) {
                                    Toast.selectYear = new Date(Toast.listInfo.params[key]);
                                }
                                break;
                            case "searchMonth" :
                                if (!Util.isEmpty(Toast.listInfo.params[key])) {
                                    Toast.selectMonth = Toast.listInfo.params[key];
                                }
                                break;
                            default:
                                if ($("#" + key).length) {
                                    $("#" + key).val(Toast.listInfo.params[key]);
                                }
                                break;
                        }
                    }
                } else {
                    Toast.listInfo = {};
                }
                Util.deleteCookie("listInfo");
            }
            if (callback)
                callback();
        },
        /**
         * 리스트 정보에 스크롤 있으면 스크롤 이동
         */
        setScroll: function () {
            if (!Util.isEmpty(Toast.listInfo)) {
                if (window.location.pathname === Toast.listInfo.path) {
                    let scroll = Toast.listInfo.scroll;
                    if (scroll> 0) {
                        setTimeout(() => {
                            $(".content").scrollTop(scroll);
                        })
                    }
                }
                Toast.listInfo = {};
            }
        },
        /* ---------------------------------------- 검색영역 및 보기개수 관련 end ---------------------------------------- */

        /* ---------------------------------------- table 관련 (Grid, Paging) start ---------------------------------------- */
        /**
         * toast grid 생성
         */
        setGrid: function ({el = "grid",
                            scrollX = true,
                            scrollY = true,
                            rowHeaders = [],
                            columns,
                            clickEventColumns = [],
                            clickFunction = () => {},
                            summary = {},
                            bodyHeight = "fitToParent"}) {

            let gridIndex = Toast.grids.length;

            Toast.grids[gridIndex] = new Grid({
                el: document.getElementById(el),
                scrollX: scrollX,   // 스크롤 x 영역
                scrollY: scrollY,   // 스크롤 y 영역
//                bodyHeight: "auto",
                bodyHeight: bodyHeight,
                minBodyHeight: 52,
                rowHeight: "auto",
                minRowHeight: 52,
                header: {
                    height: 52
                },
                rowHeaders: rowHeaders,
                columns: columns,
                data: [],
                summary: summary,
                onGridUpdated: function() {
                    if( bodyHeight === "fitToParent" ) {
                        Toast.methods.setGridHeight(0, gridIndex);
                        Toast.methods.setGridHeight(300, gridIndex);
                    }
                }
            })
            // 클릭 이벤트 등록 (특정 컬럼만)
            if (!Util.isEmpty(clickEventColumns)) {
                Toast.grids[gridIndex].on("click", function(e) {
                    if (!clickEventColumns.includes(e.columnName)) {
                        e.stop();
                        return false;
                    }
                    clickFunction(Toast.grids[gridIndex].getRow(e.rowKey), e.columnName);
                })
            }
            Toast.gridsBodyHeight[gridIndex] = bodyHeight;
            Toast.grid = Toast.grids[gridIndex];
            if (el !== "grid") return Toast.grids[gridIndex];
        },
        /**
         * toast pagination 생성 (grid pagination 아님, custom 생성)
         */
        getPagination: function () {
            Toast.pagination = new Pagination(document.getElementById("pagination"), {
                totalItems: FH.totalCount,
                itemsPerPage: FH.limit,
                page: FH.page,
                visiblePages: 10,
                template: {
                    page: '<a href="#">{{page}}</a>',
                    currentPage: '<a href="#" class="active">{{page}}</a>',
                    moveButton: '<a href="#" class="{{type}}"><span class="hidden">{{type}}</span></a>',
                    disabledMoveButton: '<a href="#" class="{{type}} disabled"><span class="hidden">{{type}}</span></a>',
                    moreButton: '<a style="display: none;">...</a>'
                }
            })
            // pagination 클릭시, 변경 전 이벤트
            Toast.pagination.on("beforeMove", function(e) {
                Toast.paginationFlag = true;
                FH.page = e.page;
                FH.getList();
                if ($(".tui-grid-container").length) {
                    let scrollTop = Number($(".content").scrollTop() + $(".tui-grid-container").offset().top) - 150;
                    $(".content").scrollLeft(0);
                    $(".content").animate({scrollTop: scrollTop}, 300);
                }
            });
        },
        /**
         * toast pagination 생성 및 업데이트
         * @returns {boolean}
         */
        setPagination: function () {
            // paging 없으면 생성
            if (Toast.pagination == null) {
                Toast.methods.getPagination();
                return false;
            }
            if (Toast.paginationFlag) { // pagination 클릭시, 페이지 사용 flag 변경
                Toast.paginationFlag = false;
            } else {                    // 검색,보기 개수 변경시 pagination 리셋
                Toast.pagination.reset(FH.totalCount);
            }
        },
        /* ---------------------------------------- table 관련 (Grid, Pagination) end ---------------------------------------- */

        /* ---------------------------------------- Editor 관련 start ---------------------------------------- */
        setEditor: function (el) {
            let toastUiEditor = new Editor({
                el: document.getElementById(el),
                initialEditType: "wysiwyg",
                previewStyle: "tab",
                height: "460px",
                initialValue: ""
            });
            toastUiEditor.addHook("blur", function() {
                let editorText = toastUiEditor.getMarkdown();
                let byteLength = Util.checkByte(editorText);
                byteLength = byteLength > 0 ? Util.numberFormat(byteLength) : "0";
                let editorEl = toastUiEditor.getEditorElements().wwEditor;
                $(editorEl).closest("td").find("span.editorByte").text(byteLength);
            })
            toastUiEditor.addHook("change", function() {
                let editorText = toastUiEditor.getMarkdown();
                let byteLength = Util.checkByte(editorText);
                byteLength = byteLength > 0 ? Util.numberFormat(byteLength) : "0";
                let editorEl = toastUiEditor.getEditorElements().wwEditor;
                $(editorEl).closest("td").find("span").text(byteLength);
            })
            toastUiEditor.addHook("addImageBlobHook", async function(blob, callback) {
                const params = {
                    file : blob
                }
                // console.log(params);
                const res = await ServiceExec.formPost('/common/doFileUpload', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    callback(Util.getFilePath(entity.fileUrlPath));
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
            })
            return toastUiEditor;
        },
        getViewer: function (el) {
            Editor.factory({
                el: document.getElementById(el),
                viewer: true,
                height: "460px",
                initialValue: ""
            });
        },
        setGridHeight: function( interval, gridIndex ) {
            setTimeout( () => {
                let startIdx, endIdx;
                if( !Util.isEmpty(gridIndex) ) {
                    startIdx = gridIndex;
                    endIdx = gridIndex + 1;
                } else {
                    startIdx = 0;
                    endIdx = Toast.grids.length;
                }

                for( let v = startIdx ; v < endIdx; v++ ) {
                    if( Toast.gridsBodyHeight[v] === "fitToParent" ) {
                        let contentHeight = $("div.content-inner").outerHeight();
                        //let gridContentHeight = $(".tui-grid-rside-area .tui-grid-body-container").eq(v).outerHeight();
                        let gridContentHeight = $(Toast.grids[v].el).find(".tui-grid-rside-area .tui-grid-body-container").outerHeight();
                        //const $gridContent = $("div.grid-content").eq(v);
                        const $gridContent = $(Toast.grids[v].el).closest(".grid-content");
                        if (Toast.grids[v].getRowCount() < 1) {
                            //gridContentHeight = $(".tui-grid-layer-state-content").eq(v).outerHeight() + 1;
                            gridContentHeight = $(Toast.grids[v].el).find(".tui-grid-layer-state-content").outerHeight() + 1;
                        }

                        if ($gridContent.length) {
                            if (contentHeight < 560) {
                                contentHeight = 560;
                            }
                            if (gridContentHeight > contentHeight) {
                                contentHeight -= 180;
                                $gridContent.height(contentHeight);
                            } else {
                                contentHeight -= 180;
                                $gridContent.css("height", "");
                                if (gridContentHeight > contentHeight) {
                                    Toast.grids[v].setBodyHeight(gridContentHeight - (gridContentHeight - contentHeight) + 16);
                                } else {
                                    Toast.grids[v].setBodyHeight(gridContentHeight + 16);
                                }
                            }
                            Toast.grids[v].refreshLayout();
                        }
                    }
                }
            }, interval );
        }
        /* ---------------------------------------- Editor 관련 end ---------------------------------------- */
    },
    init: function () {
        for (let eventFunc in Toast.events) {
            Toast.events[eventFunc]();
        }
    }
}

Toast.init();
window.Toast = Toast;