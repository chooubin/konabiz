// 사용처/제한처 modal js
// let _this;
const USING = {
    usingEl: null,
    usingInfo: {},
    usingList: [],
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
            $(document).on("change", "#usingModal #bizPlaceInfo", function() {
                const bizplaceValue = $("#bizPlaceInfo").val();
                $("#subPlaceInfo option").each( function (idx, item) {
                    if( bizplaceValue === "" ) {
                        if( idx < 1 ) {
                            $(this).prop("selected", true);
                        }
                        $(this).show();
                    } else {
                        if( idx > 0 ) {
                            const level1 = $(this).data("bizplace");
                            if( level1 === bizplaceValue ) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                        } else {
                            $(this).prop("selected", true);
                        }
                    }
                });

                $("#subPlaceInfo").prop("disabled", bizplaceValue === "");
            });

            $(document).on("change", "#usingModal input:checkbox[name=usingCheck]", function() {
                $("#checkAll").prop("checked", $("#tabPlace tr:gt(0):visible input[name=usingCheck]:checked").length === $("#tabPlace tr:gt(0):visible").length);
                $("#checkCnt").text( $("#tabPlace tr:gt(0) input[name=usingCheck]:checked").length );
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
            $("#tabPlace tr:gt(0):visible").each(function(index, item) {
                $(item).find("input[name=usingCheck]").prop("checked", event.target.checked);
                $("#checkCnt").text( $("#tabPlace tr:gt(0) input[name=usingCheck]:checked").length );
            });
        },
        search: function () {
            const searchText = $("#searchText").val();
            let bizplace = "", subplace = "";
            if( $("#bizPlaceInfo option").index($("#bizPlaceInfo option:selected")) > 0 ) {
                bizplace = $("#bizPlaceInfo").val();
            }
            if( $("#subPlaceInfo option").index($("#subPlaceInfo option:selected")) > 0 ) {
                subplace = $("#subPlaceInfo").val();
            }
            const searchKey = bizplace + subplace;

            $("#tabPlace tr:gt(0)").each(function(idx, item) {
                let show = false;
                const tabBizPlace = $(this).find("td:eq(1)").text();
                const tabSubPlace = $(this).find("td:eq(2)").text();
                const tabPlaceCode = $(this).find("td:eq(3)").text();
                let key = "";
                if( bizplace != "" ) {
                    key += tabBizPlace;
                }
                if( subplace != "" ) {
                    key += tabSubPlace;
                }
                if( searchKey === key && (searchText.trim() === "" || tabBizPlace.indexOf(searchText) > -1
                                            || tabSubPlace.indexOf(searchText) > -1 || tabPlaceCode.indexOf(searchText) > -1) ) {
                    show = true;
                }

                if( show ) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
            if(Util.isEmpty(bizplace) && Util.isEmpty(searchText)) {
                $("span.txt-total").text("전체");
            } else {
                $("span.txt-total").text("검색결과");
            }
            if($("#tabPlace tr:gt(0):visible").length < 1) {
                $("#tabPlace").append("<tr class='nodata'><td colspan='4' style='font-size: 14px; color: #ccc;'>No data.</td></tr>");
            } else {
                $("#tabPlace .nodata").remove();
            }

            $("#totalCnt").text( $("#tabPlace tr:not(.nodata):gt(0):visible").length );
            $("#checkCnt").text( $("#tabPlace tr:not(.nodata):gt(0) input[name=usingCheck]:checked").length );
            $("td[name=rownum]:visible").each(function(idx, item) {
                $(this).text(idx + 1);
            });
            $("#checkAll").prop("checked", $("#tabPlace tr:not(.nodata):gt(0):visible").length > 0 && $("#tabPlace tr:not(.nodata):gt(0):visible input[name=usingCheck]:checked").length === $("#tabPlace tr:not(.nodata):gt(0):visible").length);
        },
        /**
         * 사용처/제한처 설정 정보 세팅
         * @param el
         * @param params
         * @returns {Promise<void>}
         */
        setUsingInfo: async function (el, params) {
            USING.usingEl = $(el).closest(".flip-box").length ? $(el).closest(".flip-box") : null;
            USING.usingInfo = params;
            USING.usingInfo.bizPlaceTypeNm = USING.usingInfo.placeType === "BLOCK_BIZTYPE" ? "제한 업종" : "사용 업종";
            USING.methods.openUsingModal("info");
        },
        /**
         * 사용처/제한처 modal 열기
         * @param modalType (상세: info, 수정: mod)
         * @returns {Promise<void>}
         */
        openUsingModal: async function (modalType) {
            const params = {
                path: "modal/using",
                htmlData: {
                    modalType: modalType,
                    usingDetail: { ...USING.usingInfo }
                }
            }

            if (modalType === "info") {
                const res = await ServiceExec.post('/api/product/doGetCheckBizPlaceInfo', USING.usingInfo);
                params.htmlData.usingDetail.bizPlaceInfoList = res.entity;
            } else {
                const res = await ServiceExec.post('/api/product/doGetSettingBizPlaceInfo', USING.usingInfo);
                params.htmlData.usingDetail.bizPlaceInfoList = res.entity;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#usingModal").length) $("#usingModal").remove();
            $("body").children("a.btn-top").after(html);

            $("#usingModal").modal({show: true});
            if( modalType === "mod" ) {
                $("#checkAll").prop("checked", $("#tabPlace tr:gt(0):visible").length > 0 && $("#tabPlace tr:gt(0):visible input[name=usingCheck]:checked").length === $("#tabPlace tr:gt(0):visible").length);
            } else {
                $("td[name=rownum]").each(function(idx, item) {
                    $(this).text(idx + 1);
                });
            }
            $("#totalCnt").text( $("#tabPlace tr:gt(0)").length );
            $("#checkCnt").text( $("#tabPlace tr:gt(0) input[name=usingCheck]:checked").length );
            $("#usingModal #bizPlaceInfo").trigger("change");
        },
        /**
         * 사용처/제한처 설정
         * @returns {Promise<void>}
         */
        doSettingBizPlaceInfo: async function () {
            if (!USING.methods.usingValid()) return;
            const params = {
                wptlEntpNo: USING.usingInfo.wptlEntpNo,
                wptlPrdNo: USING.usingInfo.wptlPrdNo,
                crdCashId: USING.usingInfo.crdCashId,
                blockBizTypeGrpId: USING.usingInfo.blockBizTypeGrpId || USING.usingInfo.grantBizTypeGrpId,
                grantBizTypeGrpId: USING.usingInfo.grantBizTypeGrpId || USING.usingInfo.blockBizTypeGrpId,
                bizPlaceList: USING.usingList,
                placeType: USING.usingInfo.placeType
            }
            if (!confirm(USING.usingInfo.bizPlaceTypeNm + " 설정을 저장하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/product/doSettingBizPlaceInfo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(USING.usingInfo.bizPlaceTypeNm + " 설정이 저장되었습니다.");
                // $("#usingModal").modal({show: false}).remove();
                // 캐시 정보 갱신
                USING.methods.openUsingModal("info");
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

        downloadExcel: function () {
            let excelList = [];

            $("#tabPlace tr:not(.nodata):gt(0):visible").each(function () {
                const bizplace = $(this).find("td:eq(1)").text().trim();
                const subplace = $(this).find("td:eq(2)").text().trim();
                const code     = $(this).find("td:eq(3)").text().trim();

                excelList.push({
                    bztpNm: bizplace,
                    subBztpNm: subplace,
                    subBztpCd: code
                });
            });

            if (excelList.length === 0) {
                alert("다운로드 할 데이터가 없습니다.");
                return;
            }

            // Send as JSON object
            const params = {
                limit: -1,
                bizPlaceTypeNm: USING.usingInfo.bizPlaceTypeNm,
                excelList: excelList
            };

            ServiceExec.jsonDownPost("/api/product/doDownloadBizPlaceExcel", params);
        },

        /**
         * 사용처/제한처 설정 유효성 체크
         * @returns {boolean}
         */
        usingValid: function () {
            USING.usingList = [];
            $("#usingModal input:checkbox[name=usingCheck]:checked").each(function (index, item) {
                const bztpCd = $(item).val();
                if (!Util.isEmpty(bztpCd)) USING.usingList.push(bztpCd);
            })
            if (USING.usingList.length === 0) {
                alert(USING.usingInfo.bizPlaceTypeNm + "을 선택해주세요.");
                return false;
            }
            return true;
        },
        closeUsingModal: function () {
            $("#usingModal").modal({show: false}).remove();
        }
    },
    init: function () {
        // _this = this;
        for (let eventFunc in USING.events) {
            USING.events[eventFunc]();
        }
    }
}

USING.init();
window.USING = USING;