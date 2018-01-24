	let body = document.getElementById("body");
	let navContainer = document.createElement("div");

	let header = 
		`<div class="navigation">
			<ul class="navbar">
		          <ul id="top-menu" class="dropdown-menu"></ul>
		          	  <li class="top-menu-item"><a href="/">HOME</a></li>
		              <li class="top-menu-item"><a href="/login.html">Login</a></li>
		              <li class="top-menu-item"><a href="/register.html">Sign up</a></li>
		              <li class="top-menu-item signed-in">Signed in as:</li>
		              <!--<li class="top-menu-item"><a href="/login/user/logout">Logout</a></li>-->
		              <li class="top-menu-item">
		              	<form style="display:inline-block" id="logout-user" action="/login/user/logout" method="POST">
		              		<button style="background-color: green; border: none; outline:none;" class="logout-btn" type="submit"><a>Logout</a></button>
		              	</form>
		              </li>
		      	  </ul>
		    </ul>
		</div>`;

	navContainer.innerHTML = header;
	body.prepend(navContainer);

$(document).ready(function(){

	function dataCallback(data) {
		let headerEl = document.getElementsByClassName("signed-in")[0];

		if(!data) {
			let userName = null;
		}else {
			let userName = data.username;
			let content = `Signed in as: ${userName}`;
			headerEl.innerHTML = content;
			//to make "check attending" button visible
			if(document.getElementById("check-attending")) {
				document.getElementById("check-attending").style.display = "inline-block";
			}
		}
	}

	function callData() {
		$.get("/user-data", dataCallback)
	}
	callData();

	$("#logout-user").on("submit", function(e){
	    e.preventDefault();
	    $.get("/app-locals", (response) => {
			let token = response.token;
			if(token) {
				let confirmLogout = confirm("Are you sure you want to logout?");
				if(confirmLogout) {
					$.ajax({
						type: "DELETE",
						url: "/login/user/logout",
						headers: {"x-auth": token},
						success: function(data) {
							console.log(data);

							let headerEl = document.getElementsByClassName("signed-in")[0];
							let content = "Signed in as: "
							headerEl.innerHTML = content;
							//to hide "check attending" button upon logout
							document.getElementById("check-attending").style.display = "none";
							window.location.href = "/search.html";
						},
						error: function(err){
							console.log(err);
						}
					}); //ajax
				} //if confirm
			}// if token
	    }); // log-out
	}); //get app-locals

	let loginForm = document.querySelector("#login-form");
	console.log("typeof ", typeof $("#login-form"));
	console.log("typeof - 2 ", typeof loginForm);
	/*loginForm.addEventListener("submit", function(evt) {
		evt.preventDefault();
		let data = this.serialize();
		console.log(data);
	});*/

	/*loginForm.addEventListener("submit", function(evt){
		evt.preventDefault();
		console.log("this... ", this.password.value);

        $.ajax({
            url: "/login/user",
            method: "POST",
            data: "username="+this.username.value&"email="+this.email.value&"password="+this.password.value,
            success: function(response){
            	if(!response){
            		alert("No user found");
            	}else {
            		console.log("response ", response);
            	}
            },
        });
        //return false;
	});*/


	// preventDefault and return false are commented out to allow the submission of valid login
	//credentials to occur but trigger an alert if login attemp is invalid.
	$("#login-form").submit(function(e) {
		//e.preventDefault();

		console.log(this.username.value + "---" + this.email.value);

		let formData = $(this).serialize();
		console.log("formData ", formData);

		$.ajax({
            url: "/login/user",
            method: "POST",
            data: formData,
            success: function(response){
            //If login is invalid, the redirection back to login.html will trigger the alert.
            	if(response){
            		confirm("Have you registered?");
            	}else {
            		console.log(response);
            	}
            },
        });
       // return false;
	});


}); //document

