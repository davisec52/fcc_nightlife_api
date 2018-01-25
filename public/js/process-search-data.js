console.log("process-search-data.js connected");

function removeDiacritics(str) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

let processData = function(data) {
	console.log("data ", data);
	//let getStorage = localStorage.getItem("result");
	//let data = JSON.parse(getStorage);
	//console.log("retrieve storage ", data);

	let revArray = [];

	let listContainer = document.getElementsByClassName("list-container")[0];

	localStorage.setItem("test", "just a test");
	let storage = localStorage.getItem("test");

	listContainer.innerHTML = storage;

	if(data) {

		data.businesses.forEach(function(biz) {

			/*let bizName = localStorage.setItem(biz.name, JSON.stringify(biz.name));
			let getName = localStorage.getItem(biz.name);
			let name = JSON.parse(getName);
			let bizImageUrl = localStorage.setItem(biz.image_url, JSON.stringify(biz.image_url));
			let getBizImageUrl = localStorage.getItem(biz.image_url);
			let imageUrl = JSON.parse(getBizImageUrl);
			let bizUrl = localStorage.setItem(biz.url, JSON.stringify(biz.url));
			let getBizUrl = localStorage.getItem(biz.url);
			let url = JSON.parse(getBizUrl);
			let bizPrice = localStorage.setItem(biz.price, JSON.stringify(biz.price));
			let getBizPrice = localStorage.getItem(biz.price);
			let price = JSON.parse(getBizPrice);
			let bizRating = localStorage.setItem(biz.rating, JSON.stringify(biz.rating));
			let getBizRating = localStorage.getItem(biz.rating);
			let rating = JSON.parse(getBizRating);*/

			localStorage.name = biz.name;
			localStorage.url = biz.url;
			localStorage.imageUrl = biz.image_url;
			localStorage.price = biz.price;
			localStorage.rating = biz.rating;


			let htmlDiv = document.createElement("div");
			htmlDiv.setAttribute("class", "html-div");

			let item =

			`<div class="item-box">
				<div class="image" style="display:block">
					<img class="thumb align" src="${localStorage.imageUrl}" />
					<div>
					<button class="review-btn">Get Reviews</button>
					</div>
				</div>
				<div class="item-desc">
					<ul class="item-txt">
						<li><u>Locale</u>: <a id="name-link" href=${localStorage.url}>${localStorage.name}</a></li>
						<li><u>Price</u>: ${localStorage.price}</li>
						<li><u>Rating</u>: ${localStorage.rating}</li>
					</ul>
				</div>
				<div id="going">
					<p class="counter"><span class="count">yes/no</span></p>
				</div>

			</div>
			<div id="review-box">
			<div class="reviews">
				<div class="review-head">
					<h4>Reviews</h4>
				</div>
				<div>
					<p class="review-item">Unable to retrieve reviews. Click on restaurant name to go directly to review page.</p>
				</div>
			</div>
		</div>`;

			localStorage.item = item

			htmlDiv.innerHTML = localStorage.item;
			listContainer.append(htmlDiv);

		});

		if(document.getElementsByClassName("count")) {
			console.log("count coll ", document.getElementsByClassName("count"));
			let count = document.getElementsByClassName("count");
					
			Array.prototype.forEach.call(count, function(ct, index) {
				let num = Number(ct.innerText);
				num = 0;
				ct.addEventListener("click", (e) => {
					$.get("/user-data", (userData)=> {

						if(userData) {
							console.log("checking for userData");
							let info = data.businesses[index].name;
						
							if(num === 0){
								$.post(`/user-add/${info}`, (response) => {
									console.log("response from user-add ", response);

									num += 1;
									ct.innerText = num;
									alert(`you have added ${info}`);
								});
								
							}else{
								$.post(`/user-remove/${info}`, (response) => {
									console.log("response from user-remove ", response);

									num -= 1;
									ct.innerText = num;
									alert(`You have removed ${info}`);
								});
								
							}
						}else{
							alert("You must be logged in to access this feature.");
						}
					});
				});
				
			});
		}


		if(document.getElementsByClassName("review-btn")) {
			let element = document.getElementsByClassName("review-btn");

			//element is a collection not Array. Assocciate "this" with each individual "el" element.
			Array.prototype.forEach.call(element, function(el, index) {
				el.addEventListener("click", (e) => {

					revArray.length = [];
					if(document.getElementsByClassName("reviews")[index].style.display === "table") {
						document.getElementsByClassName("reviews")[index].style.display = "none";
					}else {

						let id = data.businesses[index].id || data.businesses[index].locId;
						let loc = removeDiacritics(id);
						console.log("test id ", id);

						$.get(`/business/reviews/${loc}`, (reviewResults) => {

							//let reviewResults = JSON.parse(reviewResponse);
							console.log("reviewResults ", reviewResults);
							revArray.push(reviewResults);
							console.log("revArray ", revArray);

							document.getElementsByClassName("reviews")[index].style.display = "table";
							let doc = document.getElementsByClassName("review-item");

							if(revArray[0].reviews){
								doc[index].innerText = revArray[0].reviews[0].text;
							}else {
								doc[index].innerText = revArray[0].text;
							}

						});
						
					}
				});
			});
		}
	};

}