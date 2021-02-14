import Util from './modules/util.js'

(function(){

    'use strict';

    // ==================================
    // Datatable
    // ==================================

    var _dom = $(".table.activity-log");

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
    serverSide: true,
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
        "url": '/master/getActivityLog',
        "type": 'POST',
          "data": function (d) {
             d.srch_col = $("#tab-log .srch-col").val();
             d.srch_key = $("#tab-log .tab_log_srchkey").val();
          }
    },
    columns: [
        { 'data': 'LOG_ID' },
        {
            'data': 'LOG_CDE',
            'render': function ( data, type, row ) {
                let logClass = data.slice(0, 3);
                let logVal = data.slice(3,6);
                let txtcontent = ''

                switch (logClass) {
                    case 'GEN' :
                        switch (logVal) {
                            case '001':
                                txtcontent = '<span class="badge bg-success">로그인</span>';
                                break;
                            case '002':
                                txtcontent = '<span class="badge bg-secondary">암호변경</span>';
                                break;
                            case '003':
                                txtcontent = '<span class="badge bg-info">계정생성</span>';
                                break;
                        }
                        break;
                    case 'MAS' :
                        switch (logVal) {
                            case '001':
                                txtcontent = '<span class="badge bg-warning text-dark">암호초기화</span>';
                                break;
                            case '002':
                                txtcontent = '<span class="badge bg-danger">계정삭제</span>';
                                break;
                            case '003':
                                txtcontent = '<span class="badge bg-warning text-dark">권한변경</span>';
                                break;
                        }
                        break;
                    case 'USR' :
                        switch (logVal) {
                            case '001':
                                txtcontent = '<span class="badge bg-secondary">정보수정</span>';
                                break;
                            case '002':
                                txtcontent = '<span class="badge bg-secondary">파일업로드</span>';
                                break;
                        }
                        break;
                }
        return txtcontent;
    }
        },
        { 'data': 'ACTION_DETAIL' },
        {
            'data': 'CNAME',
            'render' : function(data, type, row){
                return `<span class='log-cname' name='club_${row.CID}'>${data}</span>`
            }
         },
        { 'data': 'CAMPUS' },
        { 'data': 'TIME' },
        { 'data': 'USR_IP' },
        { 
            'data': 'LOG_ID',
            'render': function(data, type, row){
                return `<span class='fas fa-trash-alt delete-log' name='log_${data}' style='cursor:pointer;'></span>`
            },         
        }
    ],
    columnDefs: [
        {
            "targets" : '_all',
            "className" : 'dt-center'
        },
        { "orderable": false, targets: [2, 4, 6, 7] },
        { "searchable": false, "targets": [0, 4, 5, 6, 7] },
        { "visible": false, "targets": [ 4 ] }, // hide campus column
    ],
    order: [[0, 'desc']],

    // ==================================
    // 캠퍼스 통합 관리자 전용 UI
    // ==================================

    // when finished loading
    initComplete: function(settings, json) {
        if(json.auth === 9){
            dataTable.columns([4]).visible(true);    // show campus column
        }
    }
    });


    // ==================================
    // 검색 이벤트
    // ==================================
    $("#tab-log .tab_log_srchbtn").click(function (e) {
        e.preventDefault();
        dataTable.ajax.reload()
    });
    $("#tab-log .tab_log_reset").click(function (e) {
        e.preventDefault();
        $("#tab-log .srch-col").val("");
        $("#tab-log .tab_log_srchkey").val("");
        
        dataTable.ajax.reload()
    });
    // Enter event
    Util.enterSubmit($("#tab-log .tab_log_srchkey"), $("#tab-log .tab_log_srchbtn"))


    // ==================================
    // 로그 삭제
    // ==================================
    _dom.on("click", ".delete-log", function () {
        let logId = $(this).attr('name').split('_')[1];

        Util.showAlert({
            'title': '경고!',
            'content' : `${logId}번 로그를 삭제하시겠습니까?`
         })
        .done((result) => {
            Util.closeAlert();
            $.ajax({
                url:'/master/delete-log',
                type: 'POST',
                data: {logId : logId},
                dataType: 'JSON'
            }).done(function(r){
                if(r.RESULT === 'FAIL'){
                    Util.showNoticeModal({
                        'type' : 'warning',
                        'title' : '로그삭제 실패', 
                        'content' : `[${logId}]번 로그를 삭제할 수 없습니다.`
                     })
                } else {
                    Util.showToast({
                        'type' : 'success',
                        'title' : `제거 완료`,
                        'content' : `로그를 삭제하였습니다.`
                     })
                }
                dataTable.ajax.reload()
            })
        })
    })

    // ==================================
    // 동아리 조회
    // ==================================
    _dom.on("click", ".log-cname", function () { // $([selector]).on("click", "tr")를 통해 이벤트를 한 번만 생성하여 처리
        let _cid = $(this).attr('name').split('_')[1];
        $.ajax({
            url:'/master/getClubDetail',
            type: 'POST',
            data: {cid : _cid},
            dataType: 'JSON'
        }).done(function(result){

            var obj_result = result[0]
            var modalTable = $('#info-table-modal, #info-table-modal2');

            $('#dt-title, #logo-cname').text(obj_result['cname']+' ');                              // title, logo cname
            
            if(obj_result['logo_path'] !== null){
                $('#dt-logo').find('img').attr('src', `../img/logo/${obj_result['logo_path']}`)     // logo path
            }

            for (var key in obj_result){
                if($('#dt-'+key) !== null){
                modalTable.find('#dt-'+key).text(obj_result[key])                              // else
                }
            }
            // Show Status Badge
            let txtcontent = ' '
            let auth = Number(obj_result['authority'])
            if(Util.isShown(auth)){
                txtcontent += '<span class="badge badge-pill badge-success" style="margin-left:10px;">공개중</span> '
            } else {
                txtcontent += '<span class="badge badge-pill badge-danger" style="margin-left:10px;">비공개</span> '
            }
            if(Util.isEditable(auth)){
                txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
            } else {
                txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
            }

            // Data Hiding for Account Managing
            let _cid = obj_result['cid']
            $('#dt-admin_id').data('hiddenCid', _cid)    // hide in #dt-admin_id

            modalTable.find('#dt-cname').append(txtcontent);

            // Call Modal
            $('#clubDetailModal').modal();

        }).fail(function(){
            alert("요청에 실패하였습니다. 다시 시도해주십시오.")
        }).always(function(){
            console.log('통신이 종료되었습니다.')
        })
    })
    

})()