// 관리자 - 계약 현황 상세 js
let _this;
const FH = {
    scrollWrap: $(".content"),
    validEl: null,
    wptlEntpNo: "",
    contDetail: null,
    field: null,
    cellEl: null,
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
            // 계약 심사 영역 - 승인/반려 선택 변경시
            $(document).on("change", "input:radio[name=wptlEntpStCd]", function () {
                // $("#aspId option:eq(0)").prop("selected", true);               // 승인 ASP ID 초기화
                $("#aspId").val("953365000000000");
                $("#rjRsnCd option:eq(0)").prop("selected", true);             // 반려 사유 코드 초기화
                const $rjRsnCn = $("#rjRsnCn");
                $rjRsnCn.val("");                                              // 반려 사유 초기화
                $rjRsnCn.attr("disabled", false);                              // 반려 사유 활성화
                const isApprove = $(this).val() === ConstCode.CODES_COMPANY.CONTRACT.ACCEPT_SAVE
                $(".aprvWrap").css("display", (isApprove ? "block" : 'none')); // 승인 영역 토글
                $(".rjWrap").css("display", (isApprove ? "none" : 'block'));   // 반려 영역 토글
            });
            // 계약 심사 영역 - 반려 사유 코드 변경시
            $(document).on("change", "#rjRsnCd", function () {
                const $rjRsnCn = $("#rjRsnCn");
                $rjRsnCn.val("");                     // 반려 사유 초기화
                const isDirect = $(this).val() === ConstCode.CODES_COMPANY.REJECT_REASON.DIRECT;
                $rjRsnCn.attr("disabled", !isDirect); // 반려 사유 disabled 토글
            });
        }
    },
    methods: {
        /**
         * 계약 현황 상세 - 데이터 조회
         * @returns {Promise<boolean>}
         */
        doGetContDtl: async function (type) {
            const params = {
                wptlEntpNo: Number(_this.wptlEntpNo) // 기업 시퀀스
            }
            if( type === 'unmask' ) {
                params.unmaskYn = "Y";
            }
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/cont/doGetContDtl', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.contDetail = entity;
                _this.methods.getPageContent();
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
         * 계약 현황 상세 - 내용 페이지 호출
         * @returns {Promise<void>}
         */
        getPageContent: async function () {
            const params = {
                path: "admin/cont/detail_content",
                htmlData: {
                    contDetail: _this.contDetail
                }
            }
            // 심사처 리스트 조회
            const asp = await ServiceExec.post('/api/admin/cont/doGetAspList');
            params.htmlData.aspList = asp.entity;
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            $(".content-body").html(html);

            //memobox will get the height for content height
            const memobox = $(".memo-box");
            if (memobox.length && !Util.isEmpty(memobox.val())) {
                setTimeout(() => {
                    Util.resizeTextarea(memobox[0]);
                }, 300);
            }
        },
        /**
         * 계약 심사
         * @param wptlEntpNo (기업 시퀀스)
         * @returns {Promise<void>}
         */
        doContAudit: async function (wptlEntpNo) {
            const wptlEntpStCd = $("input:radio[name=wptlEntpStCd]:checked").val();
            const wptlEntpStNm = wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.REJECT_SAVE
                                ? "반려"
                                : "승인";
            const params = {
                wptlEntpNo: Number(wptlEntpNo),       // 기업 시퀀스
                wptlEntpStCd: wptlEntpStCd,           // 심사 타입 (승인, 반려)
                aspId: "",                            // 심사처 ID  
                rjRsnCd: "",                          // 반려 사유 코드
                rjRsnCn: "",                           // 반려 사유
                corpAcnDbCrdUseYn: $("input:radio[name=corpAcnDbCrdUseYn]:checked").val()
            }
            if (wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.REJECT_SAVE) {
                const rjRsnCd = $("#rjRsnCd").val();
                params.rjRsnCd = rjRsnCd;
                params.rjRsnCn = rjRsnCd === ConstCode.CODES_COMPANY.REJECT_REASON.DIRECT
                                  ? $("#rjRsnCn").val()
                                  : $("#rjRsnCd option:selected").text();
            } else {
                params.aspId = $("#aspId").val();
            }
            if (!_this.methods.auditValid(params)) return;
            if (!confirm(wptlEntpStNm +  " 처리 하시겠습니까?")) return;
            // console.log(params);
            const res = await ServiceExec.post('/api/admin/cont/doContAudit', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                alert(wptlEntpStNm +  "처리 되었습니다.");
                Util.replace("/admin/cont/list");
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
         * 계약 심사 유효성 체크
         * @param params
         * @returns {boolean}
         */
        auditValid: function (params) {
            _this.validEl.html("");
            // 반려, 반려 코드 "직접 입력"인 경우, 반려 사유 체크
            if (params.wptlEntpStCd === ConstCode.CODES_COMPANY.CONTRACT.REJECT_SAVE &&
                params.rjRsnCd === ConstCode.CODES_COMPANY.REJECT_REASON.DIRECT && Util.isEmpty(params.rjRsnCn)) {
                Util.validCheck(_this.scrollWrap, _this.validEl, "반려 사유를 입력해 주세요.");
                return false;
            }
            return true;
        },
        /**
         * Export Contract details
         */
        downloadContractDetails: function () {
            const params = {
                wptlEntpNo: _this.wptlEntpNo
            }
            ServiceExec.downPost('/api/admin/cont/exportContDtl', params);
        },
        openMemoModal: async function(type) {
            const params = {
                path: "modal/contDetailsMemo",
                htmlData: {
                    wptlEntpNo: _this.wptlEntpNo,
                    modalType: type
                }
            }
            const html = await ServiceExec.htmlGet('/common/doGetHtml', params);
            if ($("#contDetailsMemoModal").length) $("#contDetailsMemoModal").remove();
            $("body").children("a.btn-top").after(html);
            $("#contDetailsMemoModal").modal({show: true});

            CONST_DETAILS_MEMO.wptlEntpNo = _this.wptlEntpNo;

            if( type === "mod" ) {
                await CONST_DETAILS_MEMO.methods.doGetMemoCn();
            }
            $("#memoCn").trigger("keyup");
        },

        open(cell) {
            _this.field = cell.getAttribute('data-field');
            _this.cellEl = cell;
            const value = cell.getAttribute('data-value');
            const tagSection = document.getElementById("current-tag-section");
            value ? (tagSection.style.display = "flex") : (tagSection.style.display = "none");
           
            // Set current tag
            document.getElementById('current-tag').innerText = value || '';
            document.getElementById('tag-search-input').value = '';
            document.getElementById('tag-search-result').innerHTML = '';
            const popup = document.getElementById("tag-popup");
            const rect = cell.getBoundingClientRect();
            popup.style.left = rect.left - 110 + "px";
            popup.style.top = rect.height - 20 + "px";
            // Show popup with animation
            popup.classList.add("show");
            this.searchTags()
        },

        close: function () {
            document.getElementById("tag-popup").classList.remove("show");
        },

        removeTag: async function () {
            const {cellEl, field} = _this;
            const params = {
                wptlEntpNo: FH.wptlEntpNo,
                [field]: "",
            };
            const res = await ServiceExec.post("/api/admin/cont/updateContDetailField", params);
            const code = res.code;
            const message = res.message;
            if (code === 1) {
                // Update UI
                const tagSection = document.getElementById("current-tag-section");
                tagSection.style.display = "none";
                document.getElementById("current-tag").textContent = "";
                cellEl.querySelector(".selected-tag").innerText = "태그 선택";
                cellEl.setAttribute("data-value", "");
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }
        },

        searchTags: async function () {
            const query = document.getElementById("tag-search-input").value.trim();
            const resultEl = document.getElementById("tag-search-result");
            resultEl.innerHTML = "";

            const {cellEl, field} = _this;
            const params = {
                type: field,
                value: query || "",
            };
            let matched;
            const res = await ServiceExec.post("/api/admin/cont/doGetTag", params);
            const code = res.code;
            const message = res.message;
            if (code === 1) {
                matched = res.entity;
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }

            // Display matched tags
            matched.forEach(({value}) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("tag-result-wrapper");

                // Left: Tag name
                const tagText = document.createElement("div");
                tagText.innerText = value;
                tagText.classList.add("tag-name");
                tagText.onclick = () => FH.methods.selectTag(value);

                // Right: Delete icon
                const deleteBtn = document.createElement("div");
                deleteBtn.innerText = "×";
                deleteBtn.classList.add("tag-delete");
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation(); // Prevent triggering the selectTag
                    const res = await ServiceExec.post("/api/admin/cont/removeTag", { type: field, value: value });
                    if (res.code === 1) {
                        wrapper.remove(); // Remove from UI on success
                    } else {
                        alert(res.message);
                    }
                };

                wrapper.appendChild(tagText);
                wrapper.appendChild(deleteBtn);
                resultEl.appendChild(wrapper);
            });
            // If no match, suggest to add new tag
            if (matched.length === 0 && query) {
                const div = document.createElement("div");
                div.innerText = `+ ${query}`;
                div.classList.add("tag-result-item");
                div.onclick = async () => {
                    // Save to database
                    const res = await ServiceExec.post("/api/admin/cont/addTag", params);
                    const code = res.code;
                    const message = res.message;
                    if (code === 1) {
                        // Then select the tag
                        FH.methods.selectTag(query);
                    } else {
                        switch (code) {
                            default:
                                alert(message);
                                break;
                        }
                    }
                };
                resultEl.appendChild(div);
            }
        },

        selectTag : async function (tagName) {
            document.getElementById('current-tag').textContent = tagName;
            document.getElementById('current-tag-section').style.display = 'flex';
            const { cellEl, field } = _this;
            console.log('field',field)
            const params = {
                wptlEntpNo: FH.wptlEntpNo,
                [field]: tagName,
            };
            const res = await ServiceExec.post('/api/admin/cont/updateContDetailField', params);
            const code = res.code;
            const message = res.message;
            console.log('code=======',code)
            if (code === 1) {
                const child = cellEl.querySelector('.selected-tag')
                if (child) {
                    child.innerText = tagName;
                } else {
                    cellEl.innerText = tagName;
                }

                cellEl.setAttribute('data-value', tagName);
            } else {
                switch (code) {
                    default:
                        alert(message);
                        break;
                }
            }
            FH.methods.close();
        },
    },

    init: function () {
        //Remove the tag popup when click outside the popup.
        document.addEventListener("click", function (e) {
            const popup = document.getElementById("tag-popup");
            if (!popup.contains(e.target) && !e.target.closest(".tag-cell")) {
                FH.methods.close();
            }
        });
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
    }
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}
// Create the debounced version
FH.methods.debouncedSearchTags = debounce(FH.methods.searchTags, 500);
window.FH = FH;
FH.init();
