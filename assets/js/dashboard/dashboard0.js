// 초기 설정값
let today = moment().format('YYYYMMDD');      // (현재) 기준날짜
let now = moment().format('YYYYMMDDHH');    // (현재) 기준시간
const days = 14;              // (일간) 과거 몇일까지의 데이터
const hours = 12;             // (실시간) 최근 몇시간까지의 데이터
const week = ['일', '월', '화', '수', '목', '금', '토'];
const submenuList = [
    '(일간) 회원 등록 및 탈퇴',
    '(일간) 결제 거래',
    '(실시간) 회원 등록 및 탈퇴',
    '(실시간) 결제 거래',
    '(실시간) 충전',
    '(실시간) 유저포인트 적립',
    '(실시간) 카드포인트 적립'
];

let displayNumber = 0;
let displayFlag = true;
let loadingFlag = [false, false, false, false];
// 배열 선언
let targetAspList = [];     // ASP 목록 배열 선언
let dayLabels = [];        // 일간 타트의 X출 라벨
let timeLabels = [];        // 일간 타트의 X출 라벨

let transactionTrendListPayAmtData = [];
let transactionTrendListPayCntData = [];
let transactionTrendListPayUsrCntData = [];
let transactionTrendListPayPerOnceUsrData = [];
let transactionTrendListPayPerOnceData = [];

let transactionTrendListPayAmtDataTotal = [];
let transactionTrendListPayCntDataTotal = [];
let transactionTrendListPayUsrCntDataTotal = [];
let transactionTrendListPayPerOnceUsrDataTotal = [];
let transactionTrendListPayPerOnceDataTotal = [];

let userTrendListRegData = [];
let userTrendListWthData = [];

let userTrendListRegDataTotal = [];
let userTrendListWthDataTotal = [];

let userRealtimeTrendListRegData = [];
let userRealtimeTrendListWthData = [];

let userRealtimeTrendListRegDataTotal = [];
let userRealtimeTrendListWthDataTotal = [];

let transactionRealtimeTrendListPayAmtData = [];
let transactionRealtimeTrendListPayCntData = [];
let transactionRealtimeTrendListRcgAmtData = [];
let transactionRealtimeTrendListRcgCntData = [];
let transactionRealtimeTrendListRfdAmtData = [];
let transactionRealtimeTrendListRfdCntData = [];
let transactionRealtimeTrendListSavUserPntAmtData = [];
let transactionRealtimeTrendListSavUserPntCntData = [];
let transactionRealtimeTrendListSavCardPntAmtData = [];
let transactionRealtimeTrendListSavCardPntCntData = [];

let transactionRealtimeTrendListPayAmtDataTotal = [];
let transactionRealtimeTrendListPayCntDataTotal = [];
let transactionRealtimeTrendListRcgAmtDataTotal = [];
let transactionRealtimeTrendListRcgCntDataTotal = [];
let transactionRealtimeTrendListRfdAmtDataTotal = [];
let transactionRealtimeTrendListRfdCntDataTotal = [];
let transactionRealtimeTrendListSavUserPntAmtDataTotal = [];
let transactionRealtimeTrendListSavUserPntCntDataTotal = [];
let transactionRealtimeTrendListSavCardPntAmtDataTotal = [];
let transactionRealtimeTrendListSavCardPntCntDataTotal = [];

window.onload = function () {
    timer();                                            // 타이머 실행
    getAspList();                                       // ASP 목록 가져오기
    setSubMenu(submenuList);                            // 왼쪽의 서브메뉴 목록 설정
    setLegend();                                        // 오른쪽 범례 표시(ASP목록)
    setCalendarDiv();                                   // 왼쪽 달력 표시

    setDayLabels(today, days);                          // 일간 차트의 X축 라벨 설정
    setTransactionTrendListPay(today, days);            // (API) 일간 거래 통계 데이터
    setUserTrendListPay(today, days);                   // (API) 일간 회원 통계 데이터

    setTimeLabels(now, hours);                          // 실시간 차트의 X축 라벨 설정
    setRealtimeUserTrendListPay(now, hours);            // (API) 실시간 회원 통계 데이터
    setRealtimeTransactionTrendListPay(now, hours);     // (API) 실시간 거래 통계 데이터
};

/**
 * 타이머
 */
function timer() {
    let time = 0;
    let x = setInterval(function () {
        checkLoading();
        // 시계 갱신
        clock(10, time);
        if (time % 10 === 0) {
            // 달력 갱신
            setCalendarDiv();
            today = moment().format('YYYYMMDD');      // (현재) 기준날짜
            now = moment().format('YYYYMMDDHH');      // (현재) 기준시간

            // 서브메뉴 이동 및 차트 그리기
            showChart(displayNumber);
            if (displayFlag) {
                if (displayNumber < submenuList.length - 1) displayNumber++; else displayNumber = 0;
            }
        }
        // 데이터 갱신 - 5분 안의 소수
        if (time % 277 === 0 && time !== 0) setTransactionTrendListPay(today, days);             // (API) 일간 거래 통계 데이터
        if (time % 261 === 0 && time !== 0) setUserTrendListPay(today, days);                    // (API) 일간 회원 통계 데이터
        if (time % 283 === 0 && time !== 0) setRealtimeUserTrendListPay(now, hours);             // (API) 실시간 회원 통계 데이터
        if (time % 293 === 0 && time !== 0) setRealtimeTransactionTrendListPay(now, hours);      // (API) 실시간 거래 통계 데이터
        time++;
        if (time > 3600) time = 0;
    }, 1000)
}

function checkLoading() {
    let check = 0;
    for (let i = 0; i < loadingFlag.length; i++) {
        if (loadingFlag[i] === true) check++;
    }
    let progressValue = parseInt(10 + (check / loadingFlag.length * 90)) + '%';
    $('.progress').css('width', progressValue);
    if (check === loadingFlag.length) $('.loading').fadeOut('slow');
}

/**
 * 현재시간 표시
 * @param cycle 갱신주기
 * @param time timer()의 현재 시간변수
 */
function clock(cycle, time) {
    if (time % cycle === 0) {
        $('#clock').html('현재시간 : ' + moment().format('YYYY년 MM월 DD일 HH시 mm분'));
    }
}

/**
 * chart.js로 Line차트 그리기
 * @param chartId
 * @param chartLabels
 * @param chartData
 */
function chart(chartId, chartLabels, chartData) {
    let targetChart = new Chart(document.getElementById(chartId).getContext('2d'), {
        plugins: [ChartDataLabels],
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: chartData,
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    backgroundColor: function (context) {
                        return context.dataset.backgroundColor;
                    },
                    borderRadius: 4,
                    formatter: function (value, context) {
                        return codeToHumanValue('thousandSeparator', value, null);
                    },
                    color: 'white',
                    padding: 2,
                }
            },
        }
    })
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
            location.href = '/';
        }
    });
}

/**
 * 화면의 차트 제어
 * @number
 */
function showChart(number) {
    $('.left ul li').removeClass('on');
    $('#myChart' + number + '_menuLink').addClass('on');

    //drawChart(1, '일간 건당 거래금액', dayLabels, transactionTrendListPayPerOnceUsrData);
    // (일간) 회원 등록 및 탈퇴
    if (number === 0) {
        drawChart(1, '일간 회원 등록건수', dayLabels, userTrendListRegData);
        drawChart(2, '일간 전체 회원 등록건수', dayLabels, userTrendListRegDataTotal);
        drawChart(3, '일간 회원 탈퇴건수', dayLabels, userTrendListWthData);
        drawChart(4, '일간 전체 회원 탈퇴건수', dayLabels, userTrendListWthDataTotal);
    }
    // (일간) 결제 거래
    if (number === 1) {
        drawChart(1, '일간 결제금액', dayLabels, transactionTrendListPayAmtData);
        drawChart(2, '일간 전체 결제금액', dayLabels, transactionTrendListPayAmtDataTotal);
        drawChart(3, '일간 결제건수', dayLabels, transactionTrendListPayCntData);
        drawChart(4, '일간 전체 결제건수', dayLabels, transactionTrendListPayCntDataTotal);
    }
    // (실시간) 회원 등록 및 탈퇴
    if (number === 2) {
        drawChart(1, '실시간 회원 등록건수', timeLabels, userRealtimeTrendListRegData);
        drawChart(2, '실시간 전체 회원 등록건수', timeLabels, userRealtimeTrendListRegDataTotal);
        drawChart(3, '실시간 회원 탈퇴건수', timeLabels, userRealtimeTrendListWthData);
        drawChart(4, '실시간 전체 회원 탈퇴건수', timeLabels, userRealtimeTrendListWthDataTotal);
    }
    // (실시간) 결제 거래
    if (number === 3) {
        drawChart(1, '실시간 결제금액', timeLabels, transactionRealtimeTrendListPayAmtData);
        drawChart(2, '실시간 전체 결제금액', timeLabels, transactionRealtimeTrendListPayAmtDataTotal);
        drawChart(3, '실시간 결제건수', timeLabels, transactionRealtimeTrendListPayCntData);
        drawChart(4, '실시간 전체 결제건수', timeLabels, transactionRealtimeTrendListPayCntDataTotal);
    }
    // (실시간) 충전
    if (number === 4) {
        drawChart(1, '실시간 충전금액', timeLabels, transactionRealtimeTrendListRcgAmtData);
        drawChart(2, '실시간 전체 충전금액', timeLabels, transactionRealtimeTrendListRcgAmtDataTotal);
        drawChart(3, '실시간 충전건수', timeLabels, transactionRealtimeTrendListRcgCntData);
        drawChart(4, '실시간 전체 충전건수', timeLabels, transactionRealtimeTrendListRcgCntDataTotal);
    }
    // (실시간) 유저캐시 적립
    if (number === 5) {
        drawChart(1, '실시간 유저포인트 적립금액', timeLabels, transactionRealtimeTrendListSavUserPntAmtData);
        drawChart(2, '실시간 전체 유저포인트 적립금액', timeLabels, transactionRealtimeTrendListSavUserPntAmtDataTotal);
        drawChart(3, '실시간 유저포인트 적립건수', timeLabels, transactionRealtimeTrendListSavUserPntCntData);
        drawChart(4, '실시간 전체 유저포인트 적립건수', timeLabels, transactionRealtimeTrendListSavUserPntCntDataTotal);
    }
    // (실시간) 카드캐시 적립
    if (number === 6) {
        drawChart(1, '실시간 카드포인트 적립금액', timeLabels, transactionRealtimeTrendListSavCardPntAmtData);
        drawChart(2, '실시간 전체 카드포인트 적립금액', timeLabels, transactionRealtimeTrendListSavCardPntAmtDataTotal);
        drawChart(3, '실시간 카드포인트 적립건수', timeLabels, transactionRealtimeTrendListSavCardPntCntData);
        drawChart(4, '실시간 전체 카드포인트 적립건수', timeLabels, transactionRealtimeTrendListSavCardPntCntDataTotal);
    }
}

function drawChart(chartId, title, chartLabels, chartData) {
    setChartDiv(chartId, title);
    if (chartData != null) chart('myChart' + chartId, chartLabels, chartData);
}

function setChartDiv(n, title) {
    $('#myChart_div' + n).html('');
    $('#myChart_div' + n).html('<h2>' + title + '</h2><canvas id="myChart' + n + '" width="500" height="240"></canvas>');
}

function setCalendarDiv() {
    let div = document.createElement("div");
    let h3 = document.createElement("h3");
    let table = document.createElement("table");
    let tHeadTr = document.createElement("tr");

    for (let l = 0; l < 7; l++) {
        let tHeadTh = document.createElement("th");
        tHeadTh.append(document.createTextNode(week[l]));
        tHeadTr.append(tHeadTh);
    }
    h3.append(document.createTextNode(moment().format('YYYY년 MM월 DD일')));
    div.append(h3);

    table.append(tHeadTr); // 요일 생성

    for (let i = 0; i < 6; i++) {
        let tBodyTr = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            let tBodyTd = document.createElement("td");
            let calendarFullDay = moment(moment().format('YYYYMM01')).add(i, 'week').startOf('isoWeek').subtract(1 - j, 'days').format('YYYYMMDD');
            let calendarDay = moment(calendarFullDay, 'YYYYMMDD').format('D');
            let otherMonthDay = moment(calendarFullDay, 'YYYYMMDD').format('YYYYMM');
            tBodyTd.append(document.createTextNode(calendarDay));
            if (otherMonthDay !== moment().format('YYYYMM')) tBodyTd.setAttribute("class", "otherMonthDay"); // 달력의 오늘 강조
            if (calendarFullDay === moment().format('YYYYMMDD')) tBodyTd.setAttribute("class", "today"); // 달력의 오늘 강조
            tBodyTr.append(tBodyTd);
        }
        table.append(tBodyTr); // 주별 생성
    }

    div.append(table);
    // 화면의 달력과 계산된 달력을 비교하여 변경사항이 있을 경우만 화면 갱신처리
    if (div.innerHTML !== document.getElementById("calendar").getElementsByTagName("div")[0].innerHTML) {
        $('#calendar').html(div);
        console.log('달력 갱신');
    }
}

/**
 * 배열로 받은 서브메뉴정보로 왼쪽에 메뉴목록을 구성
 * @param array
 */
function setSubMenu(array) {
    let subMenu = '';
    let menuNumber = 0;
    array.forEach(object => {
        subMenu += ('<li class="" id="myChart' + menuNumber + '_menuLink" onclick="submenuAction(' + menuNumber + ')"><span>●</span>' + object + '</li>');
        menuNumber++;
    })
    $('.left ul').html(subMenu);
}

/**
 * 왼쪽의 서브메뉴 클릭 시의 이동 액션
 * @param subMenuNumber
 */
function submenuAction(subMenuNumber) {
    displayNumber = subMenuNumber;
    showChart(displayNumber);
}

/**
 * 범례 정의
 */
function setLegend() {
    let i = 0;
    targetAspList.forEach(aspObj => {
        $('.legend ul').append('<li><div style="background: ' + barColor[i++] + '"></div>' + aspObj.name + '</li>');
    });
    $('.legend ul').append('<li><div style="background:#000000"></div>전체</li>');
}

/**
 * 일간 차트의 X출 라벨 정의
 */
function setDayLabels(today, days) {
    dayLabels = [];
    for (let i = 0; i <= days; i++) {
        dayLabels.push([moment(today, 'YYYYMMDD').subtract(days - i, 'days').format('MM-DD'), '(' + week[moment(today, 'YYYYMMDD').subtract(days - i, 'days').format('d')] + ')']);
    }
}


/**
 * 실시간 차트의 X출 라벨 정의
 */
function setTimeLabels(today, time) {
    timeLabels = [];
    for (let i = 0; i <= time; i++) {
        timeLabels.push(moment(today, 'YYYYMMDDHH').subtract(time - i, 'hour').format('DD일 HH시'));
    }
}

function changeDisplayFlag() {
    if (displayFlag) {
        displayFlag = false;
        $('#chartControl').html('<i class="fa fa-pause-circle"></i> Pause');
    } else {
        displayFlag = true;
        $('#chartControl').html('<i class="fa fa-play-circle"></i> Play');
    }
}

/**
 * 일간 거래 통계
 * @param today
 */
function setTransactionTrendListPay(today, days) {
    setDayLabels(today, days);
    transactionTrendListPayAmtData = [];
    transactionTrendListPayCntData = [];
    transactionTrendListPayUsrCntData = [];
    transactionTrendListPayPerOnceUsrData = [];
    transactionTrendListPayPerOnceData = [];

    transactionTrendListPayAmtDataTotal = [];
    transactionTrendListPayCntDataTotal = [];
    transactionTrendListPayUsrCntDataTotal = [];
    transactionTrendListPayPerOnceUsrDataTotal = [];
    transactionTrendListPayPerOnceDataTotal = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        transactionTrendListPayAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionTrendListPayCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionTrendListPayUsrCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionTrendListPayPerOnceUsrData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionTrendListPayPerOnceData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        k++;
    });
    transactionTrendListPayAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionTrendListPayCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionTrendListPayUsrCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionTrendListPayPerOnceUsrDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionTrendListPayPerOnceDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDD').subtract(days, 'days').format('YYYYMMDD');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYYMMDD');
    console.log('일간 거래 통계 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/monthly/transaction",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseData = data;
            loadingFlag[0] = true;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
            location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i <= days; i++) {
        transactionTrendListPayAmtDataTotal[0].data[i] = 0;
        transactionTrendListPayCntDataTotal[0].data[i] = 0;
        transactionTrendListPayUsrCntDataTotal[0].data[i] = 0;
        transactionTrendListPayPerOnceUsrDataTotal[0].data[i] = 0;
        transactionTrendListPayPerOnceDataTotal[0].data[i] = 0;

        let j = 0;
        refDate = moment(today, 'YYYYMMDD').subtract(days - i, 'days').format('YYYYMMDD');
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            transactionTrendListPayAmtData[j].data[i] = 0;
            transactionTrendListPayCntData[j].data[i] = 0;
            transactionTrendListPayUsrCntData[j].data[i] = 0;
            transactionTrendListPayPerOnceUsrData[j].data[i] = 0;
            transactionTrendListPayPerOnceData[j].data[i] = 0;

            responseData.map((item) => {
                // 기준일에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    transactionTrendListPayAmtData[j].data[i] += item.payAmt;                  // 거래금액
                    transactionTrendListPayCntData[j].data[i] += item.payCnt;                  // 거래건수
                    transactionTrendListPayUsrCntData[j].data[i] += item.payUsrCnt;            // 회원당 거래건수
                    transactionTrendListPayPerOnceUsrData[j].data[i] += item.payPerOnceUsr;    // 회원당 거래금액
                    transactionTrendListPayPerOnceData[j].data[i] += item.payPerOnce;          // 건당 거래금액

                    transactionTrendListPayAmtDataTotal[0].data[i] += item.payAmt;
                    transactionTrendListPayCntDataTotal[0].data[i] += item.payCnt;
                    transactionTrendListPayUsrCntDataTotal[0].data[i] += item.payUsrCnt;
                    transactionTrendListPayPerOnceUsrDataTotal[0].data[i] += item.payPerOnceUsr;
                    transactionTrendListPayPerOnceDataTotal[0].data[i] += item.payPerOnce;
                }
            });
            j++;
        });
    }
}

/**
 * 일간 회원 통계
 * @param today
 */
function setUserTrendListPay(today, days) {
    setDayLabels(today, days);
    userTrendListRegData = [];
    userTrendListWthData = [];

    userTrendListRegDataTotal = [];
    userTrendListWthDataTotal = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        userTrendListRegData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        userTrendListWthData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        k++;
    });

    userTrendListRegDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    userTrendListWthDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDD').subtract(days, 'days').format('YYYYMMDD');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYYMMDD');
    console.log('일간 회원 통계 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/monthly/user",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseData = data;
            loadingFlag[1] = true;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
            location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i <= days; i++) {
        userTrendListRegDataTotal[0].data[i] = 0;
        userTrendListWthDataTotal[0].data[i] = 0;

        let j = 0;
        refDate = moment(today, 'YYYYMMDD').subtract(days - i, 'days').format('YYYYMMDD');
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            userTrendListRegData[j].data[i] = 0;
            userTrendListWthData[j].data[i] = 0;

            responseData.map((item) => {
                // 기준일에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    userTrendListRegData[j].data[i] += item.regCnt;                  // 회원등록 건수
                    userTrendListWthData[j].data[i] += item.wthCnt;                  // 회원탈퇴 건수

                    userTrendListRegDataTotal[0].data[i] += item.regCnt;
                    userTrendListWthDataTotal[0].data[i] += item.wthCnt;
                }
            });
            j++;
        });
    }
}

/**
 * 실시간 거래 통계
 * @param today
 */
function setRealtimeTransactionTrendListPay(today, times) {
    setTimeLabels(today, times);
    transactionRealtimeTrendListPayAmtData = [];
    transactionRealtimeTrendListPayCntData = [];
    transactionRealtimeTrendListRcgAmtData = [];
    transactionRealtimeTrendListRcgCntData = [];
    transactionRealtimeTrendListRfdAmtData = [];
    transactionRealtimeTrendListRfdCntData = [];
    transactionRealtimeTrendListSavUserPntAmtData = [];
    transactionRealtimeTrendListSavUserPntCntData = [];
    transactionRealtimeTrendListSavCardPntAmtData = [];
    transactionRealtimeTrendListSavCardPntCntData = [];

    transactionRealtimeTrendListPayAmtDataTotal = [];
    transactionRealtimeTrendListPayCntDataTotal = [];
    transactionRealtimeTrendListRcgAmtDataTotal = [];
    transactionRealtimeTrendListRcgCntDataTotal = [];
    transactionRealtimeTrendListRfdAmtDataTotal = [];
    transactionRealtimeTrendListRfdCntDataTotal = [];
    transactionRealtimeTrendListSavUserPntAmtDataTotal = [];
    transactionRealtimeTrendListSavUserPntCntDataTotal = [];
    transactionRealtimeTrendListSavCardPntAmtDataTotal = [];
    transactionRealtimeTrendListSavCardPntCntDataTotal = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        transactionRealtimeTrendListPayAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListPayCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListRcgAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListRcgCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListRfdAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListRfdCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListSavUserPntAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListSavUserPntCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListSavCardPntAmtData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        transactionRealtimeTrendListSavCardPntCntData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        k++;
    });
    transactionRealtimeTrendListPayAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListPayCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListRcgAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListRcgCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListRfdAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListRfdCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListSavUserPntAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListSavUserPntCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListSavCardPntAmtDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    transactionRealtimeTrendListSavCardPntCntDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(시간) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDDHH').subtract(times, 'hour').format('YYYYMMDDHH');
    arguments.endDay = moment(today, 'YYYYMMDDHH').format('YYYYMMDDHH');
    console.log('실시간 거래 통계 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/realtime/transaction",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseData = data;
            loadingFlag[3] = true;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
            location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i <= times; i++) {
        transactionRealtimeTrendListPayAmtDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListPayCntDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListRcgAmtDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListRcgCntDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListRfdAmtDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListRfdCntDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListSavUserPntAmtDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListSavUserPntCntDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListSavCardPntAmtDataTotal[0].data[i] = 0;
        transactionRealtimeTrendListSavCardPntCntDataTotal[0].data[i] = 0;

        let j = 0;
        refDate = moment(today, 'YYYYMMDDHH').subtract(times - i, 'hour').format('YYYYMMDDHH');
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            transactionRealtimeTrendListPayAmtData[j].data[i] = 0;
            transactionRealtimeTrendListPayCntData[j].data[i] = 0;
            transactionRealtimeTrendListRcgAmtData[j].data[i] = 0;
            transactionRealtimeTrendListRcgCntData[j].data[i] = 0;
            transactionRealtimeTrendListRfdAmtData[j].data[i] = 0;
            transactionRealtimeTrendListRfdCntData[j].data[i] = 0;
            transactionRealtimeTrendListSavUserPntAmtData[j].data[i] = 0;
            transactionRealtimeTrendListSavUserPntCntData[j].data[i] = 0;
            transactionRealtimeTrendListSavCardPntAmtData[j].data[i] = 0;
            transactionRealtimeTrendListSavCardPntCntData[j].data[i] = 0;

            responseData.map((item) => {
                // 기준시간에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    transactionRealtimeTrendListPayAmtData[j].data[i] += item.payAmt;                  // 결제금액
                    transactionRealtimeTrendListPayCntData[j].data[i] += item.payCnt;                  // 결제건수
                    transactionRealtimeTrendListRcgAmtData[j].data[i] += item.rcgAmt;                  // 충전금애
                    transactionRealtimeTrendListRcgCntData[j].data[i] += item.rcgCnt;                  // 충전건수
                    transactionRealtimeTrendListRfdAmtData[j].data[i] += item.rfdAmt;                  // 환불금액(사용안함)
                    transactionRealtimeTrendListRfdCntData[j].data[i] += item.rfdCnt;                  // 환불건수(사용안함)
                    transactionRealtimeTrendListSavUserPntAmtData[j].data[i] += item.savUserPntAmt;    // 유저캐시 적립금액
                    transactionRealtimeTrendListSavUserPntCntData[j].data[i] += item.savUserPntCnt;    // 유저캐시 적립건수
                    transactionRealtimeTrendListSavCardPntAmtData[j].data[i] += item.savCardPntAmt;    // 카드캐시 적립금액
                    transactionRealtimeTrendListSavCardPntCntData[j].data[i] += item.savCardPntCnt;    // 카드캐시 적립건수

                    transactionRealtimeTrendListPayAmtDataTotal[0].data[i] += item.payAmt;
                    transactionRealtimeTrendListPayCntDataTotal[0].data[i] += item.payCnt;
                    transactionRealtimeTrendListRcgAmtDataTotal[0].data[i] += item.rcgAmt;
                    transactionRealtimeTrendListRcgCntDataTotal[0].data[i] += item.rcgCnt;
                    transactionRealtimeTrendListRfdAmtDataTotal[0].data[i] += item.rfdAmt;              //(사용안함)
                    transactionRealtimeTrendListRfdCntDataTotal[0].data[i] += item.rfdCnt;              //(사용안함)
                    transactionRealtimeTrendListSavUserPntAmtDataTotal[0].data[i] += item.savUserPntAmt;
                    transactionRealtimeTrendListSavUserPntCntDataTotal[0].data[i] += item.savUserPntCnt;
                    transactionRealtimeTrendListSavCardPntAmtDataTotal[0].data[i] += item.savCardPntAmt;
                    transactionRealtimeTrendListSavCardPntCntDataTotal[0].data[i] += item.savCardPntCnt;
                }
            });
            j++;
        });
    }
}

/**
 * 실시간 회원 통계
 * @param today
 */
function setRealtimeUserTrendListPay(today, times) {
    setTimeLabels(today, times);
    userRealtimeTrendListRegData = [];
    userRealtimeTrendListWthData = [];

    userRealtimeTrendListRegDataTotal = [];
    userRealtimeTrendListWthDataTotal = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        userRealtimeTrendListRegData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        userRealtimeTrendListWthData[k] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: []
        };
        k++;
    });

    userRealtimeTrendListRegDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };
    userRealtimeTrendListWthDataTotal[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: []
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(시간) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDDHH').subtract(times, 'hour').format('YYYYMMDDHH');
    arguments.endDay = moment(today, 'YYYYMMDDHH').format('YYYYMMDDHH');
    console.log('실시간 회원 통계 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/report/realtime/user",
        data: arguments,
        dataType: "json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        success: function (data, status, xhr) {
            responseData = data;
            loadingFlag[2] = true;
        },
        error: function (xhr, status, error) {
            console.log("ERROR : ", xhr);
            location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i <= times; i++) {
        userRealtimeTrendListRegDataTotal[0].data[i] = 0;
        userRealtimeTrendListWthDataTotal[0].data[i] = 0;

        let j = 0;
        refDate = moment(today, 'YYYYMMDDHH').subtract(times - i, 'hour').format('YYYYMMDDHH');
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            userRealtimeTrendListRegData[j].data[i] = 0;
            userRealtimeTrendListWthData[j].data[i] = 0;

            responseData.map((item) => {
                // 기준시간에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    userRealtimeTrendListRegData[j].data[i] += item.regCnt;                  // 회원등록 건수
                    userRealtimeTrendListWthData[j].data[i] += item.wthCnt;                  // 회원탈퇴 건수

                    userRealtimeTrendListRegDataTotal[0].data[i] += item.regCnt;
                    userRealtimeTrendListWthDataTotal[0].data[i] += item.wthCnt;
                }
            });
            j++;
        });
    }
}
