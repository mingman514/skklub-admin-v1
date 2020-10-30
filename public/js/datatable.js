var _dom = $(".table.clublist");

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

dataTable = _dom.DataTable({
   language: lang_kor,
   serverSide: false,
   processing: true,
   responsive: true,
   searching: false,
   lengthChange: true,
   ordering: true,
   pageLength: 10,
   paging: true,
   stateSave: true,
   scrollX : true,
   ajax: {
      "url": '/getClubList',
      "type": 'POST',
      "data": function (d) {
         d.campus = $("select[name='campus']").val();
         d.category = $("select[name='category1']").val();
         d.status = $("select[name='status']").val();
         d.searchCategory = $("select[name='searchCategory']").val();
         d.searchKey = $("#searchKey").val();
      }
   },
   columns: [
      {
         'data': 'cid',
         'render' : function(data){
            let _chkbox = `<input type="checkbox" class="clubChkbox" data-clubid="${data}">`
            return _chkbox
         }
     },
      {
      'data': 'authority',
       "render": function ( data, type, row ) {
                  let auth = Number(data)
                  let txtcontent = ''
                  if(auth === 0){
                     txtcontent += '<span class="badge badge-pill badge-warning">대기</span>'
                  } else if(auth === 1) {
                     txtcontent += '<span class="badge badge-pill badge-danger">중지</span>'
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-success">승인</span>'
                  }
             return txtcontent;
       }
      },{
         'data': 'campus'
      },
      {
         'data': 'cname'
      },
      {
         'data': 'category1'
      },
      {
         'data': 'category2'
      },
      {
         'data': 'category3'
      },
      {
         'data': 'president_name'
      },
      {
         'data': 'president_contact'
      },
      {
         'data': 'authority',
         'defaultContent': 'test'
     },
   ],
   columnDefs: [
      {
         "targets" : '_all',
         "className" : 'dt-center'
      }
   ]
});


_dom.find("tbody").off("click").on("click", "tr", function () { // $([selector]).on("click", "tr")를 통해 이벤트를 한 번만 생성하여 처리
   let _cid = $(this).find('.clubChkbox').data('clubid'); // get cid from 'data-clubid property'
   $.ajax({
      url:'/getClubDetail',
      type: 'POST',
      data: {cid : _cid},
      dataType: 'JSON'
  }).done(function(result){
      console.log('RESULT : ', result[0]);
      var obj_result = result[0]
      // Draw Page
      var modalTable = $('#info-table-modal');
      for (key in obj_result){
         if($('#dt-'+key) !== null){
            modalTable.find('#dt-'+key).text(obj_result[key])
         }
      }
    
      $('#clubDetailModal').modal();
  }).fail(function(){
     alert("요청에 실패하였습니다. 다시 시도해주십시오.")
  }).always(function(){
     console.log('통신이 종료되었습니다.')
  })


});

// 검색
$("#search_btn").click(function (e) {
   e.preventDefault();
   dataTable.ajax.reload()
});
$("#reset_filter").click(function (e) {
   e.preventDefault();
   $('#filterform').each(function () {
      this.reset();
   })
   $("#searchKey").focus();
   dataTable.ajax.reload()
});