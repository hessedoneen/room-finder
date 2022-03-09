const clearIcon = document.querySelector(".go-icon");
const searchBar = document.querySelector(".search");

searchBar.addEventListener("keyup", () => {
  if(searchBar.value){
    clearIcon.style.visibility = "visible";
  }
});

clearIcon.addEventListener("click", () => {
  searchBar.value = "";
  clearIcon.style.visibility = "hidden";
})
