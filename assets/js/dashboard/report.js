
// 초기 설정값
let day = moment().subtract(1, 'days').format('YYYYMMDD');      // (현재) 기준날짜
if (parseInt(moment().format('H')) < 8) {
    day = moment(day, 'YYYYMMDD').subtract(2, 'days').format('YYYYMMDD');
}

// 배열 선언
let targetAspList = [];                 // ASP 목록 배열 선언
let reportDataList = [];                // 데이터 배열 선언
let responseUserData = [];              // 응답 데이터 배열 선언 - 회원
let responseTransactionData = [];       // 응답 데이터 배열 선언 - 거래

window.onload = function () {
    timer();

    getAspList();
    getDailyReportWithUser();
    getDailyReportWithIasTran();
    setReportData();

    setReportTbody();

    $('#clock').html('기준일 : ' + moment(day, 'YYYYMMDD').format('YYYY년 MM월 DD일'));// 타이머 실행
};

/**
 * 타이머
 */
function timer() {
    let time = 0;
    let x = setInterval(function () {
        if (time % 3600 === 0) {
            if (parseInt(moment().format('H')) > 7) {
                // 기준일 갱신
                day = moment().subtract(1, 'days').format('YYYYMMDD');

                getAspList();
                getDailyReportWithUser();
                getDailyReportWithIasTran();
                setReportData();

                setReportTbody();
                console.log("리포트 기준일 = ", day);

                $('#clock').html('기준일 : ' + moment(day, 'YYYYMMDD').format('YYYY년 MM월 DD일'));
            }
        }
        time++;
    }, 1000)
}

/**
 * ASP 목록 가져오기
 */
function getAspList() {
    $.ajax({
        type: 'get',
        url: "/api/asp",
        // data: JSON.stringify(arr),
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            targetAspList = data;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
            // location.href = '/';
        }
    });
}

/**
 * 일일 회원 가입 현황 정보 가져오기
 */
function getDailyReportWithUser() {
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.previousDay = moment(day, 'YYYYMMDD').subtract(1, 'days').format('YYYYMMDD');
    arguments.day = moment(day, 'YYYYMMDD').format('YYYYMMDD');
    console.log('일일 회원 통계 : ', arguments.day);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/day/user",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseUserData = data;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
        }
    });
}

/**
 * 일일 거래 데이터 가져오기
 */
function getDailyReportWithIasTran() {
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.previousDay = moment(day, 'YYYYMMDD').subtract(1, 'days').format('YYYYMMDD');
    arguments.day = moment(day, 'YYYYMMDD').format('YYYYMMDD');
    console.log('일일 거래 통계 : ', arguments.day);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/day/transaction",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseTransactionData = data;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
        }
    });
}

function setReportData() {
    reportDataList = [];
    let i = 0;
    targetAspList.forEach(aspObj => {
        let data = {};
        data.aspId = aspObj.aspId;
        data.aspNm = aspObj.name;

        // 초기값(0) 설정
        data.regCnt = data.regCntChangePer = 0;
        data.rcgAmt = data.rcgAmtChangePer = data.rcgCnt = data.rcgUsrCnt = data.rcgPerOnce = data.rcgPerOnceUsr = 0;
        data.payAmt = data.payAmtChangePer = data.payCnt = data.payUsrCnt = data.payPerOnce = data.payPerOnceUsr = 0;

        responseUserData.map((item) => {
            // 기준일에 해당 ASP의 개별 통계값 저장
            if (item.aspId === aspObj.aspId) {
                data.regCnt = item.regCnt;
                data.regCntChangePer = item.regCntChangePer;
            }
        });

        responseTransactionData.map((item) => {
            // 기준일에 해당 ASP의 개별 통계값 저장
            if (item.aspId === aspObj.aspId) {
                data.rcgAmt = item.rcgAmt;
                data.rcgAmtChangePer = item.rcgAmtChangePer;
                data.rcgCnt = item.rcgCnt;
                data.rcgUsrCnt = item.rcgUsrCnt;
                data.rcgPerOnce = item.rcgPerOnce;
                data.rcgPerOnceUsr = item.rcgPerOnceUsr;

                data.payAmt = item.payAmt;
                data.payAmtChangePer = item.payAmtChangePer;
                data.payCnt = item.payCnt;
                data.payUsrCnt = item.payUsrCnt;
                data.payPerOnce = item.payPerOnce;
                data.payPerOnceUsr = item.payPerOnceUsr;
            }
        });
        reportDataList.push(data);
        i++;
    });
}

function setReportTbody() {
    let tbody = document.createElement("tbody");
    tbody.setAttribute("id", 'myReport');

    let rcgAmt = 0;
    let rcgCnt = 0;
    let rcgUsrCnt = 0;
    let payAmt = 0;
    let payCnt = 0;
    let payUsrCnt = 0;
    let regCnt = 0;

    reportDataList.forEach(aspObj => {
        let tr = document.createElement("tr");

        tr.append(setTd(aspObj.aspNm, "t_left"));

        tr.append(setTd(aspObj.rcgAmt, "t_right reportTdLeftLine"));
        tr.append(setTd2(aspObj.rcgAmtChangePer, "t_right"));
        tr.append(setTd(aspObj.rcgCnt, "t_right"));
        tr.append(setTd(aspObj.rcgUsrCnt, "t_right"));
        tr.append(setTd(aspObj.rcgPerOnce, "t_right"));
        tr.append(setTd(aspObj.rcgPerOnceUsr, "t_right"));

        tr.append(setTd(aspObj.payAmt, "t_right reportTdLeftLine"));
        tr.append(setTd2(aspObj.payAmtChangePer, "t_right"));
        tr.append(setTd(aspObj.payCnt, "t_right"));
        tr.append(setTd(aspObj.payUsrCnt, "t_right"));
        tr.append(setTd(aspObj.payPerOnce, "t_right"));
        tr.append(setTd(aspObj.payPerOnceUsr, "t_right"));

        tr.append(setTd(aspObj.regCnt, "t_right reportTdLeftLine"));
        tr.append(setTd2(aspObj.regCntChangePer, "t_right"));

        tbody.append(tr);

        // 합계 계산
        rcgAmt += parseInt(aspObj.rcgAmt);
        rcgCnt += parseInt(aspObj.rcgCnt);
        rcgUsrCnt += parseInt(aspObj.rcgUsrCnt);

        payAmt += parseInt(aspObj.payAmt);
        payCnt += parseInt(aspObj.payCnt);
        payUsrCnt += parseInt(aspObj.payUsrCnt);

        regCnt += parseInt(aspObj.regCnt);
    });

    // 하단 합계 영역과 상단 데이터 영역 분리
    let trGap = document.createElement("tr");
    let tdGap = document.createElement("td");
    trGap.setAttribute("class", 'reportGap');
    tdGap.setAttribute("colspan", '15');
    trGap.append(tdGap);
    tbody.append(trGap);

    // 합계 헤더(타이틀)
    let totalHead = document.createElement("tr");
    totalHead.setAttribute("class", 'reportSumHead');

    totalHead.append(setTh("", ""));
    totalHead.append(setTh("총 충전 금액", "reportTdLeftLine"));
    totalHead.append(setTh("", ""));
    totalHead.append(setTh("총 충전 건수", ""));
    totalHead.append(setTh("총 충전 명수", ""));
    totalHead.append(setTh("건당 충전액", ""));
    totalHead.append(setTh("인당 충전액", ""));
    totalHead.append(setTh("총 거래금액", "reportTdLeftLine"));
    totalHead.append(setTh("", ""));
    totalHead.append(setTh("총 거래건수", ""));
    totalHead.append(setTh("총 거래회원수", ""));
    totalHead.append(setTh("건당 거래액", ""));
    totalHead.append(setTh("인당 거래액", ""));
    totalHead.append(setTh("총 가입자 수", "reportTdLeftLine"));
    totalHead.append(setTh("", ""));
    tbody.append(totalHead);

    // 합계 표시
    let total = document.createElement("tr");
    total.setAttribute("class", 'reportSum');

    total.append(setTd("합계", "t_center"));

    total.append(setTd(rcgAmt, "t_right reportTdLeftLine"));
    total.append(setTd("", ""));
    total.append(setTd(rcgCnt, "t_right"));
    total.append(setTd(rcgUsrCnt, "t_right"));
    total.append(setTd(Math.round(rcgAmt / rcgCnt), "t_right"));
    total.append(setTd(Math.round(rcgAmt / rcgUsrCnt), "t_right"));

    total.append(setTd(payAmt, "t_right reportTdLeftLine"));
    total.append(setTd("", ""));
    total.append(setTd(payCnt, "t_right"));
    total.append(setTd(payUsrCnt, "t_right"));
    total.append(setTd(Math.round(payAmt / payCnt), "t_right"));
    total.append(setTd(Math.round(payAmt / payUsrCnt), "t_right"));

    total.append(setTd(regCnt, "t_right reportTdLeftLine"));
    total.append(setTd("", ""));

    tbody.append(total);

    $('#myReport').remove();
    $('#myReportTable').append(tbody);
}

function setTd(obj, className) {
    let td = document.createElement("td");
    if (obj === 0) {
        td.append(document.createTextNode('-'));
    } else {
        td.append(document.createTextNode(numberWithDelimiter(obj)));
    }
    if (className !== "") td.setAttribute("class", className);

    return td;
}

function setTh(obj, className) {
    let td = document.createElement("th");
    td.append(document.createTextNode(obj));
    if (className !== "") td.setAttribute("class", className);

    return td;
}

function setTd2(obj, className) {
    let rateOfChange = (Math.round(obj * 10) / 10).toFixed(1);
    let td = document.createElement("td");

    if (obj === 0) {
        td.append(document.createTextNode('-'));
        td.setAttribute("class", className + ' status-zero');
    } else if (obj > 0) {
        td.append(document.createTextNode(rateOfChange + '% ▲'));
        td.setAttribute("class", className + ' status-increase');
    } else {
        td.append(document.createTextNode(rateOfChange + '% ▼'));
        td.setAttribute("class", className + ' status-decrease');
    }

    return td;
}
