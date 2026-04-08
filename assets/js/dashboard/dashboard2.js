// 초기 설정값
let today = moment().format('YYYYMMDD');      // (현재) 기준날짜
let now = moment().format('YYYYMMDDHH');    // (현재) 기준시간

let displayNumber = 0;
let displayTabNumber = 0;
let displayFlag = true;
let loadingFlag = [false, false, false];
// 배열 선언
let targetAspList = [];     // ASP 목록 배열 선언
let hourLabels = [];         // 일별 차트의 X출 라벨

let hourlyUserRegistrationData = [];
let hourlyPaymentCountData = [];
let hourlyPaymentAmountData = [];
let hourlyRechargeCountData = [];
let hourlyRechargeAmountData = [];

window.onload = function () {
    timer();                                            // 타이머 실행

    getAspList();

    setHourLabels();                                // 일별 차트의 X축 라벨 설정
    getHourlyUserRegistration(today);                  // (API)
    getHourlyPayment(today);                           // (API)
    getHourlyRecharge(today);                    // (API)
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

            today = moment().format('YYYYMMDD');      // (현재) 기준날짜
            now = moment().format('YYYYMMDDHH');      // (현재) 기준시간

            // 서브메뉴 이동 및 차트 그리기
            showChart(displayNumber, displayTabNumber);
            if (displayFlag) {
                if (displayTabNumber < 5) {
                    displayTabNumber++;
                } else {
                    displayTabNumber = 0;
                    if (displayNumber < targetAspList.length - 1) displayNumber++; else displayNumber = 0;
                }
            }
        }
        // 데이터 갱신 - 5분 안의 소수
        if (time % 277 === 0 && time !== 0) getHourlyUserRegistration(today);
        if (time % 261 === 0 && time !== 0) getHourlyPayment(today);
        if (time % 283 === 0 && time !== 0) getHourlyRecharge(today);
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
function showChart(number, tab) {
    $('.left ul li').removeClass('on');
    $('#myChart' + number + '_menuLink').addClass('on');

    if (tab === 0) {
        drawChart(1, '시간별 회원등록 건수', hourLabels, hourlyUserRegistrationData[number], '누적 회원등록 건수', tab);
    }
    if (tab === 1) {
        drawChart(1, '시간별 결제 건수', hourLabels, hourlyPaymentCountData[number], '누적 결제 건수', tab);
    }
    if (tab === 2) {
        drawChart(1, '시간별 결제 금액', hourLabels, hourlyPaymentAmountData[number], '누적 결제 금액', tab);
    }
    if (tab === 3) {
        drawChart(1, '시간별 충전 건수', hourLabels, hourlyRechargeCountData[number], '누적 충전 건수', tab);
    }
    if (tab === 4) {
        drawChart(1, '시간별 충전 금액', hourLabels, hourlyRechargeAmountData[number], '누적 충전 금액', tab);
    }
}

function drawChart(chartId, title, chartLabels, chartData, text, tab) {
    setChartDiv(chartId, tab);
    $('#myChartTotal' + chartId).html(text + ' : ' + codeToHumanValue('thousandSeparator', chartData[0].total, null))
    if (chartData != null) chart('myChart' + chartId, chartLabels, chartData);
}

function setChartDiv(n, tab) {
    let html = ''
    if (tab === 0) {
        html += '<h2 class="active" onclick="showChart(' + n + ',0)">시간별 회원등록 건수</h2>';
    } else {
        html += '<h2 onclick="showChart(' + n + ',0)">시간별 회원등록 건수</h2>';
    }
    if (tab === 1) {
        html += '<h2 class="active" onclick="showChart(' + n + ',1)">시간별 결제 건수</h2>';
    } else {
        html += '<h2 onclick="showChart(' + n + ',1)">시간별 결제 건수</h2>';
    }
    if (tab === 2) {
        html += '<h2 class="active" onclick="showChart(' + n + ',2)">시간별 결제 금액</h2>';
    } else {
        html += '<h2 onclick="showChart(' + n + ',2)">시간별 결제 금액</h2>';
    }
    if (tab === 3) {
        html += '<h2 class="active" onclick="showChart(' + n + ',3)">시간별 충전 건수</h2>';
    } else {
        html += '<h2 onclick="showChart(' + n + ',3)">시간별 충전 건수</h2>';
    }
    if (tab === 4) {
        html += '<h2 class="active" onclick="showChart(' + n + ',4)">시간별 충전 금액</h2>';
    } else {
        html += '<h2 onclick="showChart(' + n + ',4)">시간별 충전 금액</h2>';
    }

    html += '<div id="myChartTotal' + n + '">-</div><canvas id="myChart' + n + '" width="500" height="250"></canvas>';
    $('#myChart_div' + n).html('');
    $('#myChart_div' + n).html(html);
}

/**
 * 배열로 받은 서브메뉴정보로 왼쪽에 메뉴목록을 구성
 * @param array
 */
function setSubMenu(array) {
    let subMenu = '';
    let menuNumber = 0;
    array.forEach(object => {
        subMenu += ('<li class="" id="myChart' + menuNumber + '_menuLink" onclick="submenuAction(' + menuNumber + ')"><span style="color: ' + reportColor(menuNumber, 1) + '">■</span>' + object.name + '</li>');
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
    showChart(displayNumber, 0);
}

/**
 * 일별 차트의 X출 라벨 정의
 */
function setHourLabels() {
    hourLabels = [];
    for (let i = 0; i < 24; i++) {
        hourLabels.push(i + '시');
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

    setSubMenu(targetAspList);
}

/**
 * 시간별 회원등록 건수
 * @param today
 */
function getHourlyUserRegistration(today) {
    hourlyUserRegistrationData = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        hourlyUserRegistrationData[k] = [];
        hourlyUserRegistrationData[k][0] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: [],
            total: 0
        };
        k++;
    });

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYYMMDD00');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYYMMDD23');
    console.log('일별 회원등록 건수 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/hourly/user",
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
    for (let i = 0; i < 24; i++) {

        let j = 0;
        if (i < 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD0' + i);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD' + i);
        }
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            hourlyUserRegistrationData[j][0].data[i] = 0;

            responseData.map((item) => {
                // 기준일에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    hourlyUserRegistrationData[j][0].data[i] += item.cnt;
                    hourlyUserRegistrationData[j][0].total += item.cnt;
                }
            });
            j++;
        });
    }
}

/**
 * 시간별 거래 건수 + 금액
 * @param today
 */
function getHourlyPayment(today) {
    hourlyPaymentCountData = [];
    hourlyPaymentAmountData = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        hourlyPaymentCountData[k] = [];
        hourlyPaymentCountData[k][0] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: [],
            total: 0
        };

        hourlyPaymentAmountData[k] = [];
        hourlyPaymentAmountData[k][0] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: [],
            total: 0
        };

        k++;
    });

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYYMMDD00');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYYMMDD23');
    console.log('시간별 거래 건수 + 금액 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/hourly/payment",
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
    for (let i = 0; i < 24; i++) {

        let j = 0;
        if (i < 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD0' + i);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD' + i);
        }
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            hourlyPaymentCountData[j][0].data[i] = 0;
            hourlyPaymentAmountData[j][0].data[i] = 0;

            responseData.map((item) => {
                // 기준일에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    hourlyPaymentCountData[j][0].data[i] += item.cnt;
                    hourlyPaymentCountData[j][0].total += item.cnt;

                    hourlyPaymentAmountData[j][0].data[i] += item.amt;
                    hourlyPaymentAmountData[j][0].total += item.amt;
                }
            });
            j++;
        });
    }
}

/**
 * 시간별 충전 건수 + 금액
 * @param today
 */
function getHourlyRecharge(today) {
    hourlyRechargeCountData = [];
    hourlyRechargeAmountData = [];

    let k = 0;
    // ASP 목록만큼의 그래프 설정값 생성
    targetAspList.forEach(aspObj => {
        hourlyRechargeCountData[k] = [];
        hourlyRechargeCountData[k][0] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: [],
            total: 0
        };

        hourlyRechargeAmountData[k] = [];
        hourlyRechargeAmountData[k][0] = {
            label: aspObj.name,
            borderColor: reportColor(k, 1),
            backgroundColor: reportColor(k, 1),
            data: [],
            total: 0
        };

        k++;
    });

    let responseData = [];      // 통계 데이터
    let arguments = {};

    // 데이터의 범위(날짜) = startDay ~ endDay
    arguments.startDay = moment(today, 'YYYYMMDD').format('YYYYMMDD00');
    arguments.endDay = moment(today, 'YYYYMMDD').format('YYYYMMDD23');
    console.log('시간별 충전 건수 + 금액 : ', arguments.startDay, '~', arguments.endDay);

    // 통계 데이터 가져오기
    $.ajax({
        type: 'get',
        url: "/api/hourly/recharge",
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
    for (let i = 0; i < 24; i++) {

        let j = 0;
        if (i < 10) {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD0' + i);
        } else {
            refDate = moment(today, 'YYYYMMDD').format('YYYYMMDD' + i);
        }
        targetAspList.forEach(aspObj => {
            // 통계값 배열에 초기값(0) 설정
            hourlyRechargeCountData[j][0].data[i] = 0;
            hourlyRechargeAmountData[j][0].data[i] = 0;

            responseData.map((item) => {
                // 기준일에 해당 ASP의 개별 통계값 저장
                if (item.sasDt === refDate && item.aspId === aspObj.aspId) {
                    hourlyRechargeCountData[j][0].data[i] += item.cnt;
                    hourlyRechargeCountData[j][0].total += item.cnt;

                    hourlyRechargeAmountData[j][0].data[i] += item.amt;
                    hourlyRechargeAmountData[j][0].total += item.amt;
                }
            });
            j++;
        });
    }
}