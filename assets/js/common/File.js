import ConstCode from "/js/common/ConstCode.js?version=2025010801";
import "/assets/lib/js/xlsx.full.min.js?version=2024030601";

// 파일 업로드 js
// let _this;
const FILE = {
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
        }
    },
    methods: {
        /**
         * 파일 찾기 (OS 파일 선택창 열기)
         * @param el (파일찾기 button)
         */
        findFile: function (el) {
            $(el).parent().find("input:file").click();
        },
        /**
         * 첨부 파일 삭제
         * @param el (파일영역 X button)
         * @param type (썸네일: thumb)
         */
        removeFile: function (el, type = "") {
            let fileWrap = $(el).parent();
            $(fileWrap).find("input:file").val("");            // 파일 초기화
            $(fileWrap).find("input:text").val("");            // 파일 이름 초기화
            $(fileWrap).find("input:hidden").val("");          // 파일 경로 초기화
            $(fileWrap).find("button").css("display", "none"); // X 버튼 숨김

            // thumbFileChange 삭제 시 디폴트 이미지로 변경
            if (type === "thumb") 
                $(el).closest("li").find("img").attr("src", "/assets/styles/img/common/tmp_card_back.png");
            if (type === "batch")
                $(".batchFileWrap").remove();
        },
        /**
         * 첨부 파일 변경
         * (공통)
         * @param el (첨부파일 input[type=file])
         * @param type (허용 타입)
         * @returns {boolean}
         */
        fileChange: function (el, type = "") {
            if (el.files && el.files[0]) {
                if (!Util.isEmpty(type)) {
                    let fileName = el.files[0].name;
                    let ext = "";
                    if( fileName.indexOf(".") > -1 ) {
                        ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                    }

                    let allow = [];
                    let isAllow = true;
                    if( fileName.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                        alert( `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.` );
                        FILE.methods.removeFile(el);
                        return false;

                    }
                    switch (type) {
                        case "image":
                            allow = ["jpg", "jpeg", "png"];
                            if (!allow.includes(ext)) {
                                isAllow = false;
                                alert("jpg, jpeg, png 파일만 첨부 가능합니다.");
                            } else if (el.files[0].size > (1024 * 1024 * 5)) {
                                isAllow = false;
                                alert("5MB 이하의 파일을 첨부해주세요.");
                            }
                            break;
                        case "excel":
                            allow = ["xlsx", "xls", "csv"];
                            if (!allow.includes(ext)) {
                                isAllow = false;
                                alert("엑셀 양식만 첨부 가능합니다.");
                            } else if (el.files[0].size > (1024 * 1024 * 5)) {
                                isAllow = false;
                                alert("5MB 이하의 파일을 첨부해주세요.");
                            }
                            break;
                        case "emp_image":
                            if (el.files[0].size > (1024 * 1024 * 20)) {
                                isAllow = false;
                                alert("20MB 이하의 파일을 첨부해주세요.");
                            }
                            break;
                    }
                    if (!isAllow) {
                        //$(el).val("");
                        FILE.methods.removeFile(el);
                        return false;
                    }
                }
                $(el).parent().find("input:text").val(el.files[0].name);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el);
            }
        },
        /**
         * 첨부 파일 변경 custom (이미지 / pdf 만, 용량체크)
         * (서비스 계약 신청시, 기업정보 첨부 서류 수정시)
         * @param el (첨부파일 input[type=file])
         * @param type (계약화면: page, 기업수정 modal: modal)
         * @returns {boolean}
         */
        applyFileChange: function (el, type = "page") {
            const scrollWrap = type === "page" ? FH.scrollWrap : $(el).closest(".modal-body");
            const validEl = type === "page" ? FH.fileValidEl : $(el).closest(".padding30").prev().find(".modal-title1 small");
            validEl.html("");
            let maxSize = Number($(el).data("maxMbSize"));
            if(!maxSize) {
                maxSize = 3;
            }

            if (el.files && el.files[0]) {
                let message = "";
                let result = true;
                let allow = ["jpg", "jpeg", "png", "pdf"];
                let fileInfo = el.files[0].name.split(".");
                let ext = "";
                if( fileInfo.length > 1 ) {
                    ext = fileInfo[fileInfo.length - 1].toLowerCase();
                }
                message = "※ 아래의 파일만 업로드가 가능합니다.<br>- 용량: " + maxSize + "MB 이하 ";

                if (el.files[0].size > (1024 * 1024 * maxSize)) {
                    if( type === "modal" ) {
                        Util.validCheck(scrollWrap, validEl, maxSize + "MB 이하의 파일을 첨부해주세요.");
                        FILE.methods.removeFile(el);
                        return false;
                    }
                    result = false;
                    message += "(X)<br>";
                } else {
                    message += "(O)<br>";
                }

                message += "- 확장자 : jpg, jpeg, png, pdf ";
                if (!allow.includes(ext)) {
                    if( type === "modal" ) {
                        Util.validCheck(scrollWrap, validEl, "jpg, jpeg, png, pdf 파일만 업로드가 가능합니다.");
                        FILE.methods.removeFile(el);
                        return false;
                    }
                    result = false;
                    message += "(X)<br>";
                } else {
                    message += "(O)<br>";
                }

                message += "- 파일명 : " + ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH + "자 이내 ";
                if( el.files[0].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                    if( type === "modal" ) {
                        Util.validCheck(scrollWrap, validEl, `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.`);
                        FILE.methods.removeFile(el);
                        return false;
                    }
                    result = false;
                    message += "(X)";
                } else {
                    message += "(O)";
                }

                if( !result ) {
                    $("#fileValidMsg").html(message);
                    FILE.methods.removeFile(el);
                    return result;
                } else {
                    $("#fileValidMsg").html("");
                }
                $(el).parent().find("input:text").val(el.files[0].name);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el);
            }
        },
        /**
         * 첨부 파일 변경 custom (ai만, 용량체크)
         * (상품 관리 > 상품 신청시 > 로고, 디자인)
         * @param el (첨부파일 input[type=file])
         */
        attachFileChange: function (el) {
            if (el.files && el.files[0]) {
                FH.validEl.html("");
                let $el = $(el);
                let allow = $el.attr( "accept" ).split(",");
                if( allow.length > 0 ) {
                    allow = allow.map(function (item) {
                        return item.trim().substring(1);
                    });
                }
                let fileInfo = el.files[0].name.split(".");
                let ext = "";
                if( fileInfo.length > 1 ) {
                    ext = fileInfo[fileInfo.length - 1].toLowerCase();
                }

                if (!allow.includes(ext)) {
                    Util.validCheck(FH.scrollWrap, FH.validEl, allow.join(", ") + " 파일만 업로드가 가능합니다.");
                    FILE.methods.removeFile(el);
                    return false;
                }
                if (el.files[0].size > (20 * 1024 * 1024)) {
                    Util.validCheck(FH.scrollWrap, FH.validEl, "20MB 이하의 파일을 첨부해주세요.");
                    FILE.methods.removeFile(el);
                    return false;
                }
                if( el.files[0].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                    Util.validCheck(FH.scrollWrap, FH.validEl, `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.`);
                    FILE.methods.removeFile(el);
                    return false;
                }
                $(el).parent().find("input:text").val(el.files[0].name);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el);
            }
        },
        /**
         * 직불계좌 첨부파일
         * @param el (첨부파일 input[type=file])
         */
        debitAcntFileChange: function (el) {
            if (el.files && el.files[0]) {
                let $el = $(el);
                let allow = $el.attr( "accept" ).split(",");
                if( allow.length > 0 ) {
                    allow = allow.map(function (item) {
                        return item.trim().substring(1);
                    });
                }
                let fileInfo = el.files[0].name.split(".");
                let ext = "";
                if( fileInfo.length > 1 ) {
                    ext = fileInfo[fileInfo.length - 1].toLowerCase();
                }

                if (!allow.includes(ext)) {
                    alert(allow.join(", ") + " 파일만 업로드가 가능합니다.");
                    FILE.methods.removeFile(el);
                    return false;
                }
                if (el.files[0].size > (300 * 1024)) {
                    alert("300KB 이하의 파일을 첨부해주세요.");
                    FILE.methods.removeFile(el);
                    return false;
                }
                if (el.files[0].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                    alert(`파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.`);
                    FILE.methods.removeFile(el);
                    return false;
                }
                $(el).parent().find("input:text").val(el.files[0].name);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el);
            }
        },
        /**
         * 첨부 파일 변경 custom (엑셀만, 콜백)
         * (엑셀 일괄 등록 modal)
         * (임직원, 부서/직급/직책, 지급/회수 대상자, 가상계좌)
         * @param el (첨부파일 input[type=file])
         * @param callback (콜백 method - 엑셀 업로드)
         * @returns {boolean}
         */
        excelFileChange: function (el, callback, empSmsIsYn) {
            if (el.files && el.files[0]) {
                let allow = ["xlsx", "xls", "csv"];
                let fileInfo = el.files[0].name;
                let ext = "";
                if( fileInfo.indexOf(".") > -1 ) {
                    ext = fileInfo.substring(fileInfo.lastIndexOf(".") + 1);
                }

                if (!allow.includes(ext)) {
                    alert("엑셀 양식만 업로드 가능합니다.");
                    $(el).val("");
                    return false;
                }
                if (el.files[0].size > (20 * 1024 * 1024)) {
                    alert("20MB 이하의 파일을 첨부해주세요.");
                    $(el).val("");
                    return false;
                }
                if( el.files[0].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                    alert( `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.` );
                    $(el).val("");
                    return false;
                }
                if (callback) {
                    if (!Util.isEmpty(empSmsIsYn)) {
                        callback(el, empSmsIsYn);
                    } else {
                        callback(el);
                    }
                }
            } else {
                $(el).val("");
            }
        },
        /**
         * 엑셀 업로드 후 결과 바인딩
         * (엑셀 일괄 등록 modal)
         * (임직원, 지급/회수 대상자, 가상계좌)
         * @param entity
         */
        setExcelUploadResultWithReject: function (entity) {
            let $completeWrap = $("#uploadComplete");
            let $rejectWrap = $("#uploadReject");
            let resultHtml = '<div class="tit">엑셀 파일 일괄 등록 완료</div>' +
                             '<div class="box">' +
                                 '<p>정상 ' + Util.emptyNumber(entity.successCount) + '건</p>' +
                                 '<p>비정상 ' + Util.emptyNumber(entity.rejectCount) + '건</p>' +
                             '</div>';
            $completeWrap.html(resultHtml);
            $completeWrap.css("display", "block");
            if (entity.rejectCount > 0) {
                let rejectHtml = '<div class="modal-title1"><h5>비정상 내역</h5></div>' +
                                 '<div class="table1 medium">' +
                                     '<table>' +
                                         '<thead>' +
                                             '<tr>' +
                                                 '<th>행</th>' +
                                                 '<th>필드명</th>' +
                                                 '<th>비정상 분류</th>' +
                                             '</tr>' +
                                         '</thead>' +
                                         '<tbody>';
                            for (let i = 0; i < entity.rejectList.length; i++) {
                                rejectHtml += '<tr>' +
                                                  '<td>' + entity.rejectList[i].row + '</td>' +
                                                  '<td>' + entity.rejectList[i].field + '</td>' +
                                                  '<td>' + entity.rejectList[i].reason + '</td>' +
                                              '</tr>';
                            }
                           rejectHtml += '</tbody>' +
                                     '</table>' +
                                 '</div>';
                $rejectWrap.html(rejectHtml);
                $rejectWrap.css("display", "block");
            }
            Util.validCheck($(".modal-body"), $completeWrap);
        },
        /**
         * 엑셀 업로드 후 결과 바인딩
         * (엑셀 일괄 등록 modal)
         * (부서, 직급, 직책)
         * @param entity
         */
        setExcelUploadResult : function (entity) {
            let $completeWrap = $("#uploadComplete");
            let resultHtml = '<div class="tit">엑셀 파일 일괄 등록 완료</div>' +
                             '<div class="box">' +
                                 '<p>등록수 : ' + entity.insertCount + '건</p>' +
                             '</div>';
            $completeWrap.html(resultHtml);
            $completeWrap.css("display", "block");
            Util.validCheck($(".modal-body"), $completeWrap);
        },
        fileUpload: async function( props ) {
            let result = {};
            startLoading();
            const uploadFile = $(props.fileInput)[0].files[0];
            $(props.fileInput).val("");
            const params = {
                file: uploadFile
            }
            const res = await ServiceExec.formPostAsync('/common/doFileUpload', params, false);
            result.code = res.code;
            result.message = res.message;
            result.fileBean = res.entity;
            // console.log('code: %d\nmessage: %s\nentity: %o\nstringify: \n%s', code, message, entity, JSON.stringify(entity));
            if (result.code === 1) {
            } else {
                switch (result.code) {
                    // 예외처리 경우
                    // case :
                    //     break;
                    default:
                        stopLoading();
                        alert( result.message );
                        break;
                }
                return;
            }

            let successCount = 0;
            let rejectCount = 0;
            let index = 0;
            let rejectList = [];
            let reader = new FileReader();
            let rows;

            reader.onload = async function() {
                let fileData = reader.result;
                try {
                    let wb = XLSX.read(fileData, {type: 'binary', cellDates: true, dateNF: 'yyyy/mm/dd'});
                    let sheet = wb.Sheets[wb.SheetNames[0]];
                    if( !validColumnTitle(sheet) ) {
                        throw new Error("INVALID_FORMAT_DATA");
                    }
                    rows = XLSX.utils.sheet_to_json(sheet);

                } catch( err ) {
                    result.code = -1;
                    result.message = err.message;
                    switch (err.message) {
                        case "File is password-protected":
                            alert( "암호없이 업로드 해주세요." );
                            break;
                        case "INVALID_FORMAT_DATA":
                            alert( "양식에 맞는 파일만 업로드 가능합니다." );
                            break;
                        default:
                            alert( "파일 업로드를 실패했습니다. 다시 시도해주세요.\n" + err.message );
                            break;
                    }
                    stopLoading();
                    reader = null;
                    return;
                }

                let $completeWrap = $("#uploadComplete");
                let resultHtml = '<div class="tit">엑셀 파일 업로드 중</div>' +
                                 '<div class="box">' +
                                     '<p>정상 <span id="successCount">0</span>건</p>' +
                                     '<p>비정상 <span id="failCount">0</span>건</p>' +
                                 '</div>';
                $completeWrap.html(resultHtml);
                $completeWrap.css("display", "block");

                $(".close-modal").css("display", "none");
                $(".btn-type1, .btn-type2").attr("disabled", true);
                await uploadDataLine();
            }
            reader.readAsBinaryString(uploadFile);
            return;

            function validColumnTitle(sheet) {
                let headers = [];
                let range = XLSX.utils.decode_range(sheet['!ref']);
                let C, R = range.s.r;
                for(C = range.s.c; C <= range.e.c; ++C) {
                    let cell = sheet[XLSX.utils.encode_cell({c:C, r:R})];
                    let hdr = "UNKNOWN " + C;
                    if(cell && cell.t)
                        hdr = XLSX.utils.format_cell(cell);
                    headers.push(hdr);
                }
                let validList = props.columnTitles.filter( v => !headers.includes(v) );
                if( validList.length > 0 ) {
                    return false;
                } else {
                    if(props.columnTitles.length === headers.length) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }

            async function uploadDataLine() {
                if( !$(".loading-container").length ) {
                    startLoading();
                }
                const items = rows.slice(index, index + 100);
                if( rows.length < index + 1 ) {
                    let $completeWrap = $("#uploadComplete");
                    $completeWrap.find("div.tit").text("엑셀 파일 일괄 업로드 완료");
                    if (rejectCount > 0) {
                        let $rejectWrap = $("#uploadReject");
                        let rejectHtml = '<div class="modal-title1"><h5>비정상 내역</h5></div>' +
                                         '<div class="table1 medium">' +
                                             '<table>' +
                                                 '<thead>' +
                                                     '<tr>' +
                                                         '<th>행</th>' +
                                                         '<th>필드명</th>' +
                                                         '<th>비정상 분류</th>' +
                                                     '</tr>' +
                                                 '</thead>' +
                                                 '<tbody>';
                                    for (let i = 0; i < rejectList.length; i++) {
                                        rejectHtml += '<tr>' +
                                                          '<td>' + (rejectList[i].row+1) + '</td>' +
                                                          '<td>' + rejectList[i].field + '</td>' +
                                                          '<td>' + rejectList[i].reason + '</td>' +
                                                      '</tr>';
                                    }
                                   rejectHtml += '</tbody>' +
                                             '</table>' +
                                         '</div>';
                        $rejectWrap.html(rejectHtml);
                        $rejectWrap.css("display", "block");
                    }
                    $(".btn-type1, .btn-type2").attr("disabled", false);
                    if( typeof props.setComplete === "function" ) {
                        result.successCount = successCount;
                        result.rejectCount = rejectCount;
                        result.rejectList = rejectList;
                        props.setComplete(result);
                    }
                    stopLoading();
                    return;
                } else {
                    for( let v = 0; v < items.length; v++ ) {
                        let line = props.setColumns( items[v] );
                        if( line == null ) continue;

                        items[v] = line;
                        items[v].rowIndex = index + v + 1;
                    }
                    const params = { targetExcel: items };
                    const res = await ServiceExec.jsonPost(props.uploadUrl, params, false);
                    const code = res.code;
                    const message = res.message;
                    const entity = res.entity;

                    if (code === 1) {
                        if( typeof props.setUploadList === "function" ) {
                            props.setUploadList(entity);
                        }
                        rejectList.push(...entity.rejectList);
                        successCount += entity.successCount;
                        rejectCount += entity.rejectCount;
                        $("#successCount").text( successCount );
                        $("#failCount").text( rejectCount );
                    } else {
                        switch (code) {
                            // 예외처리 경우
                            // case :
                            //     break;
                            default:
                                alert( "파일 업로드를 실패했습니다. 다시 시도해주세요.\n" + message );
                        }
                        let $completeWrap = $("#uploadComplete");
                        $completeWrap.find("div.tit").text("엑셀 파일 일괄 업로드 실패");
                        $(".btn-type1, .btn-type2").attr("disabled", false);
                        stopLoading();
                        return;
                    }
                    index += 100;
                    setTimeout( uploadDataLine, 20 );
                }
            }
        },
        /**
         * 첨부 파일 변경 custom (이미지만, 미리보기)
         * (상품 신청 관리 > 디자인 등록시)
         * @param el (첨부파일 input[type=file])
         * @returns {boolean}
         */
        thumbFileChange: function (el) {
            if (el.files && el.files[0]) {
                let allow = ["jpg", "jpeg", "png"];
                let fileInfo = el.files[0].name.split(".");
                let ext = "";
                if( fileInfo.length > 1 ) {
                    ext = fileInfo[1].toLowerCase();
                }
                if (!allow.includes(ext)) {
                    alert("jpg, jpeg, png 파일만 첨부 가능합니다.");
                    FILE.methods.removeFile(el, "thumb");
                    return false;
                }
                if (el.files[0].size > (5 * 1024 * 1024)) {
                    alert("5MB 이하의 파일을 첨부해주세요.");
                    FILE.methods.removeFile(el, "thumb");
                    return false;
                }
                if( el.files[0].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                    alert( `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.` );
                    FILE.methods.removeFile(el, "thumb");
                    return false;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(el).closest("li").find("img").attr("src", e.target.result);
                };
                reader.readAsDataURL(el.files[0]);
                $(el).parent().find("input:text").val(el.files[0].name);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el, "thumb");
            }
        },
        /**
         * 첨부 파일 변경 custom (이미지만, 여러개)
         * (카드 주문 관리 > 디자인 일괄 등록시)
         * @param el (첨부파일 input[type=file] multiple)
         * @returns {boolean}
         */
        multipleFileChange: function (el) {
            if (el.files) {
                let allow = ["jpg", "jpeg", "png"];
                let fileName = "";
                let fileSize = 0;
                for (let i = 0; i < el.files.length; i++) {
                    let ext = el.files[i].name.split(".").pop().toLowerCase();
                    if (!allow.includes(ext)) {
                        alert("jpg, jpeg, png 파일만 첨부 가능합니다.");
                        FILE.methods.removeFile(el);
                        return false;
                    }
                    fileSize += el.files[i].size;
                    if( el.files[i].name.length > ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH ) {
                        alert( `파일명은 ${ConstCode.UPLOAD_FILE_NAME_MAX_LENGTH}자 이내로 입력해주세요.` );
                        FILE.methods.removeFile(el);
                        return false;
                    }
                    fileName += ((i !== 0 ? ", " : "") + el.files[i].name);
                }
                if (fileSize > (15 * 1024 * 1024)) {
                    alert("총 15MB 이하의 파일을 첨부해주세요.");
                    FILE.methods.removeFile(el);
                    return false;
                }
                $(el).parent().find("input:text").val(fileName);
                $(el).parent().find("button").css("display", "block");
            } else {
                FILE.methods.removeFile(el);
            }
        }
    },
    init: function () {
        // _this = this;
        // for (let eventFunc in _this.events) {
        //     _this.events[eventFunc]();
        // }
    }
}

window.FILE = FILE;
// FH.init();
