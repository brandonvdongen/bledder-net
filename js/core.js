document.addEventListener("DOMContentLoaded",function(){
    const naam="dennis";
    const wachtwoord="b62a55052f1a2f446e198d3136464786ff2c337c";
    
    
    const menu_button_login = document.getElementById("menu_button_login");
    const login_form = document.getElementById("login_form");
    ////
    menu_button_login.addEventListener("click",function(){
        login_form.classList.toggle("hidden");
    });
    
})