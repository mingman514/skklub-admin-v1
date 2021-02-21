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

(function(){

    'use strict';

    // ==================================
    // Datatable
    // ==================================

    var _dom = $(".table.club-manage");

    const lang_kor = {
    "decimal": "",
    "emptyTable": "데이터가 없습니다.",
    "info": "총 _TOTAL_ 건",
    "infoEmpty": "0 건",
    "infoFiltered": "(전체 _MAX_ 명 중 검색결과)",
    "infoPostFix": "",
    "thousands": ",",
    "loadingRecords": "로딩중...",
    "processing": `<img src='img/loading-table.gif' />`,
    "search": "검색 : ",
    "zeroRecords": "검색된 데이터가 없습니다.",
    "paginate": {
        "first": "첫 페이지",
        "last": "마지막 페이지",
        "next": "다음",
        "previous": "이전"
    },
    "aria": {
        "sortAscending": " :  오름차순 정렬",
        "sortDescending": " :  내림차순 정렬"
    }
    };

    var dataTable = _dom.DataTable({
    language: lang_kor,
    serverSide: false,
    processing: true,
    responsive: true,
    searching: false,
    lengthChange: true,
    ordering: true,
    pageLength: 10,
    paging: true,
    pagingType: "simple_numbers",
    stateSave: false,
    scrollX : true,
    autoWidth: true,
    ajax: {
        "url": '/master/getRegistList',
        "type": 'POST'
    },
    columns: [
        { 'data': 'ROWNUM' },
        { 'data': 'CNAME' },
        { 
            'data': 'CATEGORY1',
            'render' : function(data, type, row){
                // 중앙, 독립, 소모임, 학회
                let txtcontent = ''
                let badgeOption = '';    // default

                switch (data) {
                    case '중앙동아리':
                        badgeOption = 'warning'; break;
                    case '독립동아리':
                        badgeOption = 'secondary'; break;
                    case '소모임':
                        badgeOption = 'info'; break;
                    case '학회':
                        badgeOption = 'success'; break;
                    default:
                        badgeOption = 'dark';
                        break;
                }
                return `<span class="badge bg-${badgeOption}">${data}</span>`;
            }
        },
        { 'data': 'CAMPUS' },
        { 'data': 'PRESIDENT' },
        { 'data': 'CONTACT' },
        { 'data': 'REGIST_TIME' },
        { 
            'data': 'ID',
            'render': function(data, type, row){
                return `
                    <span class='fas fa-check-square delete-log' name='regist_${data}' style='cursor:pointer;'></span>
                    <span class='fas fa-window-close delete-log' name='regist_${data}' style='cursor:pointer;'></span>
                `
            },         
        }
    ],
    columnDefs: [
        {
            "targets" : '_all',
            "className" : 'dt-center'
        },
        { "orderable": false, targets: [4, 6] },
        { "visible": false, "targets": [ 3 ] }, // hide campus column
    ],
    order: [[0, 'desc']],

    // ==================================
    // 캠퍼스 통합 관리자 전용 UI
    // ==================================

    // when finished loading
    initComplete: function(settings, json) {
        if(json.auth === 9){
            dataTable.columns([3]).visible(true);    // show campus column
        }
    }
    });



})();