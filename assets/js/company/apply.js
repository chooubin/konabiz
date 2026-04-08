import "/js/common/File.js?version=2025010801";

// 서비스 계약 신청 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    termsDetail: null,
    entpValidEl: $("#entpValid"),
    reppValidEl: $("#reppValid"),
    acValidEl: $("#acValid"),
    fileValidEl: $("#fileValid"),
    wptlEntpNo: "",
    wptlEntpStCd: "",
    bindAddr: null,
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
            // 법인등록번호 영역 - 사업자 유형 변경시
            $("input:radio[name=psnlCorpBznmDvCd]").on("change", function () {
                _this.fileValidEl.html("");
                let isCorp = $(this).val() === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE;
                let corpWrapTC = $(".corpWrapTC");
                corpWrapTC.css("display", (isCorp ? "table-cell" : "none"));      // 법인 등록번호 영역 토글
                corpWrapTC.eq(0).prev().attr("colspan", (isCorp ? "3" : "5"));
                $(".corpWrapTR").css("display", (isCorp ? "table-row" : "none")); // 법인 인감 등록 영역 토글
                $(".corpWrapB").css("display", (isCorp ? "block" : "none"));      // 추가 서류 등록 영역 토글
            })
        },
        /**
         * focus 이벤트
         */
        // focusEvent: function() {
        //     $(document).on("focusout", '#acno', function() {
        //         Util.inputNumberOnly(this);
        //     })
        // },
    },
    methods: {
        /**
         * 주소 검색창 열기
         * @param type (회사: entp, 대표자: repp)
         */
        openSearchAddress: function (type = "entp") {
            window.open("/common/doOpenJusoPopup", "pop", "width=570, height=420, scrollbars=yes, resizable=no")
            window.removeEventListener("message", FH.bindAddr);
            FH.bindAddr = function ({data}) {
                if (data.operate === "JUSO") {
                    // console.log(data.data);
                    if (type === "entp") {
                        $("#zipCd").val(data.data.zipNo);
                        $("#addr").val(data.data.roadAddrPart1);
                        $("#dtlAddr").val(data.data.addrDetail);
                    }
                    if (type === "repp") {
                        $("#reppZipCd").val(data.data.zipNo);
                        $("#reppAddr").val(data.data.roadAddrPart1);
                        $("#reppDtlAddr").val(data.data.addrDetail);
                    }
                }
            }
            window.addEventListener("message", FH.bindAddr);
        },
        /**
         * 서비스 계약 신청
         * @param wptlEntpStCd (서비스 계약 코드)
         * @returns {Promise<void>}
         */
        applyCont: async function (wptlEntpStCd) {
            const psnlCorpBznmDvCd = $("input:radio[name=psnlCorpBznmDvCd]:checked").val();
            const reppSexCd = $("input:radio[name=reppSexCd]:checked").val();
            const bsrgcFile = $("#bsrgcFile")[0].files[0];
            const bnkbCpyFile = $("#bnkbCpyFile")[0].files[0];
            const reppIdfcFile = $("#reppIdfcFile")[0].files[0];

            const bsrgcFilePthNm = $("#bsrgcFilePthNm").val();
            const bnkbCpyFilePthNm = $("#bnkbCpyFilePthNm").val();
            const reppIdfcFilePthNm = $("#reppIdfcFilePthNm").val();
            const corpSealCerFilePthNm = $("#corpSealCerFilePthNm").val();
            const stchNmlsFilePthNm = $("#stchNmlsFilePthNm").val();
            const nvstorNmlsFilePthNm = $("#nvstorNmlsFilePthNm").val();
            const afasFilePthNm = $("#afasFilePthNm").val();

            const params = {
                wptlEntpNo: !Util.isEmpty(_this.wptlEntpNo) ? Number(_this.wptlEntpNo) : "",                    // 기업 시퀀스
                wptlUserNo: KSM.targetWptlUserNo,                                                               // 회원 시퀀스
                wptlEntpStCd: wptlEntpStCd,                                                                     // 서비스 계약 코드 (임시저장, 저장)
                entpNm: $("#entpNm").val().trim(),                                                              // 회사명
                bzctNm: $("#bzctNm").val().trim(),                                                              // 업태
                itemNm: $("#itemNm").val().trim(),                                                              // 종목
                psnlCorpBznmDvCd: psnlCorpBznmDvCd,                                                             // 사업자 유형
                bzno: $("#bzno").val().trim(),                                                                  // 사업자등록번호
                corpTlno: $("#corpTlno").val().trim(),                                                          // 대표번호
                zipCd: $("#zipCd").val(),                                                                       // 회사 주소 우편번호
                addr: $("#addr").val().trim(),                                                                  // 회사 주소
                hmphAddr: $("#hmphAddr").val().trim(),                                                          // 홈페이지
                dtlAddr: $("#dtlAddr").val().trim(),                                                            // 회사 상세주소
                corpRegno: "",                                                                                  // 법인등록번호
                reppNm: $("#reppNm").val().trim(),                                                              // 대표자 이름
                reppTlno: $("#reppTlno").val().trim(),                                                          // 대표자 전화번호
                reppEmailAddr: $("#reppEmailAddr").val().trim(),                                                // 대표자 이메일    
                reppHpnmNo: $("#reppHpnmNo").data("realValue"),                                                 // 대표자 휴대폰번호
                reppBirthDt: $("#reppBirthDt").val().trim(),                                                    // 대표자 생년월일
                reppNltyCd: $("input:radio[name=reppNltyCd]:checked").val(),                                    // 내/외국인
                reppZipCd: $("#reppZipCd").val(),                                                               // 대표자 주소 우편번호
                reppAddr: $("#reppAddr").val().trim(),                                                          // 대표자 주소
                reppSexCd: !Util.isEmpty(reppSexCd) ? reppSexCd : "",                                           // 대표자 성별
                reppDtlAddr: $("#reppDtlAddr").val().trim(),                                                    // 대표자 상세주소

                bankCd: $("#bankCd").val(),                                                                     // 은행 코드    
                bankNm: $("#bankCd option:selected").text(),                                                    // 은행 이름
                acno: $("#acno").data("realValue"),                                                             // 계좌번호
                dpsrNm: $("#dpsrNm").val().trim(),                                                              // 예금주

                bsrgcFileNm : $("#bsrgcFileNm").val(),                                                          // 사업자등록증 파일 이름
                bsrgcFilePthNm : $("#bsrgcFilePthNm").val(),                                                    // 사업자등록증 파일 경로
                bnkbCpyFileNm: $("#bnkbCpyFileNm").val(),                                                       // 통장 사본 파일 이름
                bnkbCpyFilePthNm: $("#bnkbCpyFilePthNm").val(),                                                 // 통장 사본 파일 경로
                reppIdfcFileNm : $("#reppIdfcFileNm").val(),                                                    // 대표자 신분증 파일 이름
                reppIdfcFilePthNm : $("#reppIdfcFilePthNm").val(),                                              // 대표자 신분증 파일 경로
                corpSealCerFileNm: "",                                                                          // 법인인감 증명서 파일 이름
                corpSealCerFilePthNm: "",                                                                       // 법인인감 증명서 파일 경로
                stchNmlsFileNm: "",                                                                             // 주주명부 파일 이름
                stchNmlsFilePthNm: "",                                                                          // 주주명부 파일 경로
                nvstorNmlsFileNm: "",                                                                           // 출자자/출연자 명부 파일 이름
                nvstorNmlsFilePthNm: "",                                                                        // 출자자/출연자 명부 파일 경로
                afasFileNm: "",                                                                                 // 정관 파일 이름
                afasFilePthNm: "",
                signedText: ""
            }

            if(Util.isEmpty(params.reppHpnmNo)) {
                params.reppHpnmNo = "";
            }
            if(Util.isEmpty(params.acno)) {
                params.acno = "";
            }
            if(bsrgcFile !== undefined) {
                params.bsrgcFile = bsrgcFile;  // 사업자등록증 파일
            }

            if(bnkbCpyFile !== undefined) {
                params.bnkbCpyFile = bnkbCpyFile;   // 통장 사본 파일
            }

            if(reppIdfcFile !== undefined) {
                params.reppIdfcFile = reppIdfcFile; // 대표자 신분증 파일
            }

            if (psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                let corpSealCerFile = $("#corpSealCerFile")[0].files[0];
                let stchNmlsFile = $("#stchNmlsFile")[0].files[0];
                let nvstorNmlsFile = $("#nvstorNmlsFile")[0].files[0];
                let afasFile = $("#afasFile")[0].files[0];
                params.corpRegno = $("#corpRegno").val().trim();

                if(corpSealCerFile !== undefined) {
                    params.corpSealCerFile = corpSealCerFile;   // 법인인감 증명서 파일
                }

                params.corpSealCerFileNm = $("#corpSealCerFileNm").val();
                params.corpSealCerFilePthNm = corpSealCerFilePthNm;

                if(stchNmlsFile !== undefined) {
                    params.stchNmlsFile = stchNmlsFile; // 주주명부 파일
                }

                params.stchNmlsFileNm = $("#stchNmlsFileNm").val();
                params.stchNmlsFilePthNm = stchNmlsFilePthNm;

                if(nvstorNmlsFile !== undefined) {
                    params.nvstorNmlsFile = nvstorNmlsFile; // 출자자/출연자 명부 파일
                }

                params.nvstorNmlsFileNm = $("#nvstorNmlsFileNm").val();
                params.nvstorNmlsFilePthNm = nvstorNmlsFilePthNm;

                if(afasFile !== undefined) {
                    params.afasFile = afasFile; // 정관 파일
                }

                params.afasFileNm = $("#afasFileNm").val();
                params.afasFilePthNm = afasFilePthNm;
            }
            let confirmText = "";
            let alertText = "";
            switch (wptlEntpStCd) {
                case ConstCode.CODES_COMPANY.CONTRACT.TEMP_SAVE:
                    if (!_this.methods.tempSaveValid(params)) return;
                    confirmText = "계약 신청 정보를 임시 저장하시겠습니까?";
                    alertText = "계약 신청 정보를 임시 저장하였습니다.";
                    break;
                case ConstCode.CODES_COMPANY.CONTRACT.APPLY_SAVE:
                    if (!_this.methods.applyValid(params)) return;
                    confirmText = "서비스 계약을 신청하시겠습니까?";
                    alertText = "서비스 계약을 신청하였습니다.";
                    break;
            }
            if (!confirm(confirmText)) return;

            if( wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.APPLY_SAVE ) {
                await FH.methods.doApplyCont(params, alertText);
                // unisign.SignData(params.bzno, null,
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
                //             FH.methods.doApplyCont(params, alertText);
                //         }
                //
                //     }
                // );
            } else if ( wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.TEMP_SAVE ) {
                await FH.methods.doApplyCont(params, alertText);
            }
        },
        doApplyCont: async function( params, alertText ) {
            // console.log(params);
            const res = await ServiceExec.formPost('/api/company/doApplyCont', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(alertText);
                Util.replace("/main/dashboard");
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
         * 서비스 계약 임시저장 유효성 체크
         * @param params
         * @returns {boolean}
         */
        tempSaveValid: function (params) {
            _this.entpValidEl.html("");
            _this.reppValidEl.html("");
            _this.acValidEl.html("");
            _this.fileValidEl.html("");
            if (!Util.isEmpty(params.bzno) && !Util.validBzNo(params.bzno)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "사업자등록번호가 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (!Util.isEmpty(params.corpTlno) && params.corpTlno.indexOf("-") < 0) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "올바른 대표번호를 입력해 주세요.");
                return false;
            }
            // 법인사업자인 경우, 관련 정보 체크
            if (!Util.isEmpty(params.corpRegno) && params.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                if (!Util.validCorpRegNo(params.corpRegno)) {
                    Util.validCheck(_this.scrollWrap, _this.entpValidEl, "법인등록번호가 입력 형식에 맞지 않습니다.");
                    return false;
                }
            }

            if (!Util.isEmpty(params.reppTlno) && params.reppTlno.indexOf("-") < 0) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "올바른 전화번호를 입력해 주세요.");
                return false;
            }
            if (!Util.isEmpty(params.reppEmailAddr) && !Util.validEmail(params.reppEmailAddr)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (!Util.isEmpty(params.reppHpnmNo) && !Util.validPhone(params.reppHpnmNo.replaceAll("-", ""))) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "올바른 휴대폰 번호를 입력해 주세요.");
                return false;
            }
            if (!Util.isEmpty(params.reppBirthDt) && !Util.validBirth(params.reppBirthDt)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "생년월일이 입력 형식에 맞지 않습니다.");
                return false;
            }

            return true;
        },
        /**
         * 서비스 계약 신청 유효성 체크
         * @param params
         * @returns {boolean}
         */
        applyValid: function (params) {
            _this.entpValidEl.html("");
            _this.reppValidEl.html("");
            _this.acValidEl.html("");
            _this.fileValidEl.html("");
            // 사업자정보 영역 유효성 체크
            if (Util.isEmpty(params.entpNm)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "회사명을 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.bzctNm)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "업태를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.itemNm)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "종목을 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.bzno)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "사업자등록번호를 입력해 주세요.");
                return false;
            }
            if (!Util.validBzNo(params.bzno)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "사업자등록번호가 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.corpTlno)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "대표번호를 입력해 주세요.");
                return false;
            }
            if (params.corpTlno.indexOf("-") < 0) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "올바른 대표번호를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.zipCd) || Util.isEmpty(params.addr)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "주소를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.dtlAddr)) {
                Util.validCheck(_this.scrollWrap, _this.entpValidEl, "상세주소를 입력해 주세요.");
                return false;
            }
            // 법인사업자인 경우, 관련 정보 체크
            if (params.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                if (Util.isEmpty(params.corpRegno)) {
                    Util.validCheck(_this.scrollWrap, _this.entpValidEl, "법인등록번호를 입력해 주세요.");
                    return false;
                }
                if (!Util.validCorpRegNo(params.corpRegno)) {
                    Util.validCheck(_this.scrollWrap, _this.entpValidEl, "법인등록번호가 입력 형식에 맞지 않습니다.");
                    return false;
                }
            }
            // 대표자정보 영역 유효성 체크
            if (Util.isEmpty(params.reppNm)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "대표자명을 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppTlno)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "전화번호를 입력해 주세요.");
                return false;
            }
            if (params.reppTlno.indexOf("-") < 0) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "올바른 전화번호를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppEmailAddr)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "이메일을을 입력해 주세요.");
                return false;
            }
            if (!Util.validEmail(params.reppEmailAddr)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "이메일 형식이 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.reppHpnmNo)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "휴대폰 번호를 입력해 주세요.");
                return false;
            }
            if (!Util.validPhone(params.reppHpnmNo.replaceAll("-", ""))) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "올바른 휴대폰 번호를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppBirthDt)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "생년월일을 입력해 주세요.");
                return false;
            }
            if (!Util.validBirth(params.reppBirthDt)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "생년월일이 입력 형식에 맞지 않습니다.");
                return false;
            }
            if (Util.isEmpty(params.reppZipCd) || Util.isEmpty(params.reppAddr)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "대표자 주소를 입력해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppSexCd)) {
                Util.validCheck(_this.scrollWrap, _this.reppValidEl, "대표자 성별을 입력해 주세요.");
                return false;
            }
            // 계좌정보 영역 유효성 체크
            if (Util.isEmpty(params.bankCd)) {
                Util.validCheck(_this.scrollWrap, _this.acValidEl, "은행을 선택해 주세요.");
                return false
            }
            if (Util.isEmpty(params.acno)) {
                Util.validCheck(_this.scrollWrap, _this.acValidEl, "계좌번호를 입력해 주세요.");
                return false
            }
            if (!Util.validBankAccount(params.acno)) {
                Util.validCheck(_this.scrollWrap, _this.acValidEl, "계좌번호는 숫자만 입력해 주세요.");
                return false
            }
            if (Util.isEmpty(params.dpsrNm)) {
                Util.validCheck(_this.scrollWrap, _this.acValidEl, "예금주를 입력해 주세요.");
                return false
            }
            // 첨부파일 영역 유효성 체크
            if (Util.isEmpty(params.bsrgcFile) && Util.isEmpty(params.bsrgcFileNm)) {
                Util.validCheck(_this.scrollWrap, _this.fileValidEl, "사업자등록증을 첨부해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.bnkbCpyFile) && Util.isEmpty(params.bnkbCpyFileNm)) {
                Util.validCheck(_this.scrollWrap, _this.fileValidEl, "통장사본을 첨부해 주세요.");
                return false;
            }
            if (Util.isEmpty(params.reppIdfcFile) && Util.isEmpty(params.reppIdfcFileNm)) {
                Util.validCheck(_this.scrollWrap, _this.fileValidEl, "대표자 신분증 사본을 첨부해 주세요.");
                return false;
            }
            // 법인사업자인 경우, 관련 첨부파일 체크
            if (params.psnlCorpBznmDvCd === ConstCode.CODES_COMPANY.BIZ_TYPE.CORPORATE) {
                if (Util.isEmpty(params.corpSealCerFile) && Util.isEmpty(params.corpSealCerFileNm)) {
                    Util.validCheck(_this.scrollWrap, _this.fileValidEl, "법인 인감 증명서를 첨부해 주세요.");
                    return false;
                }
                if ((Util.isEmpty(params.stchNmlsFile) && Util.isEmpty(params.stchNmlsFileNm)) &&
                    (Util.isEmpty(params.nvstorNmlsFile) && Util.isEmpty(params.nvstorNmlsFileNm)) &&
                    (Util.isEmpty(params.afasFile) && Util.isEmpty(params.afasFileNm))) {
                    Util.validCheck(_this.scrollWrap, _this.fileValidEl, "주주명부, 출자자/출연자 명부, 정관 중 최소 한 개 이상의 파일을 첨부해 주세요.");
                    return false;
                }
            }
            let agree = $("#psnlPrv").is(":checked") ? "Y" : "N"
            if (agree !== "Y") {
                alert("개인정보 수집 및 이용 동의 후 서비스 계약 신청이 가능합니다.");
                return false;
            }
            return true;
        },
        /**
         * 최신 약관 조회
         * @returns {Promise<void>}
         */
        getLatestTerms: async function () {
            const res = await ServiceExec.post('/api/terms/doGetLatestTerms');
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.termsDetail = entity;
            } else {
                // switch (code) {
                // 예외처리 경우
                // case :
                //     break;
                // default:
                //     alert(message);
                //     break;
                // }
            }
        },
        /**
         * 약관 modal 열기
         * @param modalType (개인정보: psnl)
         * @returns {Promise<void>}
         */
        openTermsModal: async function (modalType = "contract") {
            let params = {
                path: "modal/terms",
                htmlData: {
                    pageType: 'apply',
                    modalType: modalType,
                    termsDetail: _this.termsDetail
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#termsModal").length) $("#termsModal").remove();
            $("body").children("script").first().before(html);
            $("#termsModal").modal({show: true});
        },
        /**
         * 약관 modal - 약관 동의
         * @param type (개인정보: psnl)
         */
        doAgree: function (type) {
            $("#termsModal").modal({show: false}).remove();
            $("#" + type + "Prv").prop("checked", true);
        },
        /**
         * 서비스 계약 심사중 modal 열기
         * @returns {Promise<void>}
         */
        openApplyModal: async function () {
            // 서비스 계약 신청한 경우에만 modal 열기
            if (Util.isEmpty(_this.wptlEntpStCd) || _this.wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.TEMP_SAVE) return;
            const params = {
                path: "modal/apply"
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#applyModal").length) $("#applyModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#applyModal").modal({show: true});
        },
        unmaskingPage: function() {
            inputUnmaskYn = "Y";
            $(".masking-input").each( function(idx, item) {
                $(item).val( $(item).data("realValue") );
            });
        }
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        _this.methods.getLatestTerms();
        Util.deleteCookie("listInfo");
    }
}

window.FH = FH;
FH.init();