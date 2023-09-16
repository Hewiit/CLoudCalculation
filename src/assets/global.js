import { Message, MessageBox } from 'element-ui'
import moment from 'moment';

/* 直接加上信息即可 */
export const alert_msg = {
    success:function(msg){
        Message({
            showClose: true,
            message: msg,
            type: 'success'
        });
    },
    error:function(msg){
        Message({
            showClose: true,
            message: msg,
            type: 'error'
        });
    },
    warning:function(msg){
        Message({
            showClose: true,
            message: msg,
            type: 'warning'
        });
    },
    normal:function(msg){
        Message({
            showClose: true,
            message: msg,
        });
    }
}

/*
    alert_box.msg(title, msg, func, context):
        弹出提示窗口，msg 为内容，如果有 after_function 则在点击确认后执行。
    alert_box.confirm(title, msg, context, confirm_func, cancal_func):
        弹出确认窗口，msg为内容，点击确认后如果有 confirm_func 则执行，cancel_func 则是点击取消后执行的。
    alert_box.html(title, text):
        弹出提示窗口，text 支持 html。
*/
export const alert_box = {
    msg:function(title, msg, context, func){
        MessageBox.alert(msg, title, {
            confirmButtonText: "确定",
            callback: action => {
                if(func){
                    if(!context){
                        // alert('Panic: alert_box.msg 执行 func 时没有 context');
                        return;
                    }
                    func.apply(context);
                }
            }
        });
    },
    confirm:function(title, text, context, confirm_func, cancal_func){
        MessageBox.confirm(text, title, {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: 'warning'
            }).then(() => {
                if(confirm_func){
                    if(!context){
                        // alert('Panic: alert_box.confirm 执行 confirm_func 时没有 context');
                        return;
                    }
                    confirm_func.apply(context);
                }
            }).catch(() => {
                if(cancal_func){
                    if(!context){
                        // alert('Panic: alert_box.confirm 执行 cancel_func 时没有 context');
                        return;
                    }
                    cancal_func.apply(context);
                }
        });
    },
    html:function(title, text){
        MessageBox.prompt(text, title, {
            confirmButtonText: "确认",
            dangerouslyUseHTMLString: true,
        });
    },
    select:function(title, text, context, confirm_func, cancal_func){
        return MessageBox.confirm(text, title, {
            confirmButtonText: "是",
            cancelButtonText: "否",
            type: 'warning'
        }).then(() => {
            if(confirm_func){
                if(!context){
                    // alert('Panic: alert_box.confirm 执行 confirm_func 时没有 context');
                    return;
                }
                confirm_func.apply(context);
            }
        }).catch(() => {
            if(cancal_func){
                if(!context){
                    // alert('Panic: alert_box.confirm 执行 cancel_func 时没有 context');
                    return;
                }
                cancal_func.apply(context);
            }
        });
    },
};

/*
    get 请求:
        原型: get(url, data, context, func, option);
            url:        String，请求的链接，不允许携带参数
            data:       Object，要携带的参数
            context:    Object，运行的上下文环境
            func:       Object，请求处理函数，里面有 success 和 error 元素
            option:     Object，请求的选项：
                async：         Boolean，是否关闭异步请求，默认 false,
                full_target:    Boolean，不改变 url
        example:
            this.ajax.get('www.example.com', {
                id: 1,
                sid: 'hello'
            }, this, {
                success(){
                    this.alert_msg.success('success');
                },
                error(){
                    this.alert_msg.error('error');
                }
            }, {});
    post 请求:
        原型: post(url, data, context, func, option);
            url:        String，请求的链接
            data:       Object，要携带的参数
            context:    Object，运行的上下文环境
            func:       Object，请求处理函数，里面有 success 和 error 元素
            option:     Object，请求的选项：
                async：         Boolean，是否关闭异步请求，默认 false,
                full_target:    Boolean，不改变 url
                form:   Boolean，是否传递表单而不是 json，默认 false
        example:
            this.ajax.post('www.example.com', new FormData(), this, {
                success(){
                    this.alert_msg.success('success');
                }
            }, {
                form: true
            });
    debug 器:
        debug.get(res, is_success, url, data, context, func, option);
            res: 返回的 json
            is_success: 是否请求成功
        debug.post(res, is_success, url, data, context, func, option);
            res: 返回的 json
            is_success: 是否请求成功
            注：在打印 debug 信息前 post 请求会打印发送的 data 内容。
*/
export const ajax = function(){
    var getCookie = function(name) {
        var value = '; ' + document.cookie
        var parts = value.split('; ' + name + '=')
        if (parts.length === 2) return parts.pop().split(';').shift()
    };

    const DEBUG = true;
    var debug_printer = function(type, url, success, res){
        if(!DEBUG){
            return;
        }

        var res_msgger = function(name, data, deep){
            var msg = '';
            for(let i=0; i<deep; i++){
                msg += '\t';
            }
            msg += name + ': ';
            if(data === undefined){
                return msg + 'undefined\n';
            }
            if(Array.isArray(data)){
                msg += 'Array(' + data.length + ')[\n';
                for(let i=0; i<data.length; i++){
                    msg += res_msgger(i, data[i], deep+1);
                }
                for(let i=0; i<deep; i++){
                    msg += '\t';
                }
                msg += ']\n';
            }
            else if(typeof data == 'object'){
                msg += '{\n';
                msg += obj_msgger(data, deep+1);
                for(let i=0; i<deep; i++){
                    msg += '\t';
                }
                msg += '}\n';
            }
            else{
                msg += data + '\n';
            }
            return msg;
        }

        var obj_msgger = function(obj, deep){
            var msg = '';
            var key;
            for(key in obj){
                if(obj.hasOwnProperty(key)){
                    for(let i=0; i<deep; i++){
                        msg += '\t';
                    }
                    msg += key + ': ';
                    if(Array.isArray(obj[key])){
                        msg += 'Array(' + obj[key].length + ')[\n';
                        for(let i=0; i<obj[key].length; i++){
                            msg += res_msgger(i, obj[key][i], deep+1);
                        }
                        for(let i=0; i<deep; i++){
                            msg += '\t';
                        }
                        msg += ']\n';
                    }
                    else if(typeof obj[key] == 'object'){
                        msg += '{\n';
                        msg += obj_msgger(obj[key], deep+1);
                        for(let i=0; i<deep; i++){
                            msg += '\t';
                        }
                        msg += '}\n';
                    }
                    else{
                        msg += obj[key] + '\n';
                    }
                }
            }
            return msg;
        }

        var msg = '=============== Ajax DEBUG Data ===============\n%c';
        msg += 'Request type: ' + type.toUpperCase() +  '\n';
        msg += 'Url: ' + url + '\n';
        msg += 'Connection: ' + (success ? 'Success' : 'Error') + '\n';
        if(res==undefined || typeof res!='object'){
            msg += '+--------------------------------+\n';
            msg += '|  Panic: res is not an object.  |\n';
            msg += '+--------------------------------+\n';
            msg += '=====================================\n';
            console.log('%c'+msg.slice(0, 1000), 'background:red; color:#fff; border-radius:3px; padding: 0 3px', 'color: red');
            return;
        }
        if(success){
            msg += '+-------------------------------+\n';
            msg += res_msgger('Data', res, 0);
            msg += '+-------------------------------+\n';
        }
        else{
            msg += '+-------------------------------+\n';
            msg += 'Error msg: ' + '\n';
            msg += '\tCode: ' + res.status + '\n';
            msg += '\tError text: ' + res.statusText + '\n';
            msg += '+-------------------------------+\n';
        }
        msg += '=====================================\n';
        // console.log('%c'+msg, 'background:red; color:#fff; border-radius:3px', 'color: red');
        console.log('%c'+msg.slice(0, 1000),
                success ? 'background:green; color:#fff; border-radius:3px; padding: 0 3px' : 'background:red; color:#fff; border-radius:3px; padding: 0 3px',
                success ? 'color: green' : 'color: red');
    }

    var virtual_ajax = function(url, data, context, func, option, type, res, is_success){
        if(type == 'post'){
            console.log({data: data});
        }
        setTimeout(function(){
            if(is_success){
                debug_printer(type, url, true, res);
                switch(res.status){
                    case -1:
                        context.alert_msg.error('发生未知错误，请重试');
                        break;
                    case 1:
                        // context.alert_msg.error('Panic: 键错误');
                        break;
                    case 2:
                        // context.alert_msg.error('Panic: 数据库错误');
                        break;
                    default:
                        if(func && func.success){
                            if(!context){
                                // alert('Panic: ajax.' + type + ' 执行 func.success 时没有 context');
                                return;
                            }
                            func.success.apply(context, [res]);
                        }
                }
            }
            else{
                debug_printer(type, url, false, {status: 'test', statusText: 'test'});
                if(func && func.error){
                    if(!context){
                        // alert('Panic: ajax.' + type + ' 执行 func.error 时没有 context');
                        return;
                    }
                    func.error.apply(context, [xhr]);
                }
            }
        }, 690);
    }

    var original_ajax = function(url, data, context, func, option, type){
        $.ajax({
            type: type,
            url: ((option&&option.full_target===true) ? '' : 'http://20.89.42.33:8008') + url,
            headers: {'X-CSRFToken': getCookie('csrftoken'),},
            data: data ? (option&&option.form ? data : JSON.stringify(data)) : undefined,
            processData: false,
            contentType: false,
            crossDomain: true,
            async: !option||option.async||option.async===undefined ? true : false,
            timeout: 60000,
            success: function(res){
                debug_printer(type, url, true, res);
                switch(res.status){
                    case -1:
                        context.alert_msg.error('发生未知错误，请重试');
                        break;
                    case 1:
                        // context.alert_msg.error('Panic: 键错误');
                        break;
                    case 2:
                        // context.alert_msg.error('Panic: 数据库错误');
                        break;
                    default:
                        if(func && func.success){
                            if(!context){
                                // alert('Panic: ajax.' + type + ' 执行 func.success 时没有 context');
                                return;
                            }
                            func.success.apply(context, [res]);
                        }
                }
            },
            error: function(xhr){
                debug_printer(type, url, false, xhr);
                switch(xhr.status){
                    case 403:
                        context.alert_msg.error('您没有访问权限');
                        break;
                    case 404:
                        // context.alert_msg.error('404 NOT FOUND');
                        break;
                    case 500:
                        // context.alert_msg.error('后端炸掉了，去找后端吧');
                        break;
                }
                if(func && func.error){
                    if(!context){
                        // alert('Panic: ajax.' + type + ' 执行 func.error 时没有 context');
                        return;
                    }
                    func.error.apply(context, [xhr]);
                }
            }
        });
    };

    return {
        get: function(url, data, context, func, option){
            var flag = url.indexOf('?') != -1;
            if(data && data!={}){
                var key;
                for(key in data){
                    if(data.hasOwnProperty(key)){
                        url += flag ? '&' : '?';
                        flag = true;
                        url += key + '=' + data[key];
                    }
                }
            }

            original_ajax(url, undefined, context, func, option, 'get');
        },
        post: function(url, data, context, func, option){
            original_ajax(url, data, context, func, option, 'post');
        },
        debug: {
            get: function(res, is_success, url, data, context, func, option){
                var flag = url.indexOf('?') != -1;
                if(data && data!={}){
                    var key;
                    for(key in data){
                        if(data.hasOwnProperty(key)){
                            url += flag ? '&' : '?';
                            flag = true;
                            url += key + '=' + data[key];
                        }
                    }
                }

                virtual_ajax(url, undefined, context, func, option, 'get', res, is_success);
            },
            post: function(res, is_success, url, data, context, func, option){
                virtual_ajax(url, data, context, func, option, 'post', res, is_success);
            },
        }
    }
}();

/*
    slider_calculation(range)
        range[0]: 起始时间的 moment
        range[1]: 终止时间的 moment

    返回值：Object
        max_value：滑动条最大值
        format：滑动条提示信息生成函数 : Object
            msg：信息
            year
            month
            day
        marks：拖动条提示信息
*/
export const slider_calculation = function(range) {
    var start = moment(range[0]);
    var end = moment(range[1]);
    if(start > end) {
        let temp = start;
        start = end;
        end = temp;
    }
    var value = Math.abs(start.diff(end, 'day'));
    let tip = function(mom) {
        return mom.year() + ' 年 ' + (mom.month()+1) + ' 月 ' + mom.date() + ' 日';
    }
    var get_tooltip = function(new_value) {
        if(new_value > value) {
            return '未知';
        }
        // var diff = value - new_value;
        let _start = moment(start);
        var new_moment = _start.add(new_value, 'd');
        return {
            msg: tip(new_moment),
            year: new_moment.year(),
            month: new_moment.month() + 1,
            date: new_moment.date()
        }
    }
    var get_value = function(s, e) {
        let _s = s.diff(start, 'd');
        if(e) {
            let _d = e.diff(start, 'd');
            return [_s, _d];
        }
        return _s;
    }
    return {
        max_value: value,
        format: get_tooltip,
        value: get_value,
        marks: {
            0: get_tooltip(0),
            value: get_tooltip(value)
        }
    };
}
