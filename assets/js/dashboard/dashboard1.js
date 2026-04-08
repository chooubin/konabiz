// 초기 설정값
let today = moment().format('YYYYMMDD');      // (현재) 기준날짜
let now = moment().format('YYYYMMDDHH');    // (현재) 기준시간
const days = 14;              // (일간) 과거 몇일까지의 데이터
const hours = 12;             // (실시간) 최근 몇시간까지의 데이터
const week = ['일', '월', '화', '수', '목', '금', '토'];
const submenuList = [
    '월별 회원등록 건수',
    '월별 결제 건수',
    '월별 결제 금액',
    '일별 회원등록 건수',
    '일별 결제 건수',
    '일별 결제 금액'
];

let displayNumber = 0;
let displayFlag = true;
let loadingFlag = [false, false, false, false];
// 배열 선언
let monthLabels = [];       // 월별 차트의 X출 라벨
let dayLabels = [];         // 일별 차트의 X출 라벨

let monthlyUserRegistrationData = [];
let monthlyPaymentCountData = [];
let monthlyPaymentAmountData = [];
let dailyUserRegistrationData = [];
let dailyPaymentCountData = [];
let dailyPaymentAmountData = [];

window.onload = function () {
    timer();                                            // 타이머 실행
    setSubMenu(submenuList);                            // 왼쪽의 서브메뉴 목록 설정
    setCalendarDiv();                                   // 왼쪽 달력 표시

    setMonthLabels();                                   // 월별 차트의 X축 라벨 설정
    setDayLabels(today);                                // 일별 차트의 X축 라벨 설정
    getMonthlyUserRegistration(today);                  // (API)
    getMonthlyPayment(today);                           // (API)
    getDailyUserRegistration(today);                    // (API)
    getDailyPayment(today);                             // (API)
};

/**
 * 타이머
 */
function timer() {
    let time = 0;
    let x = setInterval(function () {
        checkLoading();
        // $('.loading').fadeOut('slow');
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
        if (time % 277 === 0 && time !== 0) getMonthlyUserRegistration(today);
        if (time % 261 === 0 && time !== 0) getMonthlyPayment(today);
        if (time % 283 === 0 && time !== 0) getDailyUserRegistration(today);
        if (time % 293 === 0 && time !== 0) getDailyPayment(today);
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
                    font: {
                        size: 30
                    },
                    padding: 2,
                }
            },
        }
    })
}

/**
 * 화면의 차트 제어
 * @number
 */
function showChart(number) {
    $('.left ul li').removeClass('on');
    $('#myChart' + number + '_menuLink').addClass('on');

    // 월별 회원등록 건수
    if (number === 0) {
        drawChart(1, '월별 회원등록 건수', monthLabels, monthlyUserRegistrationData, '누적 회원등록 건수');
    }
    // 월별 결제 건수
    if (number === 1) {
        drawChart(1, '월별 결제 건수', monthLabels, monthlyPaymentCountData, '누적 결제 건수');
    }
    // 월별 결제 금액
    if (number === 2) {
        drawChart(1, '월별 결제 금액', monthLabels, monthlyPaymentAmountData, '누적 결제 금액');
    }
    // 일별 회원등록 건수
    if (number === 3) {
        drawChart(1, '일별 회원등록 건수', dayLabels, dailyUserRegistrationData, '누적 회원등록 건수');
    }
    // 일별 결제 건수
    if (number === 4) {
        drawChart(1, '일별 결제 건수', dayLabels, dailyPaymentCountData, '누적 결제 건수');
    }
    // 일별 결제 금액
    if (number === 5) {
        drawChart(1, '일별 결제 금액', dayLabels, dailyPaymentAmountData, '누적 결제 금액');
    }
}

function drawChart(chartId, title, chartLabels, chartData, text) {
    setChartDiv(chartId, title);
    $('#myChartTotal' + chartId).html(text + ' : ' + codeToHumanValue('thousandSeparator', chartData[0].total, null))
    if (chartData != null) chart('myChart' + chartId, chartLabels, chartData);
}

function setChartDiv(n, title) {
    $('#myChart_div' + n).html('');
    $('#myChart_div' + n).html('<h2 class="active">' + title + '</h2><div id="myChartTotal' + n + '">누적</div><canvas id="myChart' + n + '" width="500" height="250"></canvas>');
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
 * 월별 차트의 X출 라벨 정의
 */
function setMonthLabels() {
    monthLabels = [];
    for (let i = 1; i <= 12; i++) {
        monthLabels.push(i + '월');
    }
}

/**
 * 일별 차트의 X출 라벨 정의
 */
function setDayLabels(today) {
    dayLabels = [];
    for (let i = 0; i < moment(today, 'YYYYMMDD').endOf('month').format('D'); i++) {
        let k = i + 1;
        if (k < 10) k = '0' + i;
        dayLabels.push([(i + 1) + '일', '(' + week[moment(moment(today, 'YYYYMM').format('DD') + k, 'YYYYMMDD').format('d')] + ')']);
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
 * 월별 회원등록 건수
 * @param today
 */
function getMonthlyUserRegistration(today) {
    setMonthLabels();
    monthlyUserRegistrationData = [];

    monthlyUserRegistrationData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위 : SAS_DT = 'YYYYMM'
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYY01');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYY12');
    console.log('월별 회원등록 건수 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/monthly/user",
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
            // location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i < 12; i++) {

        if ((i + 1) >= 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYY') + (i + 1);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYY') + '0' + (i + 1);
        }

        // 통계값 배열에 초기값(0) 설정
        monthlyUserRegistrationData[0].data[i] = 0;

        responseData.map((item) => {
            // 기준일에 해당 개별 통계값 저장
            if (item.sasDt === refDate) {
                monthlyUserRegistrationData[0].data[i] += item.cnt;
                monthlyUserRegistrationData[0].total += item.cnt;
            }
        });
    }
}

/**
 * 월별 결제 건수 + 금액
 * @param today
 */
function getMonthlyPayment(today) {
    setMonthLabels();
    monthlyPaymentCountData = [];

    monthlyPaymentCountData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    monthlyPaymentAmountData = [];

    monthlyPaymentAmountData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위 : SAS_DT = 'YYYYMM'
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYY01');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYY12');
    console.log('월별 결제 건수 + 금액 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/monthly/payment",
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
            // location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i < 12; i++) {

        if ((i + 1) >= 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYY') + (i + 1);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYY') + '0' + (i + 1);
        }

        // 통계값 배열에 초기값(0) 설정
        monthlyPaymentCountData[0].data[i] = 0;
        monthlyPaymentAmountData[0].data[i] = 0;

        responseData.map((item) => {
            // 기준일에 해당 개별 통계값 저장
            if (item.sasDt === refDate) {
                monthlyPaymentCountData[0].data[i] += item.cnt;
                monthlyPaymentCountData[0].total += item.cnt;

                monthlyPaymentAmountData[0].data[i] += item.amt;
                monthlyPaymentAmountData[0].total += item.amt;
            }
        });
    }
}


/**
 * 일별 회원등록 건수
 * @param today
 */
function getDailyUserRegistration(today) {
    setDayLabels(today);
    dailyUserRegistrationData = [];

    dailyUserRegistrationData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위 : SAS_DT = 'YYYYMM'
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYYMM01');
    arguments.endDay = moment(today, 'YYYYMMDD').endOf('month').format('YYYYMMDD');
    console.log('일별 회원등록 건수 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/daily/user",
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
            // location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i < moment(today, 'YYYYMMDD').endOf('month').format('DD'); i++) {

        if ((i + 1) >= 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMM') + (i + 1);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMM') + '0' + (i + 1);
        }

        // 통계값 배열에 초기값(0) 설정
        dailyUserRegistrationData[0].data[i] = 0;

        responseData.map((item) => {
            // 기준일에 해당 개별 통계값 저장
            if (item.sasDt === refDate) {
                dailyUserRegistrationData[0].data[i] += item.cnt;
                dailyUserRegistrationData[0].total += item.cnt;
            }
        });
    }
}



/**
 * 일별 결제 건수 + 금액
 * @param today
 */
function getDailyPayment(today) {
    setDayLabels(today);
    dailyPaymentCountData = [];

    dailyPaymentCountData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    dailyPaymentAmountData = [];

    dailyPaymentAmountData[0] = {
        label: '전체',
        borderColor: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(0,0,0,1)',
        data: [],
        total: 0
    };

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위 : SAS_DT = 'YYYYMM'
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYYMM01');
    arguments.endDay = moment(today, 'YYYYMMDD').endOf('month').format('YYYYMMDD');
    console.log('일별 결제 건수 + 금액 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/daily/payment",
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
            // location.href = '/';
        }
    });

    let refDate = "";
    for (let i = 0; i < moment(today, 'YYYYMMDD').endOf('month').format('DD'); i++) {

        if ((i + 1) >= 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMM') + (i + 1);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMM') + '0' + (i + 1);
        }

        // 통계값 배열에 초기값(0) 설정
        dailyPaymentCountData[0].data[i] = 0;
        dailyPaymentAmountData[0].data[i] = 0;

        responseData.map((item) => {
            // 기준일에 해당 개별 통계값 저장
            if (item.sasDt === refDate) {
                dailyPaymentCountData[0].data[i] += item.cnt;
                dailyPaymentCountData[0].total += item.cnt;

                dailyPaymentAmountData[0].data[i] += item.amt;
                dailyPaymentAmountData[0].total += item.amt;
            }
        });
    }
}