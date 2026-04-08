// main js
let _this;
const FH = {
    // INDEX
    inquiryValidEl: $("#inquiryValid"),
    termsDetail: null,
    // FAQ
    pagination: null,
    paginationFlag: false,
    page: 1,
    limit: 20,
    totalCount: 0,
    virtualNum: 0,
    wptlBlbdClNo: "",
    events: {
        // /**
        //  * key 이벤트
        //  */
        // keyEvent: function () {
        // },
        /**
         * click 이벤트
         */
        clickEvent: function () {
            // modal 닫을때 element 제거
            $(document).on("click", '.modal [data-dismiss="modal"]', function() {
                $(this).closest(".modal").remove();
            })
            // FAQ 카테고리 영역 - 카테고리 선택 변경 시 (모바일 버전)
            $(".faq-head .dropdown-menu a").click(function(){
                $(".dropdown-toggle").text($(this).text());
            })
            // FAQ 리스트 영역 - FAQ 제목 클릭 시
            $(document).on("click", ".faq ul li .q", function () {
                $(this).siblings().stop().slideToggle(300);
                return false;
            })
        },
        // /**
        //  * change 이벤트
        //  */
        // changeEvent: function () {
        // }
    },
    methods: {
        isEmpty: function (value) {
            return (value == '' || value === '' || value == 'null' ||
                value == undefined || value === undefined ||
                value == null || value === null ||
                (value !== null && typeof value == 'object' && !Object.keys(value).length));
        },
        validEmail: function (value) {
            if (this.isEmpty(value)) return false;
            let regExp = /^([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
            return (regExp.test(value));
        },
        post: function (path, payload) {
            let promise = new Promise(resolve => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: payload,
                    dataType: 'JSON',
                    async: false,
                    // processData: false,
                    // contentType: false,
                    // enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                    },
                    success: resolve,
                    error: function (xhr, status, error) {
                        console.log('error');
                        console.log(xhr.status + error);
                    }
                })
            });

            return promise.then(res => res);
        },
        htmlGet: function (path, payload) {
            let promise = new Promise(resolve => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: JSON.stringify(payload),
                    dataType: 'HTML',
                    async: false,
                    // processData: false,
                    contentType: 'application/json',
                    // enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                    },
                    success: resolve,
                    error: function (xhr, status, error) {
                        console.log('error');
                        console.log(xhr.status + error);
                    }
                })
            });

            return promise.then(res => res);
        },
        postNewsLetter: function (email) {
            $.ajax({
                url: 'https://api.stibee.com/v1/lists/189998/subscribers',
                type: 'POST',
                data: JSON.stringify({
                    eventOccuredBy: 'SUBSCRIBER',
                    confirmEmailYN: 'N',
                    groupIds: ['205783'],
                    subscribers: [
                        {
                            email: email
                        }
                    ]
                }),
                dataType: 'JSON',
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    console.log('beforeSend');
                    xhr.setRequestHeader('AccessToken', 'dbe416b5831109c073d75e7027be9b34b6da4af626cc2277df76a99b779813f50723a947634c5d814490cd94808ed69ae636e6689495b4b5254bf5be3f7da3ba');
                },
                complete: function () {
                    console.log('complete');
                },
                success: function (result) {
                    console.log('success');
                    console.log(result);
                },
                error: function (xhr, status, error) {
                    console.log('error');
                    console.log(xhr.status + error);
                }
            })
        },

        /* ---------------------------------------- 공통 약관 start ---------------------------------------- */
        /**
         * 최신 약관 조회
         * @returns {Promise<void>}
         */
        getLatestTerms: async function () {
            const res = await FH.methods.post('/api/terms/doGetLatestTerms');
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
         * * 약관 modal 열기
         * @param pageType (메인)
         * @param modalType (서비스: svc, 개인정보: psnl)
         * @returns {Promise<void>}
         */
        openTermsModal: async function (pageType, modalType = "svc") {
            let params = {
                path: "modal/terms",
                htmlData: {
                    pageType: pageType,
                    modalType: modalType,
                    termsDetail: _this.termsDetail
                }
            }
            const html = await FH.methods.htmlGet('/common/doGetHtml', params);
            if ($("#termsModal").length) $("#termsModal").remove();
            $("#wrap").children().last().after(html);
            $("#termsModal").modal({show: true});
        },
        /**
         * 약관 modal - 약관 동의
         * @param type (서비스: svc, 개인정보: psnl)
         */
        doAgree: function (type) {
            $("#termsModal").modal({show: false}).remove();
            let popupSelector = "#" + type;

            switch (type) {
                case 'svc':
                case 'psnl':
                    popupSelector = popupSelector+ "Prv";
                    break;
            }

            $(popupSelector).prop("checked", true);
        },
        /* ---------------------------------------- 공통 약관 end ---------------------------------------- */

        /* ---------------------------------------- 구독, 도입문의 start ---------------------------------------- */
        /**
         * 뉴스레터 구독
         * @returns {boolean}
         */
        doSubscribe: function () {
            let email = $("#mail").val().trim();
            if (_this.methods.isEmpty(email) || !_this.methods.validEmail(email)) {
                alert("이메일을 입력해 주세요.");
                myFullpage.moveTo("sub6");
                myFullpage.fitToSection();
                return false;
            }
            let agree = $("#subscribe").is(":checked") ? "Y" : "N"
            if (agree !== "Y") {
                alert("뉴스레터 신청 개인정보 수집, 이용동의를 체크해 주세요.");
                myFullpage.moveTo("sub6");
                myFullpage.fitToSection();
                return false;
            }

            FH.methods.postNewsLetter(email);

            _this.methods.openNewsletterModal();

            $("#mail").val("");
            $("#subscribe").prop("checked", false);
        },
        /**
         * 뉴스레터 구독 완료 modal 열기
         * @returns {Promise<void>}
         */
        openNewsletterModal: async function () {
            const params = {
                path: "modal/newsletter"
            }
            const html = await FH.methods.htmlGet('/common/doGetHtml', params);
            $("#fullpage").after(html);
            $("#newsletterModal").modal({show: true});
        },
        /**
         * 도입 문의
         * @returns {Promise<boolean>}
         */
        doRegistInquiry: async function () {
            const params = {
                inqTypeCd : "10",
                entpNm: $("#entpNm").val().trim(),       // 회사명   
                cntctNm: $("#cntctNm").val().trim(),     // 담당자 이름   
                tlno: $("#tlno").val().trim(),           // 전화번호
                emailAddr: $("#emailAddr").val().trim(), // 이메일
                inqCn: $("#inqCn").val()                 // 문의내용
            }

            _this.inquiryValidEl.html("");
            if (_this.methods.isEmpty(params.entpNm)) {
                _this.inquiryValidEl.html("회사명을 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            if (_this.methods.isEmpty(params.cntctNm)) {
                _this.inquiryValidEl.html("담당자 이름을 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            if (_this.methods.isEmpty(params.tlno)) {
                _this.inquiryValidEl.html("전화번호를 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            if (_this.methods.isEmpty(params.emailAddr)) {
                _this.inquiryValidEl.html("이메일을 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            if (!_this.methods.validEmail(params.emailAddr)) {
                _this.inquiryValidEl.html("이메일을 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            let agreePrivacy = $("#psnlPrv").is(":checked") ? "Y" : "N";
            if (agreePrivacy !== "Y") {
                _this.inquiryValidEl.html("개인정보 수집 및 이용 동의를 체크해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }
            if (_this.methods.isEmpty(params.inqCn)) {
                _this.inquiryValidEl.html("문의 내용을 입력해 주세요.");
                myFullpage.moveTo("sub9");
                myFullpage.fitToSection();
                return false;
            }

            // console.log(params);
            const res = await FH.methods.post('/common/doRegistInquiry', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.methods.openInquiryModal();

                $("#entpNm").val("");
                $("#cntctNm").val("");
                $("#tlno").val("");
                $("#emailAddr").val("");
                $("#inqCn").val("");
                $("#psnlPrv").prop("checked", false);
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
         * 도입 문의 완료 modal 열기
         * @returns {Promise<void>}
         */
        openInquiryModal: async function () {
            const params = {
                path: "modal/inquiry"
            }
            const html = await FH.methods.htmlGet('/common/doGetHtml', params);
            $("#fullpage").after(html);
            $("#inquiryModal").modal({show: true});
        },
        /* ---------------------------------------- 구독, 도입문의 end ---------------------------------------- */

        /* ---------------------------------------- FAQ 관련 start ---------------------------------------- */
        /**
         * toast pagination 생성 (grid pagination 아님, custom 생성)
         */
        getPagination: function () {
            _this.pagination = new tui.Pagination(document.getElementById("pagination"), {
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
            _this.pagination.on("beforeMove", function(e) {
                _this.paginationFlag = true;
                FH.page = e.page;
                FH.methods.doGetBoardList();
            });
        },
        /**
         * toast pagination 생성 및 업데이트
         * @returns {boolean}
         */
        setPagination: function () {
            // paging 없으면 생성
            if (_this.pagination == null) {
                _this.methods.getPagination();
                return false;
            }
            if (_this.paginationFlag) { // pagination 클릭시, 페이지 사용 flag 변경
                _this.paginationFlag = false;
            } else {                    // 검색,보기 개수 변경시 pagination 리셋
                _this.pagination.reset(FH.totalCount);
            }
        },
        /**
         * FAQ 문의 분류 선택
         * @param el (카테고리 버튼 a태그)
         */
        changeClassify: function (el) {
            $(el).parent().find("a").removeClass("active");
            $(el).addClass("active");
            _this.wptlBlbdClNo = $(el).attr("_wptlBlbdClNo");
            _this.page = 1;
            _this.methods.doGetBoardList();
        },
        /**
         * FAQ 리스트 - 데이터 조회
         * @returns {Promise<void>}
         */
        doGetBoardList: async function () {
            const params = {
                page: _this.page,
                limit: _this.limit,
                wptlEntpNo: "",
                blbdTypeCd: "20",                                                                           // board 타입 (FAQ)
                wptlBlbdClNo: !_this.methods.isEmpty(_this.wptlBlbdClNo) ? Number(_this.wptlBlbdClNo) : "", // 문의 분류 시퀀스
                searchType: "",
                searchText: "",
                searchStartDate: "",
                searchEndDate: "",
                oprStatNm: ""
            }
            // console.log(params);
            const res = await FH.methods.post('/api/board/doGetBoardList', params);
            const code = res.code;
            const message = res.message;
            const entity = res.entity.boardList;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (code === 1) {
                _this.totalCount = entity.totalCount
                _this.virtualNum = entity.virtualNum;

                _this.methods.setContent(entity.list);
                _this.methods.setPagination();
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
         * FAQ 리스트 - 내용 페이지 호출
         * @param faqList
         * @returns {Promise<void>}
         */
        setContent: async function (faqList) {
            const params = {
                path: "main/faq_content",
                htmlData: {
                    virtualNum: _this.virtualNum,
                    faqList: faqList
                }
            }
            const html = await FH.methods.htmlGet('/common/doGetHtml', params);
            $(".faq").html(html);
            $("html, body").animate({scrollTop:0} ,300);
        }
        /* ---------------------------------------- FAQ 관련 end ---------------------------------------- */
    },
    init: function () {
        _this = this;
        for (let eventFunc in _this.events) {
            _this.events[eventFunc]();
        }
        _this.methods.getLatestTerms();

        window.onload = (function () {
            var w = window;
            if (w.ChannelIO) {
                return (window.console.error || window.console.log || function () {
                })('ChannelIO script included twice.');
            }
            var ch = function () {
                ch.c(arguments);
            };
            ch.q = [];
            ch.c = function (args) {
                ch.q.push(args);
            };
            w.ChannelIO = ch;

            function l() {
                if (w.ChannelIOInitialized) {
                    return;
                }
                w.ChannelIOInitialized = true;
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
                s.charset = 'UTF-8';
                var x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
            }

            if (document.readyState === 'complete') {
                l();
            } else if (window.attachEvent) {
                window.attachEvent('onload', l);
            } else {
                window.addEventListener('DOMContentLoaded', l, false);
                window.addEventListener('load', l, false);
            }
        })();
        ChannelIO('boot', {
            "pluginKey": "9c5b5d23-e619-4161-af21-bae5d974ae27"
        });
    }
}

window.FH = FH;
FH.init();