const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
const filteredMovies = []


// 分割電影每頁數量，會回傳一組被切割過的陣列資料
function getMoviesByPage(page) {
  // 第一頁 0 - 11
  // 第二頁 12 - 23
  // 第三頁 24 - 35
  const startIndex = (page - 1) * page
  // slice(index1, index2)
  // slice會取 index1 ~ (index2 -  1) 之間陣列
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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


// 加入我的最愛函式
// localeStorage執行順序？
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  // 假如清單中已有和監聽器點擊到的id一樣內容時，就執行alert，且有return就不會往下執行
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// 點擊「更多電影資訊」或「加入最愛」的監聽器，目的是拿到被點擊者的id，和要執行showMovieModal()或addToFavorite()那個函式
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  }
  else if (event.target.matches('.btn-add-favorite')) {
    // dataset進來的值是字串，所以要轉成數字才能使用
    addToFavorite(Number(event.target.dataset.id))
  }
})


// 渲染分頁器 
function renderPaginator(amount) {
  // 總數量除以每頁數量，並無條件進位，因為餘數也需要一頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}


// 監聽分頁器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果被點擊到的不是a標籤，就結束執行
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})



// 監聽搜尋列
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  // .preventDefault()不讓往瀏覽器做預設的動作
  event.preventDefault()
  // trim()功能為去掉頭尾的空白格
  // toLowerCase()功能為將英文大寫變成小寫
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }

  // 方法一：用for...of將每筆資料拿出來比對，若有包含就push到filteredMovies中
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 方法二：使用filter的方法
  movies.filter(movie => {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  })

  // 提示輸入的關鍵字沒找到使用
  // 程式執行步驟只會執行到return後以下不會再執行，若沒有return則會繼續執行
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  // 再次渲染畫面
  renderMovieList(filteredMovies)
  renderPaginator(filteredMovies.length)
})


// 主程式執行
// 透過API獲取資訊
// 為了使用const定義的變數中放入資料，所以才會用push直這個語法
// 若直接用let可以直接賦值，內容一樣。但用let可能會被改資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
