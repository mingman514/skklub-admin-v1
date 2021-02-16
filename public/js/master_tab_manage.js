import Util from './modules/util.js'

(function(){

    'use strict';

    // DOM
    const codeAccorMr = $('#code-accordian-mr');
    const codeAccorYj = $('#code-accordian-yj');
    const manCodeBtnMr = $('#manage_code_btn_mr');
    const manCodeBtnYj = $('#manage_code_btn_yj');
    const codeUseCheckMr = $('#use-code-mr');
    const codeUseCheckYj = $('#use-code-yj');
    const codeInputMr = $('#code-mr');
    const codeInputYj = $('#code-yj');
    const codeBtnMr = $('#btn-code-mr');
    const codeBtnYj = $('#btn-code-yj');

    /***********************************
     * Load Code Information
     ***********************************/ 
    $.ajax({
        url:'/master/getCodeInfo',
        type: 'POST',
        dataType: 'json'
      }).then((r) => {
        
        if(r.RESULT === 'FAIL'){
            codeAccorMr.hide();
            codeAccorYj.hide();            
            return false;
        }
        if(r.RESULT === 'SUCCESS'){

            r.INFO.forEach((e) => {
                if(e.CAMPUS === '명륜'){
                    codeInputMr.val(e.CODE);
                    if(e.USED){
                        codeUseCheckMr.attr('checked', true);
                    } else {
                        codeUseCheckMr.attr('checked', false);
                        codeBtnMr.attr('disabled', true);
                    }
                } else if(e.CAMPUS === '율전'){
                    codeInputYj.val(e.CODE);
                    if(e.USED){
                        codeUseCheckYj.attr('checked', true);
                    } else {
                        codeUseCheckYj.attr('checked', false);
                        codeBtnYj.attr('disabled', true);
                    }
                }
            })
        }

        // Show according to campus
        if(r.CAMPUS.indexOf('명륜') === -1){
            codeAccorMr.html('');
        }
        if(r.CAMPUS.indexOf('율전') === -1){
            codeAccorYj.html('');
        }  
    })

    /***********************************
     * Binding Event
     ***********************************/ 
    // Enter Event
    Util.enterSubmit(codeInputMr, codeBtnMr);
    Util.enterSubmit(codeInputYj, codeBtnYj);

    // code change btn
    /** @todo 명륜/율전 각각 따로 이벤트 걸어서 매우 비효율적임 */
    // For MR
    codeBtnMr.off().on('click', () => {
        if(codeUseCheckMr.attr('checked')){
            if(codeBtnMr.hasClass('btn-info')){
                codeBtnMr.text('저장');
                codeBtnMr.addClass('btn-warning').removeClass('btn-info');
                codeInputMr.attr('disabled', false);
            }else if(codeBtnMr.hasClass('btn-warning')){
                if(!checkCode(codeInputMr.val())) {
                    Util.showNoticeModal({ 'title' : '알림', 'content' : '인증코드 양식에 맞게 입력해주세요.<br>(20자리 내 영문, 한글 및 숫자)' });
                    return false;
                }
                $.ajax({
                    url:'/master/changeCode',
                    type: 'POST',
                    data: {
                        'campus' : '명륜',
                        'code' : codeInputMr.val()
                    },
                    dataType: 'json'
                  }).then((r) => {
                    if(r.RESULT === 'FAIL')
                        Util.showToast({ 'content' : '코드 저장이 실패하였습니다.', 'type' : 'danger'});
                    else if (r.RESULT === 'SUCCESS'){
                        Util.showToast({ 'content' : '코드 저장이 완료되었습니다.', 'type' : 'success'});

                        codeBtnMr.text('수정');
                        codeBtnMr.addClass('btn-info').removeClass('btn-warning');
                        codeInputMr.attr('disabled', true);
                    }
                  })
            }
        }
    })
        // use-code checkbox
    codeUseCheckMr.off().on('click', (e) => {
        var isChecked = ($(e.target).attr('checked')==='checked'? 1 : 0);
        $.ajax({
            url:'/master/changeCodeUse',
            type: 'POST',
            data: {
                'campus' : '명륜',
                'use' : Math.abs(isChecked - 1)
            },
            dataType: 'json'
        }).then((r) => {
            if(r.RESULT !== 'SUCCESS'){
                $(e.target).attr('checked', isChecked);
                return false;
            } else {
                if(isChecked){
                    $(e.target).attr('checked', false);
                    codeBtnMr.attr('disabled', false);
        
                    codeBtnMr.text('수정');
                    codeBtnMr.attr('disabled', true);
                    codeInputMr.attr('disabled', true);
                    codeBtnMr.addClass('btn-info').removeClass('btn-warning');
                    Util.showToast({ 'content' : '인증코드를 사용하지 않습니다.', 'type' : 'warning'});
                } else {
                    $(e.target).attr('checked', true);
                    codeBtnMr.attr('disabled', false);
                    Util.showToast({ 'content' : '인증코드를 사용합니다.', 'type' : 'success'});
                }
            }
        })
            
    })
    // For YJ
    codeBtnYj.off().on('click', () => {
        if(codeUseCheckYj.attr('checked')){
            if(codeBtnYj.hasClass('btn-info')){
                codeBtnYj.text('저장');
                codeBtnYj.addClass('btn-warning').removeClass('btn-info');
                codeInputYj.attr('disabled', false);
            }else if(codeBtnYj.hasClass('btn-warning')){
                if(!checkCode(codeInputYj.val())) {
                    Util.showNoticeModal({ 'title' : '알림', 'content' : '인증코드 양식에 맞게 입력해주세요.<br>(20자리 내 영문, 한글 및 숫자)' });
                    return false;
                }
                $.ajax({
                    url:'/master/changeCode',
                    type: 'POST',
                    data: {
                        'campus' : '율전',
                        'code' : codeInputYj.val()
                    },
                    dataType: 'json'
                  }).then((r) => {
                    if(r.RESULT === 'FAIL')
                        Util.showToast({ 'content' : '코드 저장이 실패하였습니다.', 'type' : 'danger'});
                    else if (r.RESULT === 'SUCCESS'){
                        Util.showToast({ 'content' : '코드 저장이 완료되었습니다.', 'type' : 'success'});

                        codeBtnYj.text('수정');
                        codeBtnYj.addClass('btn-info').removeClass('btn-warning');
                        codeInputYj.attr('disabled', true);
                    }
                  })
            }
        }
    })
        // use-code checkbox
    codeUseCheckYj.off().on('click', (e) => {
        var isChecked = ($(e.target).attr('checked')==='checked'? 1 : 0);
        $.ajax({
            url:'/master/changeCodeUse',
            type: 'POST',
            data: {
                'campus' : '율전',
                'use' : Math.abs(isChecked - 1)
            },
            dataType: 'json'
        }).then((r) => {
            if(r.RESULT !== 'SUCCESS'){
                $(e.target).attr('checked', isChecked);
                return false;
            } else {
                if(isChecked){
                    $(e.target).attr('checked', false);
                    codeBtnYj.attr('disabled', false);
        
                    codeBtnYj.text('수정');
                    codeBtnYj.attr('disabled', true);
                    codeInputYj.attr('disabled', true);
                    codeBtnYj.addClass('btn-info').removeClass('btn-warning');
                    Util.showToast({ 'content' : '인증코드를 사용하지 않습니다.', 'type' : 'warning'});
                } else {
                    $(e.target).attr('checked', true);
                    codeBtnYj.attr('disabled', false);
                    Util.showToast({ 'content' : '인증코드를 사용합니다.', 'type' : 'success'});
                }
            }
        })
            
    })
    function checkCode(str){
        var regEx = /^[가-힣A-Za-z0-9]{0,20}$/g;
        
        return regEx.test(str);
    }


})();