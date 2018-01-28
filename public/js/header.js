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

//Call to app-locals for testing purposes
	/*$.get("/app-locals", (response) => {
		console.log("app-locals ", response);
		if(response.authenticated) {
		$.get("/app-locals-search", (response) => {
			let result = JSON.parse(response);
			console.log("result.length ", result.length);
			if(result.length) {
				let locations = result[0];
				//console.log("response ", locations);
				console.log("sending data from locals");
				processData(locations);
			}else {

			}
		});
	}
	});*/


	function dataCallback(data) {
		let headerEl = document.getElementsByClassName("signed-in")[0];

		if(!data) {
			let userName = null;
		}else {
			let userName = data.username;
			let content = `Welome Home: ${userName}`;
			headerEl.innerHTML = content;
			//to make "check attending" button visible
			if(document.getElementById("check-attending")) {
				document.getElementById("check-attending").style.display = "inline-block";

				$.get("/app-locals-search", (response) => {
					let result = JSON.parse(response);
					console.log("result.length ", result.length);
					if(result.length) {
						let locations = result[0];
						console.log("sending search data from header.js on page reload");
						processData(locations);
					}else {
						
					}
				});
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

				let confirmLogout = confirm(`Do you really want to logout? Do you really want to be *that* way? Seriously? Ok. See ya'...wouldn't wanna be ya...
					
					Bye.`);
					
				if(confirmLogout) {
					$.ajax({
						type: "DELETE",
						url: "/login/user/logout",
						headers: {"x-auth": token},
						success: function(data) {

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
            	if(response){
            		//next();
            	}else {
            		console.log(response);
            	}
            },
            error: function(err) {
            	console.log(err);
            	alert("Invalid login. You may need to register.");
            	window.location.href = "login.html"
            }
        });
       // return false;
	});


	function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}


	if (storageAvailable('sessionStorage') && storageAvailable("localStorage")) {

		console.log("storage available")
	}
	else {

		console.log("storage not available")
	}


}); //document