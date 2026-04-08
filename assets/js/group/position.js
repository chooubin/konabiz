import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";
import "/js/modal/item.js?version=2025231001";

// 부서/직급/직책 js
let _this;
const FH = {
    entpNm: KSM.targetEntpNm,
    deptGrid: null,
    jgdGrid: null,
    rsbGrid: null,
    originalDeptList: [],
    redifyDeptList: [],
    originalJgdList: [],
    redifyJgdList: [],
    originalRsbList: [],
    redifyRsbList: [],
    deptCount: 0,
    jgdCount: 0,
    rsbCount: 0,
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
            $(document).on("change", "input[name=chkcommon]", function() {
                const total = $("#positionModal input[name=chkcommon]").length;
                const checked = $("#positionModal input[name=chkcommon]:checked").length;

                // Update the Select All checkbox state
                $("#deptAllCheck").prop("checked", total === checked);
                $("#rankAllCheck").prop("checked", total === checked);
                $("#positionAllCheck").prop("checked", total === checked);

            });
        }
    },
    methods: {
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            _this.deptGrid = Toast.methods.setGrid({
                el: "deptGrid",
                columns: [
                    {
                        header: 'NO',
                        align: 'center',
                        width: 100,
                        name: 'rowKey',
                        formatter: function ({row, column, value}) {
                            return row.rowKey + 1;
                        }
                    },
                    {
                        header: '부서명',
                        align: 'center',
                        name: 'deptNm'
                    }
                ]
            })
            _this.methods.doGetDeptList();

            _this.jgdGrid = Toast.methods.setGrid({
                el: "jgdGrid",
                columns: [
                    {
                        header: 'NO',
                        align: 'center',
                        width: 100,
                        name: 'rowKey',
                        formatter: function ({row, column, value}) {
                            return row.rowKey + 1;
                        }
                    },
                    {
                        header: '직급명',
                        align: 'center',
                        name: 'jgdNm'
                    }
                ]
            })
            _this.methods.doGetJgdList();

            _this.rsbGrid = Toast.methods.setGrid({
                el: "rsbGrid",
                columns: [
                    {
                        header: 'NO',
                        align: 'center',
                        width: 100,
                        name: 'rowKey',
                        formatter: function ({row, column, value}) {
                            return row.rowKey + 1;
                        }
                    },
                    {
                        header: '직책명',
                        align: 'center',
                        name: 'rsbNm'
                    }
                ]
            })
            _this.methods.doGetRsbList();
        },

        downloadExcel:function(type){
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                limit: -1,
            };
            if (type === "dept" && _this.deptCount !== 0) {
                ServiceExec.downPost("/api/group/doGetDeptList", params);
                return;
            }
            if (type === "jgd" && _this.jgdCount !== 0) {
                ServiceExec.downPost("/api/group/doGetJgdList", params);
                return;
            }
            if (type === "rsb" && _this.rsbCount !== 0) {
                ServiceExec.downPost("/api/group/doGetRsbList", params);
                return;
            }

            alert("다운로드 할 데이터가 없습니다.");
        },
        /**
         * 부서 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetDeptList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doGetDeptList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.originalDeptList = entity || [];
                $("#deptCount").html(entity?.length || 0);
                _this.deptGrid.resetData(entity);
                _this.deptCount = entity?.length || 0;
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
         * 직급 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetJgdList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doGetJgdList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.originalJgdList = entity || [];
                $("#jgdCount").html(entity?.length || 0);
                _this.jgdGrid.resetData(entity);
                _this.jgdCount = entity?.length || 0;
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
         * 직책 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetRsbList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/group/doGetRsbList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.originalRsbList = entity || [];
                $("#rsbCount").html(entity?.length || 0);
                _this.rsbGrid.resetData(entity);
                _this.rsbCount = entity?.length || 0;
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
         * 부서/직급/직책 modal 열기
         * @param modalType (부서일괄: excel_dept, 부서: dept,
         *                   직급일괄: excel_jgd, 직급: jgd,
         *                   직책일괄: excel_rsb, 직책: rsb)
         * @returns {Promise<void>}
         */
        openPositionModal: async function (modalType) {
            const params = {
                path: "modal/position",
                htmlData: {
                    modalType: modalType,
                    entpNm: _this.entpNm
                }
            }
            switch (modalType) {
                case "dept": params.htmlData.positionList = _this.originalDeptList;
                    break;
                case "jgd": params.htmlData.positionList = _this.originalJgdList;
                    break;
                case "rsb": params.htmlData.positionList = _this.originalRsbList;
                    break;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#positionModal").length) $("#positionModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#positionModal").modal({show: true});
        },

        /* ---------------------------------------- 일괄 등록 (엑셀) 관련 start ---------------------------------------- */
        /**
         * 부서 일괄 등록 (엑셀) 업로드, 저장
         * @param saveYn (업로드: N, 저장: Y)
         * @returns {Promise<void>}
         */
        doRegistDeptExcel: async function (el, saveYn = "N") {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                    // 기업 시퀀스
                saveYn: saveYn,                                      // 실제 저장 여부
                deptExcelFile: {}, // 엑셀 파일
                tempFileName: ""                                     // 업로드한 엑셀 파일 이름
            }
            if (saveYn === "N") {
                let $tempFile = $("#deptExcelFile");
                let $tempFileName = $("#tempFileName");
                $tempFileName.val("");
                params.deptExcelFile = $tempFile[0].files[0];
                // console.log(params);
                const res = await ServiceExec.formPostAsync('/api/group/doRegistDeptExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    if (entity.insertCount > 0) $tempFileName.val(entity.tempFileName);
                    // 엑셀 업로드 결과 바인딩 (js/common/File.js)
                    FILE.methods.setExcelUploadResult(entity);
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
                $tempFile.val("");
            } else {
                const $positionModal = $("#positionModal");
                params.tempFileName = $positionModal.find("#tempFileName").val();
                if (Util.isEmpty(params.tempFileName)) {
                    $positionModal.modal({show: false}).remove();
                    return;
                }
                if (!confirm("부서 정보를 등록 하시겠습니까?")) return;
                // console.log(params);
                const res = await ServiceExec.formPost('/api/group/doRegistDeptExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    alert("부서 정보를 등록하였습니다.");
                    $positionModal.modal({show: false}).remove();
                    // 부서 리스트 갱신
                    _this.methods.doGetDeptList();
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
            }
        },
        /**
         * 직급 일괄 등록 (엑셀) 업로드, 저장
         * @param saveYn (업로드: N, 저장: Y)
         * @returns {Promise<void>}
         */
        doRegistJgdExcel: async function (el, saveYn = "N") {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                   // 기업 시퀀스
                saveYn: saveYn,                                     // 실제 저장 여부
                jgdExcelFile: {}, // 엑셀 파일
                tempFileName: ""                                    // 업로드한 엑셀 파일 이름
            }
            if (saveYn === "N") {
                let $tempFile = $("#jgdExcelFile");
                let $tempFileName = $("#tempFileName");
                $tempFileName.val("");
                params.jgdExcelFile = $tempFile[0].files[0];
                // console.log(params);
                const res = await ServiceExec.formPostAsync('/api/group/doRegistJgdExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    if (entity.insertCount > 0) $tempFileName.val(entity.tempFileName);
                    // 엑셀 업로드 결과 바인딩 (js/common/File.js)
                    FILE.methods.setExcelUploadResult(entity);
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
                $tempFile.val("");
            } else {
                const $positionModal = $("#positionModal");
                params.tempFileName = $positionModal.find("#tempFileName").val();
                if (Util.isEmpty(params.tempFileName)) {
                    $positionModal.modal({show: false}).remove();
                    return;
                }
                if (!confirm("직급 정보를 등록 하시겠습니까?")) return;
                // console.log(params);
                const res = await ServiceExec.formPost('/api/group/doRegistJgdExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    alert("직급 정보를 등록하였습니다.");
                    $positionModal.modal({show: false}).remove();
                    // 직급 리스트 갱신
                    _this.methods.doGetJgdList();
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
            }
        },
        /**
         * 직책 일괄 등록 (엑셀) 업로드, 저장
         * @param saveYn (업로드: N, 저장: Y)
         * @returns {Promise<void>}
         */
        doRegistRsbExcel: async function (el, saveYn = "N") {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                   // 기업 시퀀스
                saveYn: saveYn,                                     // 실제 저장 여부
                rsbExcelFile: {}, // 엑셀 파일
                tempFileName: ""                                    // 업로드한 엑셀 파일 이름
            }
            if (saveYn === "N") {
                let $tempFile = $("#rsbExcelFile");
                let $tempFileName = $("#tempFileName");
                $tempFileName.val("");
                params.rsbExcelFile = $tempFile[0].files[0];
                // console.log(params);
                const res = await ServiceExec.formPostAsync('/api/group/doRegistRsbExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    if (entity.insertCount > 0) $tempFileName.val(entity.tempFileName);
                    // 엑셀 업로드 결과 바인딩 (js/common/File.js)
                    FILE.methods.setExcelUploadResult(entity);
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
                $tempFile.val("");
            } else {
                const $positionModal = $("#positionModal");
                params.tempFileName = $positionModal.find("#tempFileName").val();
                if (Util.isEmpty(params.tempFileName)) {
                    $positionModal.modal({show: false}).remove();
                    return;
                }
                if (!confirm("직책 정보를 등록 하시겠습니까?")) return;
                // console.log(params);
                const res = await ServiceExec.formPost('/api/group/doRegistRsbExcel', params);
                const code = res.code;
                const message = res.message;
                const entity = res.entity;
                // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
                if (code === 1) {
                    alert("직책 정보를 등록하였습니다.");
                    $positionModal.modal({show: false}).remove();
                    // 직책 리스트 갱신
                    _this.methods.doGetRsbList();
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
            }
        },
        /* ---------------------------------------- 일괄 등록 (엑셀) 관련 start ---------------------------------------- */

        /* ---------------------------------------- 삭제 관련 start ---------------------------------------- */
        /**
         * 부서 아이템 삭제
         * @returns {Promise<void>}
         */
        doCheckDeptInEmp: async function () {
            let $modal = $("#positionModal");
            let $checked = $modal.find("input:checkbox[name=chkcommon]:checked");
            let length = $modal.find("tbody tr").length;
            if ($checked.length === 0) {
                alert("삭제할 부서를 선택하세요.");
                return;
            }
            // Collect rows + deptNos
            let deleteRows = [];
            let deptNos = [];
            $checked.each(function () {
                let $tr = $(this).closest("tr");
                let wptlDeptNo = $tr.find("input:text[name=itemName]").attr("_itemNo");
                if (wptlDeptNo) deptNos.push(Number(wptlDeptNo));
                deleteRows.push($tr);
            });
            //Bulk validation & delete in one request
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,
                wptlDeptNoList: deptNos 
            };
            try {
                const res = await ServiceExec.jsonPost('/api/group/doCheckDeptInEmp', params);
                const code = res.code;
                const message = res.message;
                if (code === 1) {
                    //remove from frontend list
                    ITEM.methods.deleteInputMultipleItem("dept", length, deleteRows);
                    $('#deptAllCheck').prop('checked', false);
                } else {
                    alert(message);
                }
            } catch (err) {
                console.error(err);
                alert("서버 오류가 발생했습니다.");
            }
        },

        /**
         * 직급 아이템 삭제
         * @returns {Promise<void>}
         */
        doCheckJgdInEmp: async function () {
            const $modal = $("#positionModal");
            const $checked = $modal.find("input:checkbox[name=chkcommon]:checked");
            const length = $modal.find("tbody tr").length;
            if ($checked.length === 0) {
                alert("삭제할 직급을 선택하세요.");
                return;
            }
            let deleteRows = [];
            let jgdNos = [];

            $checked.each(function () {
                const $tr = $(this).closest("tr");
                const wptlJgdNo = $tr.find("input:text[name=itemName]").attr("_itemNo");
                if (wptlJgdNo) jgdNos.push(Number(wptlJgdNo));
                deleteRows.push($tr);
            });
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,
                wptlJgdNoList: jgdNos
            };
            try {
                const res = await ServiceExec.jsonPost("/api/group/doCheckJgdInEmp", params);
                const { code, message } = res;
                if (code === 1) {
                    // Remove rows from the UI
                    ITEM.methods.deleteInputMultipleItem("jgd", length, deleteRows);
                    $('#rankAllCheck').prop('checked', false);
                } else {
                    alert(message);
                }
            } catch (err) {
                console.error(err);
                alert("서버 오류가 발생했습니다.");
            }
        },

        /**
         * 직책 아이템 삭제
         * @returns {Promise<void>}
         */
        doCheckRsbInEmp: async function () {
            const $modal = $("#positionModal");
            const $checked = $modal.find("input:checkbox[name=chkcommon]:checked");
            const length = $modal.find("tbody tr").length;
            if ($checked.length === 0) {
                alert("삭제할 직책을 선택하세요.");
                return;
            }
            const deleteRows = [];
            const rsbNos = [];
            $checked.each(function () {
                const $tr = $(this).closest("tr");
                const wptlRsbNo = $tr.find("input:text[name=itemName]").attr("_itemNo");
                if (wptlRsbNo) rsbNos.push(Number(wptlRsbNo));
                deleteRows.push($tr);
            });
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,   // 기업 시퀀스
                wptlRsbNoList: rsbNos               // 직책 시퀀스 배열
            };
            try {
                console.log("params:", params);
                const res = await ServiceExec.jsonPost("/api/group/doCheckRsbInEmp", params);
                const { code, message } = res;
                if (code === 1) {
                    ITEM.methods.deleteInputMultipleItem("rsb", length, deleteRows);
                    $('#positionAllCheck').prop('checked', false);
                } else {
                    alert(message);
                }
            } catch (err) {
                console.error(err);
                alert("서버 오류가 발생했습니다.");
            }
        },  

        /* ---------------------------------------- 삭제 관련 start ---------------------------------------- */

        /* ---------------------------------------- 등록/수정 관련 start ---------------------------------------- */
        /**
         * 부서 등록/수정
         * @returns {Promise<void>}
         */
        doRedifyDept: async function () {
            if (!_this.methods.positionValid("dept", "부서", _this.originalDeptList)) return;
            const params = {
                deptRedifyList: _this.redifyDeptList // 부서 리스트
            }
            if (!confirm("부서 설정을 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/group/doRedifyDept', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("부서 설정을 수정하였습니다.");
                $("#positionModal").modal({show: false}).remove();
                _this.methods.doGetDeptList();
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
         * 직급 등록/수정
         * @returns {Promise<void>}
         */
        doRedifyJgd: async function () {
            if (!_this.methods.positionValid("jgd", "직급", _this.originalJgdList)) return;
            const params = {
                jgdRedifyList : _this.redifyJgdList // 직급 리스트
            }
            if (!confirm("직급 설정을 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/group/doRedifyJgd', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("직급 설정을 수정하였습니다.");
                $("#positionModal").modal({show: false}).remove();
                _this.methods.doGetJgdList();
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
         * 직책 등록/수정
         * @returns {Promise<void>}
         */
        doRedifyRsb: async function () {
            if (!_this.methods.positionValid("rsb", "직책", _this.originalRsbList)) return;
            const params = {
                rsbRedifyList: _this.redifyRsbList // 직책 리스트
            }
            if (!confirm("직책 설정을 수정하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.jsonPost('/api/group/doRedifyRsb', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("직책 설정을 수정하였습니다.");
                $("#positionModal").modal({show: false}).remove();
                _this.methods.doGetRsbList();
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
         * 부서/직급/직책 등록/수정 유효성 체크
         * @param type (부서: dept, 직급: jgd, 직책: rsb)
         * @param typeName
         * @param originalList (원본 리스트)
         * @returns {boolean}
         */
        positionValid: function (type, typeName, originalList) {
            let $scrollWrap = $("#positionModal .modal-body");
            let $validEl = $("#positionModal .modal-body .modal-title1 small");
            $validEl.html("");
            const res = ITEM.methods.itemListValid(type, originalList);
            if(!res.isChagne) {
                $("#positionModal").modal({show: false}).remove();
                return false;
            }
            if(res.isEmpty) {
                Util.validCheck($scrollWrap, $validEl, typeName + "명을 입력해 주세요.");
                return false;
            }
            if(res.isDuplicate) {
                Util.validCheck($scrollWrap, $validEl, "중복된 " + typeName + "명이 있습니다.");
                return false;
            }
            switch (type) {
                case "dept":
                    _this.redifyDeptList = res.itemList.map(item => {
                        return {
                            deptNm: item.name,
                            wptlDeptNo: item.no,
                            wptlEntpNo: KSM.targetWptlEntpNo
                        }
                    })
                    break;
                case "jgd":
                    _this.redifyJgdList = res.itemList.map(item => {
                        return {
                            jgdNm: item.name,
                            wptlJgdNo: item.no,
                            wptlEntpNo: KSM.targetWptlEntpNo
                        }
                    })
                    break;
                case "rsb":
                    _this.redifyRsbList = res.itemList.map(item => {
                        return {
                            rsbNm: item.name,
                            wptlRsbNo: item.no,
                            wptlEntpNo: KSM.targetWptlEntpNo
                        }
                    })
                    break;
            }
            return true;
        },
        // Select All for Department
        deptAllCheck: function(event) {
            const isChecked = event.target.checked;
            // Check/uncheck all department checkboxes
            $("#positionModal input[name=chkcommon]").prop("checked", isChecked);

        },
        // Select All for Rank
        rankAllCheck: function(event) {
            const isChecked = event.target.checked;
            // Check/uncheck all rank checkboxes
            $("#positionModal input[name=chkcommon]").prop("checked", isChecked);

        },
        // Select All for Position
        positionAllCheck: function(event) {
            const isChecked = event.target.checked;
            // Check/uncheck all position checkboxes
            $("#positionModal input[name=chkcommon]").prop("checked", isChecked);

        }


        /* ---------------------------------------- 등록/수정 관련 end ---------------------------------------- */
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
             _this.events[eventFunc]();
         }
        Toast.methods.getListInfo(FH.methods.setTable);
    }
}

window.FH = FH;
FH.init();