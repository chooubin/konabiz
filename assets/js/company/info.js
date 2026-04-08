import "/js/common/Toast.js?version=2025052101";
import "/js/common/File.js?version=2025010801";

// 기업 정보 js
let _this;
const FH = {
    bankList: [],
    entpNm: KSM.targetEntpNm,
    wptlEntpStCd: "",
    applyProductCount: "",
    psnlCorpBznmDvCd: "",
    contFileGrid: null,
    contFileDetail: {},
    sysUserGrid: null,
    sysUserDetail: {},
    wptlEntpNo: "",
    entpInfo: {},
    unmaskYn: "",
    events: {
        /**
         * key 이벤트
         */
        keyEvent: function () {
            $(document).on("keyup", "#defpayAcno", function () {
                let nowVal = $("#defpayAcno").val();
                nowVal = nowVal.replace(/[^0-9]/g, '');
                $("#defpayAcno").val(nowVal);
            });
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
            window.onresize = function () {
                if ($(".table-body").length) {
                    Util.setReportHeight($(".table-body")[0]);
                }
            }
        }
    },
    methods: {
        /**
         * 리스트 table 생성
         */
        setTable: function () {
            if (_this.wptlEntpStCd !== ConstCode.CODES_COMPANY.CONTRACT.ACCEPT_SAVE ||
                (!Util.isEmpty(_this.applyProductCount) && (Number(_this.applyProductCount) === 0))) {
                // "첨부서류" cell a태그 다운로드 customRenderer
                class CustomRenderer {
                    constructor(props) {
                        let el;
                        if (!Util.isEmpty(props.value) && props.value !== "-") {
                            el = document.createElement("a");
                            let pathKey = props.columnInfo.name.substring(0, props.columnInfo.name.length - 2) + "PthNm";
                            el.href = Util.getFilePath(props.grid.getRow(props.rowKey)[pathKey]);
                            el.appendChild(document.createTextNode(props.value));
                            el.setAttribute("download", String(props.value));
                        } else {
                            el = document.createElement("div");
                            el.className = "tui-grid-cell-content";
                            el.appendChild(document.createTextNode("-"));
                        }
                        this.el = el;
                        this.render(props);
                    }

                    getElement() {
                        return this.el;
                    }

                    render(props) {
                    }
                }

                let columns = [
                    {
                        header: "사업자등록증",
                        align: "center",
                        minWidth: 100,
                        name: "bsrgcFileNm",
                        renderer: CustomRenderer
                    },
                    {
                        header: "통장사본",
                        align: "center",
                        minWidth: 100,
                        name: "bnkbCpyFileNm",
                        renderer: CustomRenderer
                    },
                    {
                        header: "대표자신분증",
                        align: "center",
                        minWidth: 100,
                        name: "reppIdfcFileNm",
                        renderer: CustomRenderer
                    }
                ];
                if (_this.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                    columns.push(
                        {
                            header: "법인인감증명서",
                            align: "center",
                            minWidth: 100,
                            name: "corpSealCerFileNm",
                            renderer: CustomRenderer
                        },
                        {
                            header: "주주명부",
                            align: "center",
                            minWidth: 100,
                            name: "stchNmlsFileNm",
                            renderer: CustomRenderer
                        },
                        {
                            header: "출자자/출연자 명부",
                            align: "center",
                            minWidth: 100,
                            name: "nvstorNmlsFileNm",
                            renderer: CustomRenderer
                        },
                        {
                            header: "정관",
                            align: "center",
                            minWidth: 100,
                            name: "afasFileNm",
                            renderer: CustomRenderer
                        }
                    )
                }
                _this.contFileGrid = Toast.methods.setGrid({
                    el: "contFileGrid",
                    columns: columns
                })
                _this.methods.doGetContAttchFile();
            }

            // 서비스 계약 완료 후, 운영자 리스트
            if (_this.wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.ACCEPT_SAVE) {
                _this.sysUserGrid = Toast.methods.setGrid({
                    el: "sysUserGrid",
                    columns: [
                        {
                            header: "NO",
                            align: "center",
                            width: 100,
                            name: "rowKey",
                            formatter: function ({row, column, value}) {
                                return row.rowKey + 1;
                            }
                        },
                        {
                            header: "권한",
                            align: "center",
                            width: 100,
                            name: "wptlUesrRoleNm"
                        },
                        {
                            header: "개인정보 열람",
                            align: "center",
                            width: 140,
                            name: "psnlInfoRdngPsnblNm"
                        },
                        {
                            header: "담당자명",
                            align: "center",
                            width: 140,
                            name: "userNm",
                            renderer: {
                                styles: {
                                    cursor: "pointer",
                                    color: "#0028b6"
                                }
                            },
                            formatter: function ({value}) {
                                if (value && value !== '-') {
                                    return `<span style="text-decoration: underline;">${value}</span>`;
                                }
                                return value || '';
                            }
                        },
                        {
                            header: "연락처",
                            align: "center",
                            width: 180,
                            name: "hpnmNo"
                        },
                        {
                            header: "아이디",
                            align: "center",
                            minWidth: 100,
                            name: "userLoginId",
                            renderer: {
                                styles: {
                                    cursor: "pointer",
                                    color: "#0028b6",
                                    textDecoration: "underline"
                                }
                            }
                        },
                        {
                            header: "마지막 로그인",
                            align: "center",
                            width: 220,
                            name: "fnlLginDttm",
                            formatter: function ({row, column, value}) {
                                return Util.emptyString(row.fnlLginDttm);
                            }
                        },
                        {
                            header: "계정 상태",
                            align: "center",
                            width: 100,
                            name: "wptlUserStNm"
                        }
                    ],
                    clickEventColumns: ["userNm", "userLoginId"],
                    clickFunction: (row) => {
                        // 운영자 정보 상세 modal 열기
                        FH.methods.openSysUserModal("info", Number(row.wptlUserNo));
                    }
                })
                _this.methods.doGetSysUserList();
            }
        },

        /* ---------------------------------------- 첨부 서류 관련 start ---------------------------------------- */
        /**
         * 첨부 서류 파일 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetContAttchFile: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/company/doGetContAttchFile', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.contFileDetail = entity;
                if (!Util.isEmpty(_this.contFileDetail)) _this.contFileGrid.resetData(new Array(entity));
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
         * 첨부 서류 수정 modal 열기
         * @returns {Promise<void>}
         */
        openContFileModal: async function () {
            const params = {
                path: "modal/contFile",
                htmlData: {
                    psnlCorpBznmDvCd: _this.psnlCorpBznmDvCd,
                    contFileDetail: _this.contFileDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#contFileModal").length) $("#contFileModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#contFileModal").modal({show: true});
            $("#contFileModal").removeAttr("tabindex");
        },
        /**
         * 첨부 서류 수정 modal - 첨부 서류 수정
         * @returns {Promise<boolean>}
         */
        doModiContAttchFile: async function () {
            let bsrgcFile = $("#bsrgcFile")[0].files[0];
            let bnkbCpyFile = $("#bnkbCpyFile")[0].files[0];
            let reppIdfcFile = $("#reppIdfcFile")[0].files[0];
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo,                                                               // 기업 시퀀스

                corpSealCerFile: {},                                          // 법인인감 증명서 파일
                corpSealCerFileNm: "",                                                                          // 법인인감 증명서 파일 이름
                corpSealCerFilePthNm: "",                                                                       // 법인인감 증명서 파일 경로
                stchNmlsFile: {},                                             // 주주명부 파일
                stchNmlsFileNm: "",                                                                             // 주주명부 파일 이름
                stchNmlsFilePthNm: "",                                                                          // 주주명부 파일 경로
                nvstorNmlsFile: {},                                           // 출자자/출연자 명부 파일
                nvstorNmlsFileNm: "",                                                                           // 출자자/출연자 명부 파일 이름
                nvstorNmlsFilePthNm: "",                                                                        // 출자자/출연자 명부 파일 경로
                afasFile: {},                                                 // 정관 파일
                afasFileNm: "",                                                                                 // 정관 파일 이름
                afasFilePthNm: "",                                          // 정관 파일 경로
                signedText: ""
            }

            if (bsrgcFile !== undefined) {
                params.bsrgcFile = bsrgcFile;  // 사업자등록증 파일
            }

            params.bsrgcFileNm = $("#bsrgcFileNm").val();   // 사업자등록증 파일 이름
            params.bsrgcFilePthNm = $("#bsrgcFilePthNm").val(); // 사업자등록증 파일 경로

            if (bnkbCpyFile !== undefined) {
                params.bnkbCpyFile = bnkbCpyFile;   // 통장 사본 파일
            }

            params.bnkbCpyFileNm = $("#bnkbCpyFileNm").val();   // 통장 사본 파일 이름
            params.bnkbCpyFilePthNm = $("#bnkbCpyFilePthNm").val();  // 통장 사본 파일 경로

            if (reppIdfcFile !== undefined) {
                params.reppIdfcFile = reppIdfcFile; // 대표자 신분증 파일
            }

            params.reppIdfcFileNm = $("#reppIdfcFileNm").val(); // 대표자 신분증 파일 이름
            params.reppIdfcFilePthNm = $("#reppIdfcFilePthNm").val();   // 대표자 신분증 파일 경로

            if (_this.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                let corpSealCerFile = $("#corpSealCerFile")[0].files[0];
                let stchNmlsFile = $("#stchNmlsFile")[0].files[0];
                let nvstorNmlsFile = $("#nvstorNmlsFile")[0].files[0];
                let afasFile = $("#afasFile")[0].files[0];

                if (corpSealCerFile !== undefined) {
                    params.corpSealCerFile = corpSealCerFile;   // 법인인감 증명서 파일
                }

                params.corpSealCerFileNm = $("#corpSealCerFileNm").val();
                params.corpSealCerFilePthNm = corpSealCerFilePthNm;

                if (stchNmlsFile !== undefined) {
                    params.stchNmlsFile = stchNmlsFile; // 주주명부 파일
                }
                params.stchNmlsFileNm = $("#stchNmlsFileNm").val();
                params.stchNmlsFilePthNm = $("#stchNmlsFilePthNm").val();

                if (nvstorNmlsFilePthNm !== undefined) {
                    if (nvstorNmlsFile !== undefined) {
                        params.nvstorNmlsFile = nvstorNmlsFile; // 출자자/출연자 명부 파일
                    }
                    params.nvstorNmlsFileNm = $("#nvstorNmlsFileNm").val();
                    params.nvstorNmlsFilePthNm = $("#nvstorNmlsFilePthNm").val();
                }

                if (afasFilePthNm !== undefined) {
                    if (afasFile !== undefined) {
                        params.afasFile = afasFile; // 정관 파일
                    }
                    params.afasFileNm = $("#afasFileNm").val();
                    params.afasFilePthNm = $("#afasFilePthNm").val();
                }
            }
            if (!_this.methods.contFileValid(params)) return;
            if (!confirm("서비스 계약 첨부 서류를 수정하시겠습니까?")) return;
            // console.log(params);

            await FH.methods.callModiContAttchFile(params);

            // unisign.SignData(FH.bzno, null,
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
            //             FH.methods.callModiContAttchFile(params);
            //         }
            //     }
            // );
        },
        callModiContAttchFile: async function (params) {
            const res = await ServiceExec.formPost('/api/company/doModiContAttchFile', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("서비스 계약 첨부 서류를 수정하였습니다.");
                $("#contFileModal").modal({show: false}).remove();
                // 첨부 서류 갱신
                _this.methods.doGetContAttchFile();
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
         * 첨부 서류 수정 modal - 첨부 서류 수정 유효성 체크
         * @param params
         * @returns {boolean}
         */
        contFileValid: function (params) {
            let $scrollWrap = $("#contFileModal .modal-body");
            let $requiredValidEl = $("#contFileModal .modal-body .modal-title1:eq(0) small");
            $requiredValidEl.html("");
            if (Util.isEmpty(params.bsrgcFile) && Util.isEmpty(params.bsrgcFileNm)) {
                Util.validCheck($scrollWrap, $requiredValidEl, "사업자등록증을 첨부해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.bnkbCpyFile) && Util.isEmpty(params.bnkbCpyFileNm)) {
                Util.validCheck($scrollWrap, $requiredValidEl, "통장사본을 첨부해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppIdfcFile) && Util.isEmpty(params.reppIdfcFileNm)) {
                Util.validCheck($scrollWrap, $requiredValidEl, "대표자 신분증 사본을 첨부해 주세요.");
                return false;
            }
            if (_this.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                if (Util.isEmpty(params.corpSealCerFile) && Util.isEmpty(params.corpSealCerFileNm)) {
                    Util.validCheck($scrollWrap, $requiredValidEl, "법인 인감 증명서를 첨부해 주세요.");
                    return false;
                }
                let $additionalValidEl = $("#contFileModal .modal-body .modal-title1:eq(1) small");
                $additionalValidEl.html("");
                if ((Util.isEmpty(params.stchNmlsFile) && Util.isEmpty(params.stchNmlsFileNm)) &&
                    (Util.isEmpty(params.nvstorNmlsFile) && Util.isEmpty(params.nvstorNmlsFileNm)) &&
                    (Util.isEmpty(params.afasFile) && Util.isEmpty(params.afasFileNm))) {
                    Util.validCheck($scrollWrap, $additionalValidEl, "주주명부, 출자자/출연자 명부, 정관 중 최소 한 개 이상의 파일을 첨부해 주세요.");
                    return false;
                }
            }
            return true;
        },
        /**
         * 서비스 계약 재신청
         * @param el (재신청 버튼 a태그)
         * @param aplyDt
         * @returns {Promise<void>}
         */
        doRetryApplyCont: async function (el, aplyDt) {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo, // 기업 시퀀스
                signedText: ""
            }
            if (!confirm("서비스 계약을 재신청하시겠습니까?")) return;
            // console.log(params);
            await FH.methods.callRetryApplyCont(params);

            // unisign.SignData(FH.bzno, null,
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
            //             FH.methods.callRetryApplyCont(params);
            //         }
            //     }
            // );
        },
        callRetryApplyCont: async function (params) {
            const res = await ServiceExec.formPost('/api/company/doRetryApplyCont', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("서비스 계약을 재신청하였습니다.");
                $(el).remove();
                let html = '<p>서비스 계약 신청일 : ' + aplyDt + '</p>' +
                    '<p class="red">담당자가 서비스 계약 신청을 검토중입니다.</p>';
                $(".service-step .step.active .msg").html(html);
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
        /* ---------------------------------------- 첨부 서류 관련 start ---------------------------------------- */

        /* ---------------------------------------- 운영자 관리 관련 start ---------------------------------------- */
        /**
         * 운영자 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetSysUserList: async function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo // 기업 시퀀스
            }
            if (FH.unmaskYn === "Y") {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/company/doGetSysUserList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                Toast.grid.resetData(entity);
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
         * 운영자 modal 열기
         * @param modalType (등록: reg, 수정: mod, 상세: info)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<boolean>}
         */
        openSysUserModal: async function (modalType = "reg", wptlUserNo = "", maskingType = "mask") {
            const params = {
                path: "modal/sysUser",
                htmlData: {
                    modalType: modalType,
                    entpNm: _this.entpNm
                }
            }
            switch (modalType) {
                case "info":
                    if (Util.isEmpty(wptlUserNo)) return;
                    let apiParams = {targetWptlUserNo: Number(wptlUserNo)};
                    if (maskingType === "unmask") {
                        apiParams.unmaskYn = "Y";
                    }
                    const res = await ServiceExec.post('/api/account/doGetAcctInfo', apiParams);
                    _this.sysUserDetail = res.entity;
                    params.htmlData.sysUserDetail = _this.sysUserDetail;
                    break;
                case "mod":
                    if (Util.isEmpty(_this.sysUserDetail)) return;
                    params.htmlData.sysUserDetail = _this.sysUserDetail;
                    break;
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#sysUserModal").length) $("#sysUserModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#sysUserModal").modal({show: true});

            if (modalType === "reg" || modalType === "mod") {
                addEventListenerByElements($("#sysUserModal .masking-input").get());
                $("#sysUserModal .masking-input").each(function (idx, item) {
                    item.dispatchEvent(new Event('input'));
                });
            }
        },
        /**
         * 운영자 등록/수정 modal - 운영자 등록/수정
         * @param modalType (등록: reg, 수정: mod)
         * @param wptlUserNo (회원 시퀀스)
         * @returns {Promise<void>}
         */
        doRedifySysUser: async function (modalType = "reg", wptlUserNo = "", isResetInfo = "") {
            const params = {
                wptlUserDvCd: ConstCode.CODES_MEMBER_ACCOUNT.TYPE.AGENCY,                        // 회원 타입 (기업 회원)
                wptlEntpNo: KSM.targetWptlEntpNo,                                                // 기업 시퀀스
                targetWptlUserNo: !Util.isEmpty(wptlUserNo) ? Number(wptlUserNo) : "",           // 회원 시퀀스   
                userNm: $("#userNm").val().trim(),                                               // 회원 이름
                userLoginId: $("#userLoginId").val().trim(),                                      // 회원 ID
                userEmail: $("#userEmail").val().trim(),                                         // 사용자 이메일
                hpnmNo: $("#hpnmNo").data("realValue"),                                          // 휴대폰 번호
                userPswd: $("#userPswd").val().trim(),                                           // 비밀번호
                userPswdChk: $("#userPswdChk").val().trim(),                                     // 비밀번호 확인
                wptlUserRoleCd: $("#sysUserModal [name=wptlUserRoleCd]:checked").val(),          // 운영자 권한
                wptlUserStCd: $("#sysUserModal [name=wptlUserStCd]:checked").val(),              // 계정 상태
                psnlInfoRdngPsnblYn: $("#sysUserModal [name=psnlInfoRdngPsnblYn]:checked").val() // 개인정보 조회
            }
            const $scrollWrap = $(".modal-body");
            const $validEl = $("#sysUserValid");
            if (!_this.methods.sysUserValid($scrollWrap, $validEl, modalType, params)) return;
            if (isResetInfo === "Y") {
                params.userNm = params.userEmail = params.hpnmNo = "-";
            } else {
                if (params.wptlUserStCd === "99") {
                    const popUpParams = {
                        path: "modal/accResetOnSuspensionPopup",
                        htmlData: {modalType: modalType, sysUserDetail: _this.sysUserDetail}
                    }
                    const html = await ServiceExec.htmlGet('/common/doGetHtml', popUpParams);
                    if ($("#accResetOnSuspensionPopup").length) $("#accResetOnSuspensionPopup").remove();
                    $("body").children("a.btn-top").after(html);
                    $("#accResetOnSuspensionPopup").modal({show: true});
                    return;
                } else {
                    if (!confirm("운영자 정보를 " + (modalType === "mod" ? "수정" : "등록") + "하시겠습니까?")) return;
                }
            }
            //if (!confirm("운영자 정보를 " + (modalType === "mod" ? "수정" : "등록") + "하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/company/doRedifySysUser', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                $("#accResetOnSuspensionPopup").modal({show: false}).remove();
                alert("운영자 정보를 " + (modalType === "mod" ? "수정" : "등록") + "하였습니다.");
                $("#sysUserModal").modal({show: false}).remove();
                // 운영자 리스트 갱신
                _this.methods.doGetSysUserList();
            } else {
                switch (code) {
                    // 예외처리 경우
                    // -1006: 이미 등록된 아이디인 경우
                    case -1006:
                        Util.validCheck($scrollWrap, $validEl, message);
                        break;
                    // -1016: 이미 등록된 휴대폰 번호인 경우
                    case -1016:
                        Util.validCheck($scrollWrap, $validEl, message);
                        break;
                    default:
                        alert(message);
                        break;
                }
            }
        },
        /**
         * 운영자 등록/수정 modal - 운영자 등록/수정 유효성 체크
         * @param $scrollWrap
         * @param $validEl
         * @param modalType (등록: reg, 수정: mod)
         * @param params
         * @returns {boolean}
         */
        sysUserValid: function ($scrollWrap, $validEl, modalType, params) {
            $validEl.html("");
            if (Util.isEmpty(params.userNm)) {
                Util.validCheck($scrollWrap, $validEl, "운영자명을 입력해 주세요.");
                return false;
            }
            if (modalType === "reg") {
                if (Util.isEmpty(params.userLoginId)) {
                    Util.validCheck($scrollWrap, $validEl, "아이디를 입력해 주세요.");
                    return false;
                }
                const loginIdRegex = /^[A-Za-z0-9]{4,12}$/;
                if (!loginIdRegex.test(params.userLoginId)) {
                    Util.validCheck($scrollWrap, $validEl, "아이디는 영문, 숫자 조합 4자~12자로 입력해 주세요.");
                    return false;
                }
            }
            if (Util.isEmpty(params.userEmail)) {
                Util.validCheck($scrollWrap, $validEl, "이메일을 입력해 주세요.");
                return false;
            }
            if (!Util.validEmail(params.userEmail)) {
                Util.validCheck($scrollWrap, $validEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.hpnmNo)) {
                Util.validCheck($scrollWrap, $validEl, "휴대폰 번호를 입력해 주세요.");
                return false;
            }
            // if (!Util.validPhone(params.hpnmNo.replaceAll("-", ""))) {
            //     Util.validCheck($scrollWrap, $validEl, "올바른 휴대폰 번호를 입력해 주세요.");
            //     return false;
            // }
            if (modalType === "reg") {
                if (Util.isEmpty(params.userPswd)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호를 입력해 주세요.");
                    return false;
                }
                if (!Util.validPassword(params.userPswd)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호가 입력 형식에 맞지 않습니다.");
                    return false;
                }
                if (Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호를 확인해 주세요.");
                    return false;
                }
                if (params.userPswd !== params.userPswdChk) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호가 일치하지 않습니다.");
                    return false;
                }
            }
            // 임직원 수정 modal - 내 정보 수정시
            if (modalType === "mod" && params.targetWptlUserNo === KSM.wptlUserNo) {
                if (Util.isEmpty(params.userPswd) && !Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호를 입력해 주세요.");
                    return false;
                }
                if (!Util.isEmpty(params.userPswd) && !Util.validPassword(params.userPswd)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호가 입력 형식에 맞지 않습니다.");
                    return false;
                }
                if (!Util.isEmpty(params.userPswd) && Util.isEmpty(params.userPswdChk)) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호를 확인해 주세요.");
                    return false;
                }
                if (params.userPswd !== params.userPswdChk) {
                    Util.validCheck($scrollWrap, $validEl, "비밀번호가 일치하지 않습니다.");
                    return false;
                }
            }
            return true;
        },
        doResetUserNmEmailHphmNo: async function (modalType, wptlUserNo = "") {
            if (Util.isEmpty(wptlUserNo)) return;
            if (modalType == "reg" && Util.isEmpty(wptlEntpNo)) return;
            const params = {
                targetWptlUserNo: Number(wptlUserNo) // 회원 시퀀스
            }
            if (!confirm("계정의 이름,이메일,휴대폰 번호가 초기화되며 계정은 다시 활성화할 수 없습니다.계속 진행하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.formPost('/api/account/doResetUserNmEmailHphmNo', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                if (modalType === "sysUser") $("#sysUserModal").modal({show: false}).remove();
                _this.methods.doGetSysUserList();
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
        /* ---------------------------------------- 운영자 관리 관련 start ---------------------------------------- */

        /**
         * 마스킹 해제
         * @param pageType
         */
        unmaskingPage: function (pageType = "company") {
            if (pageType === "company") {
                Util.replace("/company/info?unmaskYn=Y");
            } else if (pageType === "mod" || pageType === "reg") {
                inputUnmaskYn = "Y";
                $(".masking-input").each(function (idx, item) {
                    $(item).val($(item).data("realValue"));
                });
            }
        },

        /**
         * Export Contract details
         */
        downloadContractDetails: function () {
            const params = {
                wptlEntpNo: KSM.targetWptlEntpNo
            }
            ServiceExec.downPost('/api/admin/cont/exportContDtl', params);
        },

        doGetDebitAccountList: async function () {
            let params = {
                wptlEntpNo: KSM.targetWptlEntpNo
            }
            if (FH.unmaskYn === "Y") {
                params.unmaskYn = "Y";
            }
            // console.log(_this.params);
            const res = await ServiceExec.post('/api/company/doGetDebitAccountList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                const params = {
                    path: "company/info_debit_account",
                    htmlData: {
                        debitAccountList: entity
                    }
                }
                const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
                $("#debitAccountData").html(html);
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
        openPopup: async function (type, debitAccount) {
            const params = {
                wlpoDbitAcnSno: debitAccount.wlpoDbitAcnSno
            }
            const res = await ServiceExec.post('/api/company/doGetDebitAccountInfo', params);
            const accountInfo = res.entity;
            let cardCount = 0;
            if (res.code === 1) {
                if (accountInfo) {
                    cardCount = accountInfo.connectCardCount;
                } else {
                    alert("계좌가 삭제되어 작업을 진행할 수 없습니다.");
                    return;
                }

            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        return;
                }
            }

            let options = {
                message: '알림',
                showCancelButton: false,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                onConfirm: null,
                onConfirmParams: null,
                onCancel: null,
                onCancelParams: null
            }
            if (type === "DEFAULT_CONNECT_ACCOUNT") {
                const baseAccountYn = accountInfo.bscConnAcnYn;
                if (baseAccountYn === "Y") {
                    alert("이미 기본 연결 계좌로 등록되어 있습니다.");
                    return;
                }
                options.title = '기본 연결 계좌 등록';
                options.message = `새로운 카드 등록 시 현재 계좌로<br>자동 연결되도록 변경하시겠습니까?`;
                options.showCancelButton = true;
                options.onConfirmParams = {wlpoDbitAcnSno: debitAccount.wlpoDbitAcnSno};
                options.onConfirm = async function (params) {
                    await FH.methods.doDefaultConnectAccount(params.wlpoDbitAcnSno);
                }
            } else if (type === "TERMINATE") {
                if (cardCount > 0) {
                    options.title = '출금 계좌 해지 불가';
                    options.message = `선택하신 출금 계좌에 카드가 ${cardCount}개 연결되어 있습니다.<br>카드가 연결되어 있는 경우 해제할 수 없습니다.`;
                } else {
                    options.title = '출금 계좌 해지';
                    options.message = `${debitAccount.bankNm} ${debitAccount.defpayAcno} 출금 계좌 등록을<br>해지하시겠습니까?`
                    options.showCancelButton = true;
                    options.confirmButtonText = '해지하기';
                    options.onConfirmParams = {wlpoDbitAcnSno: debitAccount.wlpoDbitAcnSno};
                    options.onConfirm = async function (params) {
                        await FH.methods.doDebitAccountTerminate(params.wlpoDbitAcnSno);
                    }
                }
            } else if (type === "REAPPLY") {
                options.title = '출금 계좌 재신청';
                options.message = `계좌 등록 과정에서 오류가 발생했습니다.<br>정보를 확인하신 후 다시 신청해주세요.<br><br>- 계좌정보 : ${debitAccount.bankNm} ${debitAccount.defpayAcno}`;
                options.showCancelButton = true;
                options.confirmButtonText = '재신청';
                options.onConfirmParams = {wlpoDbitAcnSno: debitAccount.wlpoDbitAcnSno};
                options.onConfirm = async function (params) {
                    await FH.methods.doDebitAccountReApply(params.wlpoDbitAcnSno);
                }
            }
            Util.openPopup(options);
        },
        /**
         * 기업출금계좌 신규등록 modal 열기
         * @param wlpoDbitAcnSno (직불계좌시퀀스)
         * @returns {Promise<boolean>}
         */
        openDebitAccountApplyModal: async function (modalType, wlpoDbitAcnSno) {
            if (Util.isEmpty(FH.entpInfo)) {
                const res = await ServiceExec.post('/api/company/doGetContData', {
                    wptlEntpNo: FH.wptlEntpNo,
                    unmaskYn: FH.unmaskYn
                });
                FH.entpInfo = res.entity;
            }
            const params = {
                path: "modal/debitAccountApply",
                htmlData: {
                    bankList: _this.bankList,
                    entpNm: FH.entpInfo.entpNm,
                    bzno: FH.entpInfo.bzno,
                    dpsrNm: FH.entpInfo.dpsrNm,
                    wptlEntpNo: Number(FH.wptlEntpNo),
                    debitAccountInfo: null,
                    modalType: modalType,
                }
            }
            if (!Util.isEmpty(wlpoDbitAcnSno)) {
                const apiParams = {
                    wlpoDbitAcnSno: Number(wlpoDbitAcnSno),
                }
                const res = await ServiceExec.post('/api/company/doGetDebitAccountInfo', apiParams);
                params.htmlData.debitAccountInfo = res.entity;
            }

            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#debitAccountModal").length) $("#debitAccountModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#debitAccountModal").modal({show: true});
        },
        doDefaultConnectAccount: async function (wlpoDbitAcnSno) {
            const params = {
                wlpoDbitAcnSno: wlpoDbitAcnSno
            }
            const res = await ServiceExec.post('/api/company/doDefaultConnectAccount', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            $("#openPopup").modal({show: false}).remove();
            if (code === 1) {
                Util.openPopup({
                    message: '기본 연결 계좌로 변경되었습니다.',
                    onConfirm: async function () {
                        $("#openPopup").modal({show: false}).remove();
                        await FH.methods.doGetDebitAccountList();
                    }
                });
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        await FH.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                        break;
                }
            }
        },
        doDebitAccountTerminate: async function (wlpoDbitAcnSno) {
            const params = {
                wlpoDbitAcnSno: wlpoDbitAcnSno
            }
            const res = await ServiceExec.post('/api/company/doDebitAccountTerminate', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            $("#openPopup").modal({show: false}).remove();
            if (code === 1) {
                Util.openPopup({
                    message: '출금 계좌 등록을 해지하였습니다.',
                    onConfirm: async function () {
                        $("#openPopup").modal({show: false}).remove();
                        await FH.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                    }
                });
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        // 출금계좌리스트 갱신
                        await _this.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                        break;
                }
            }
        },
        doGetBankList: async function () {
            const res = await ServiceExec.post('/api/company/doGetBankList');
            _this.bankList = res.entity;
        },
        /**
         * 출금 계좌 등록
         */
        doRedifyDebitAccount: async function (modalType, wlpoDbitAcnSno) {
            let defpayTsfrAplfFile = $("#defpayTsfrAplfFile")[0].files[0];
            let params;

            if (modalType === "reg") {
                params = {
                    requestType: modalType,
                    wptlEntpNo: Number($("#wptlEntpNo").val()),
                    bankCd: $("#bankCd").val(),
                    defpayAcno: $("#defpayAcno").val(),
                    defpayTsfrAplfFile: {},
                    defpayTsfrAplfFileNm: "",
                    defpayTsfrAplfFilePthNm: "",
                }
                if (Util.isEmpty(params.bankCd)) {
                    alert("은행을 선택해 주세요.");
                    return;
                }
                if (Util.isEmpty(params.defpayAcno)) {
                    alert("계좌번호를 입력해 주세요.");
                    return;
                }
                if (params.defpayAcno.length < 10 || params.defpayAcno.length > 15) {
                    alert("유효한 계좌번호를 입력해 주세요.");
                    return;
                }
            } else {
                params = {
                    requestType: modalType,
                    wlpoDbitAcnSno: Number(wlpoDbitAcnSno),
                    wptlEntpNo: Number($("#wptlEntpNo").val()),
                    defpayTsfrAplfFile: {},
                    defpayTsfrAplfFileNm: "",
                    defpayTsfrAplfFilePthNm: "",
                }
            }
            if (defpayTsfrAplfFile !== undefined) {
                params.defpayTsfrAplfFile = defpayTsfrAplfFile;
            } else {
                alert("양식을 다운로드 받으신 후 출금 이체 신청서를 작성하여 등록해주세요.")
                return;
            }

            params.defpayTsfrAplfFileNm = $("#defpayTsfrAplfFileNm").val();
            params.defpayTsfrAplfFilePthNm = $("#defpayTsfrAplfFilePthNm").val();

            if (!confirm("출금 계좌를 등록하시겠습니까?")) return;

            const res = await ServiceExec.formPost('/api/company/doDebitAccountApply', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert("출금 계좌 등록을 신청하였습니다. 관리자 승인 후 사용하실 수 있습니다.");
                $("#debitAccountModal").modal({show: false}).remove();
                // 출금계좌리스트 갱신
                await _this.methods.doGetDebitAccountList();
                if ($(".table-body").length) {
                    Util.setReportHeight($(".table-body"));
                }
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        // 출금계좌리스트 갱신
                        await _this.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                        break;
                }
            }
        },
        doDebitAccountReApply: async function(wlpoDbitAcnSno) {
            const params = {
                wlpoDbitAcnSno: wlpoDbitAcnSno,
            }
            const res = await ServiceExec.post('/api/company/doDebitAccountReApply', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            $("#openPopup").modal({show: false}).remove();
            if (code === 1) {
                Util.openPopup({
                    message: '출금 계좌 등록을 신청하였습니다. 관리자 승인 후 사용하실 수 있습니다.',
                    onConfirm: async function () {
                        $("#openPopup").modal({show: false}).remove();
                        await FH.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                    }
                });
            } else {
                switch (code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        alert(message);
                        // 출금계좌리스트 갱신
                        await _this.methods.doGetDebitAccountList();
                        if ($(".table-body").length) {
                            Util.setReportHeight($(".table-body"));
                        }
                        break;
                }
            }
        }
    },
    init: async function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        Toast.methods.getListInfo();
        const unmaskYnParam = new URL(location.href).searchParams.get("unmaskYn");
        if (!Util.isEmpty(unmaskYnParam)) {
            FH.unmaskYn = unmaskYnParam;
        }
        await _this.methods.doGetDebitAccountList();
        await _this.methods.doGetBankList();
        history.replaceState({}, null, location.pathname);
        if ($(".table-body").length) {
            Util.setReportHeight($(".table-body"));
        }
    }
}

window.FH = FH;
FH.init();
