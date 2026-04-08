let _this;

class ServiceExec {
    constructor() {
        _this = this
    }

    postNewsLetter = function (email) {
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
    }

    htmlGet = function (path, payload, loadingProgress = true) {
        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout( () => {
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
                        if( loadingProgress ) {
                            stopLoading();
                        }
                    },
                    success: resolve,
                    error: _this.handleError
                });
            }, 30);
        });

        return promise.then(_this.handleSuccess);
    }

    htmlPost = function (path, payload) {
        let promise = new Promise(resolve => {
            $.ajax({
                url: path || '',
                type: 'POST',
                data: payload,
                dataType: 'HTML',
                async: false,
                // processData: false,
                // contentType: false,
                // enctype: 'multipart/form-data',
                beforeSend: function () {
                },
                complete: function () {
                },
                success: resolve,
                error: _this.handleError
            })
        });

        return promise.then(res => res);
    }

    downPost = function (path, payload) {
        setTimeout( () => {
            $.ajax({
                url: path,
                type: 'POST',
                data: payload,
                cache: false,
                xhrFields: {
                    responseType: 'blob'
                },
            }).done(function (blob, status, xhr) {
                let fileName = "";
                let disposition = xhr.getResponseHeader("Content-Disposition");
                if (disposition && disposition.indexOf("attachment") >= 0) {
                    let fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    let matches = fileNameRegex.exec(disposition);

                    if (matches != null && matches[1]) {
                        fileName = decodeURI(matches[1].replace(/['"]/g, ""));
                    }
                }

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                } else {
                    let URL = window.URL || window.webkitURL;
                    let downloadUrl = URL.createObjectURL(blob);

                    if (fileName) {
                        let a = document.createElement('a');
                        if (a.download === undefined) {
                            window.location.href = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location.href = downloadUrl;
                    }
                }
            })
        }, 30);
    }

    formPost = function (path, payload, loadingProgress = true) {
        const formData = new FormData();
        // $.each(payload, function (key, value) {
        //     formData.append(key, value);
        // })
        $.each(payload, function (key, value) {
            if (value.constructor === Array) {
                $.each(value, function (subKey, subValue) {
                    $.each(subValue, function (thirdKey, thirdValue) {
                        if (thirdValue !== undefined) {
                            formData.append(`${key}[${subKey}].${thirdKey}`, thirdValue);
                        }
                    });
                });
            } else if (value.constructor === Object) {
                $.each(value, function (subKey, subValue) {
                    if (subValue !== undefined) {
                        formData.append(`${key}.${subKey}`, subValue);
                    }
                });
            } else {
                formData.append(key, value);
            }
        })

        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout( () => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: formData,
                    dataType: 'JSON',
                    async: false,
                    processData: false,
                    contentType: false,
                    enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                        if( loadingProgress ) {
                            stopLoading();
                        }
                    },
                    success: resolve,
                    error: _this.handleError
                });
            }, 30);
        });

        return promise.then(_this.handleSuccess);
    }

    formPostAsync = function (path, payload, loadingProgress = true) {
        const formData = new FormData();
        $.each(payload, function (key, value) {
            if (value.constructor === Array) {
                $.each(value, function (subKey, subValue) {
                    $.each(subValue, function (thirdKey, thirdValue) {
                        if (thirdValue !== undefined) {
                            formData.append(`${key}[${subKey}].${thirdKey}`, thirdValue);
                        }
                    });
                });
            } else if (value.constructor === Object) {
                $.each(value, function (subKey, subValue) {
                    if (subValue !== undefined) {
                        formData.append(`${key}.${subKey}`, subValue);
                    }
                });
            } else {
                formData.append(key, value);
            }
        })

        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout( () => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: formData,
                    dataType: 'JSON',
                    async: true,
                    processData: false,
                    contentType: false,
                    enctype: 'multipart/form-data',
                    beforeSend: function () {
                        $("#uploadComplete").html("");
                        $("#uploadComplete").css("display", "none");
                        $("#uploadReject").html("");
                        $("#uploadReject").css("display", "none");

                        $(".close-modal").css("display", "none");
                        $(".btn-type1, .btn-type2").attr("disabled", true);
                        $("#uploading").css("display", "block");
                    },
                    complete: function () {
                        if( loadingProgress ) {
                            stopLoading();
                        }
                        $(".close-modal").css("display", "block");
                        $(".btn-type1, .btn-type2").attr("disabled", false);
                        $("#uploading").css("display", "none");
                    },
                    success: resolve,
                    error: _this.handleError
                })
            }, 30);
        });

        return promise.then(_this.handleSuccess);
    }

    jsonPost = function (path, payload, loadingProgress = true) {
        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout(() => {
                $.ajax({
                    url: path || '',
                    type: 'POST',
                    data: JSON.stringify(payload),
                    dataType: 'JSON',
                    async: false,
                    // processData: false,
                    contentType: 'application/json',
                    // enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                        if( loadingProgress ) {
                            stopLoading();
                        }
                    },
                    success: resolve,
                    error: _this.handleError
                })
            });
        }, 30);

        return promise.then(_this.handleSuccess);
    }

    jsonDownPost = function (path, payload) {
        setTimeout(() => {
            startLoading();
            $.ajax({
                url: path,
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                cache: false,
                xhrFields: {
                    responseType: 'blob'
                }
            })
            .done(function (blob, status, xhr) {
                let fileName = "";
                let disposition = xhr.getResponseHeader("Content-Disposition");

                if (disposition && disposition.indexOf("attachment") >= 0) {
                    let fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    let matches = fileNameRegex.exec(disposition);

                    if (matches != null && matches[1]) {
                        fileName = decodeURI(matches[1].replace(/['"]/g, ""));
                    }
                }

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    // IE11 support
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                } else {
                    let URL = window.URL || window.webkitURL;
                    let downloadUrl = URL.createObjectURL(blob);

                    if (fileName) {
                        let a = document.createElement('a');
                        if (a.download === undefined) {
                            window.location.href = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    } else {
                        window.location.href = downloadUrl;
                    }

                    // Clean up
                    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
                }
                stopLoading();
            })
            .fail(function (xhr, status, error) {
                stopLoading();
                alert('다운로드에 실패했습니다.');
            });
        }, 30);
    };

    post = function (path, payload, loadingProgress = true) {
        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout( () => {
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
                        if( loadingProgress ) {
                            stopLoading();
                        }
                    },
                    success: resolve,
                    error: _this.handleError
                });
            }, 15);
        });

        return promise.then(_this.handleSuccess);
    }

    queryPost = function (path, payload) {

    }

    queryMultiPost = function (path, payloade) {

    }

    queryDelete = function (path, loadingProgress = true) {
        if( loadingProgress ) {
            startLoading();
        }
        let promise = new Promise(resolve => {
            setTimeout( () => {
                $.ajax({
                    url: path || '',
                    type: 'DELETE',
                    async: false,
                    // processData: false,
                    // contentType: false,
                    // enctype: 'multipart/form-data',
                    beforeSend: function () {
                    },
                    complete: function () {
                        if( loadingProgress ) {
                            stopLoading();
                        }
                    },
                    success: resolve,
                    error: _this.handleError
                });
            }, 15);
        });

        return promise.then(_this.handleSuccess);
    }

    handleSuccess = async function (res) {
        switch (res.code) {
            case -9996:
            case '-9996':
                alert(res.message);
                window.location.href = '/account/login';
                break;
            case -9993:
            case '-9993':
                alert(res.message)
                window.location.href = '/main/dashboard';
                break;
            case -9992:
            case '-9992':
                alert(res.message)
                window.location.href = '/main/dashboard';
                break;
            default:
                return res;
        }
    }

    handleError = function (xhr, status, error) {
        console.log(xhr)
        console.log(status)
        console.log(error)

        console.log(xhr.status + error)
        switch (xhr.status) {
        }
    }
}

export default new ServiceExec()
