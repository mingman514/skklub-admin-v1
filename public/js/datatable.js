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
   stateSave: false,
   scrollX : true,
   ajax: {
      "url": '/getClubList',
      "type": 'POST',
      "data": function (d) {
         d.campus = $("select[name='campus']").val();
         d.category = $("select[name='category1']").val();
         d.show = $("select[name='show']").val();
         d.edit = $("select[name='edit']").val();
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
         'data': 'cid',
         'render' : function(data){
            let viewDetailBtn = `<span class="fas fa-plus-square fa-lg viewDetail" data-clubid="${data}">`
            return viewDetailBtn
         }
     },
      {
      'data': 'authority',
       'render': function ( data, type, row ) {
                  let auth = Number(data)
                  let txtcontent = ''

                  if(isShown(auth)){
                     txtcontent += '<span class="badge badge-pill badge-success">공개중</span> '
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-danger">비공개</span> '
                  }
                  if(isEditable(auth)){
                     txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
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
         'render': function ( data, type, row ) {
                     let auth = Number(data)
                     let switchContent = '';
                     if(isShown(auth)){
                        switchContent += `<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input showSwitch" checked>
                        <label class="custom-control-label">공개</label>
                      </div>`
                     } else {
                        switchContent += `<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input showSwitch">
                        <label class="custom-control-label">공개</label>
                      </div>`
                     }
                     if(isEditable(auth)){
                        switchContent += `<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input editSwitch" checked>
                        <label class="custom-control-label">수정</label>
                      </div>`
                     } else {
                        switchContent += `<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input editSwitch">
                        <label class="custom-control-label">수정</label>
                      </div>`
                     }
                     return switchContent;
                  }
         
     }
   ],
   columnDefs: [
      {
         "targets" : '_all',
         "className" : 'dt-center'
      }
   ]
});


_dom.find("tbody").off("click").on("click", ".viewDetail", function () { // $([selector]).on("click", "tr")를 통해 이벤트를 한 번만 생성하여 처리
   let _cid = $(this).data('clubid'); // get cid from 'data-clubid property'
      $.ajax({
         url:'/getClubDetail',
         type: 'POST',
         data: {cid : _cid},
         dataType: 'JSON'
   }).done(function(result){
         // console.log('RESULT : ', result[0]);
         var obj_result = result[0]
         // Draw Page --- logo 추가
         var modalTable = $('#info-table-modal, #info-table-modal2');

         $('#dt-title').text(obj_result['cname']);
         
         for (key in obj_result){
            if($('#dt-'+key) !== null){
               modalTable.find('#dt-'+key).text(obj_result[key])
            }
         }
         // Show Status Badge
         let txtcontent = ' '
         let auth = Number(obj_result['authority'])
         if(isShown(auth)){
            txtcontent += '<span class="badge badge-pill badge-success" style="margin-left:10px;">공개중</span> '
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger" style="margin-left:10px;">비공개</span> '
         }
         if(isEditable(auth)){
            txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
         }
         modalTable.find('#dt-cname').append(txtcontent);

         // Call Modal
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

// dataTable.columns([0,9]).visible(false);

// 모드 전환
$('a.toggle-vis').on( 'click', function (e) {
   e.preventDefault();

   // Get the column API object
   var column = dataTable.column();

   // Toggle the visibility
   column.visible( ! column.visible() );
} );


function isShown(auth){
   let binNum = auth.toString(2)
   if(binNum >= 4 || binNum[binNum.length-1] === '1'){ // 관리자급부턴 기본권한 허용
      return true;
   }
   return false;
}

function isEditable(auth){
   let binNum = auth.toString(2)
   if(binNum >= 4 || binNum[binNum.length-2] === '1'){
      return true;
   }
   return false;
}