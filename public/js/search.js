$(document).ready(function() {

	console.log("search.js connected");

	if(document.getElementById("search-btn")){
		document.getElementById("search-btn").addEventListener("click", (e) => {
			e.preventDefault();

			document.getElementsByClassName("list-container")[0].innerHTML = "";

			let searchTerm;

			if(document.getElementById("search-term").value === "") {
				alert("Search requires a valid zipcode or city name.")
				return;
			}else {
				searchTerm = document.getElementById("search-term").value;
			}

			$.get(`/search/${searchTerm}`, (result) => {
				let allBusinesses = result.businesses;

				//let storage = localStorage.setItem("result", JSON.stringify(result));
				//let getResult = localStorage.getItem("result");
				//let resObj = JSON.parse(getResult);

				processData(result);
			});

			function elementCallback(response) {
				let element = document.getElementById("search-term");
					if(response === null) {
						element.value = "";
					}
			}
			$.get("/user-data", elementCallback);

		});
	}

	let body = document.getElementById("search-container");
	let modalAttachment = document.getElementById("modal-attachment-site");
	let modalContainerDiv = document.createElement("div");
	modalContainerDiv.setAttribute("id", "modal-div");

	let attendBtn = document.getElementById("check-attending");
	let attend = document.getElementById("attend");
	attendBtn.addEventListener("click", (evt) => {
		evt.preventDefault();
		if(modalContainerDiv.style.display === "block") {
			attend.setAttribute("href", "#list-wrapper");
			modalContainerDiv.style.display = "none";
			
		}else {
			modalContainerDiv.style.display = "block";
			attend.setAttribute("href", "#list-wrapper");
			let html = `
				<div class="modal-container">
					<div id="modal">

					</div>
				</div>
			`;

			modalContainerDiv.innerHTML = html;
			modalAttachment.append(modalContainerDiv);

			$.get("/user-data", (user) => {
				console.log("user ", user);
				let ulHtml = `
					<div id="list-wrapper">
						<h4 id="loc-h4">Nightlife Attendance Minder</h4>
						<ul class="modal-list">
							${user.attending.map(loc => `<li class="modal-list-item">${loc}  <a class="itemDel" href="#">delete</a></li>`).join("")}
						</ul>
					</div>
				`;

			let modalDiv = document.getElementById("modal");
			modalDiv.innerHTML = ulHtml;
			console.log("checking dom access ", document.getElementById("itemDel"));

				if(document.getElementsByClassName("modal-list-item")) {
					let coll = document.getElementsByClassName("modal-list-item");

					Array.prototype.forEach.call(coll, function(el, index) {
						el.lastChild.addEventListener("click", function(evt) {
							evt.preventDefault();

							$.get("/user-data", (user) => {
								console.log(user.attending);
								let locArr = user.attending;
								$.post(`/user-remove/${locArr[index]}`, (response) => {
									console.log("location removed");
									el.remove();
								});
							});
						});
					});
				}


			});

		} //else

	});


}); //$(document).ready()