import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

let page = 0;
let query = "";

let btnLoadMoreRef = getElement(".load-more");

clearCallery();
getElement("#search-form").addEventListener("submit", onSearch);
btnLoadMoreRef.addEventListener("click", onLoadMore);

function getElement(selector) {
    return document.querySelector(selector);
}

function onSearch(event) {
    event.preventDefault();
    getElement("[data-submit]").blur();

    try {
        fetchPics(event.srcElement.searchQuery.value.trim(), true);
    } catch (error) {
        Notify.failure(error.message);
    }

    event.currentTarget.reset();        
}

function onLoadMore() {
    btnLoadMoreRef.blur();

    try {
        fetchPics(query, false);
    } catch (error) {
        Notify.failure(error.message);
    }        
}

async function fetchPics(str, isNewSearch) {
    if (isNewSearch) {
        clearCallery("");
        query = str;

        if (!str) {
            Notify.info("You have entered an empty search string.");
            return;
        }
    }

    page += 1;
    showBtnLoadMore(false);

    const searchParams = new URLSearchParams({
        key: "31500744-82fe9083580524fe3bc41bb93",
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page,
        per_page: 40
    }).toString();

    try {
        if (isNewSearch) {
            Loading.hourglass();
        } else {
            Loading.dots();
        }
        let response = await axios.get(`https://pixabay.com/api/?${searchParams}`);
        Loading.remove();

        if (response.data.hits.length === 0) {
            throw new Error("Sorry, there are no images matching your search query. Please try again.")
        }

        renderGallery(response.data.hits);
        showBtnLoadMore(true);
    } catch (error) {
        Notify.failure(error.message);
    };
}

function clearCallery() {
    page = 0;
    renderGallery([]);
    showBtnLoadMore(false);
}

function renderGallery(data) {
    let markup = "";
    if (data.length) {
        data.map(({largeImageURL, webformatURL, tags, likes, views, comments, downloads}) => {
            markup += `<div class="photo-card">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item">
                  <b>${likes} Likes</b>
                </p>
                <p class="info-item">
                  <b>${views} Views</b>
                </p>
                <p class="info-item">
                  <b>${comments} Comments</b>
                </p>
                <p class="info-item">
                  <b>${downloads} Downloads</b>
                </p>
              </div>
            </div>`});        
    }
    getElement(".gallery").innerHTML = markup;
    window.scrollTo(top);
}

function showBtnLoadMore(isShow) {
    btnLoadMoreRef.style.display = isShow ? "block" : "none";
}