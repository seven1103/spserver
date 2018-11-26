/**
 * Created by baixinxin on 2017/5/8.
 */
$(function(){
    var $register_form = $('#register_form'),
         $login_form = $('#login_form');
    $('#register_btn').click(function(){
        $register_form.show();
        $login_form.hide();
    });
    $('#back_btn').click(function(e){
        e.preventDefault();
        $register_form.hide();
        $login_form.show();
    });

    // ajax注册
   $('#register_act').click(function(e){
       e.preventDefault();
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$register_form.find('[name="username"]').val(),
                password:$register_form.find('[name="password"]').val(),
                repassword:$register_form.find('[name="repassword"]').val()
            },
            dataType:'json',
            success:function(result){
                console.log(result);
                if(result.code===0){
                    window.location.reload();
                }
            }
        })
   })

    // ajax登录
    $('.login_btn').click(function (e) {
        e.preventDefault();
        $.ajax({
            type:'post',
            url:'/admin/adminLogin',
            data:{
                username:$('[name="username"]').val(),
                password:$('[name="password"]').val()
            },
            dataType:'json',
            success:function(result){
                if(result.code===0){
                    alert('登录成功');
                    setTimeout(location.href="/admin",1000)
                }else{
                    alert(result.msg);
                }
            }
        })
    })

    // 退出
    $("#logout").on('click',function(){
        $.ajax({
            type:'get',
            url:'/api/user/logout',
            datatype:'json',
            success:function(result){
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    })
});