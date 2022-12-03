const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')


// 渲染出電影資料
function renderMovieList(data) {
  let rawHTML = ''
  // 把陣列裡的物件一個一個拉出來
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" 
              data-bs-target="#movie-modal" data-id="${item.id}"">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div> 
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}


// 將更多電影資訊監聽器點擊到的資訊填入彈跳視窗中
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-data')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 用得到的id去呼叫詳細點影資料的API
  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch(error => { console.log(error) })
}

// 移除我的最愛清單
function removeFromFavorite(id) {
  // 當是空陣列時，會呈現( false || true )
  // 當是falsy時，會呈現( true || error )，此狀態會以左邊狀態為優先，所以結果是true
  // 只要有以上任一狀態，就會進入if然後return，不再進行後面的程式
  if (!favoriteMovies || !favoriteMovies.length) return

  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return

  // 刪掉被點擊到項目
  favoriteMovies.splice(movieIndex, 1)
  // 重新存回新的最愛電影清單回localStorage中
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
  // 將修改完的清單重新再渲染一次畫面
  renderMovieList(favoriteMovies)
}


// 點擊「更多電影資訊」或「加入最愛」的監聽器，目的是拿到被點擊者的id，和要執行showMovieModal()或addToFavorite()那個函式
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  }
  else if (event.target.matches('.btn-remove-favorite')) {
    // dataset進來的值是字串，所以要轉成數字才能使用
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(favoriteMovies)