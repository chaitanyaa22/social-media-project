$(document).ready(function () {
    $('#cfpassword').on('keyup', function(){
        var pwd = $('#password').val()
        var cpwd = $('#cfpassword').val()
        if(cpwd.length>=1){
            if(cpwd != pwd){
                $('#cfp').text("Password doesn't match.")
                $('#submit').attr('disabled','true');
            }
            else{
                $('#cfp').text("Password matched")
                $('#submit').removeAttr('disabled');
            }
        }
        else{
            $('#cfp').text(" ")
            $('#submit').attr('disabled','true');
        } 
    })
});