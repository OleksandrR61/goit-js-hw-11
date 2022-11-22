import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

let page = 1;
let totalPage = 1;
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
    
    try {
        fetchPics(event.srcElement.searchQuery.value.trim(), true);
    } catch (error) {
        Notify.failure(error.message);
    }
}

function onLoadMore() {
    page += 1;

    if (page > totalPage) {
        showBtnLoadMore(false);
        Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }
    
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

        if (isNewSearch) {
            totalPage = Math.ceil(response.data.totalHits / 40);
            Notify.info(`Hooray! We found ${response.data.totalHits} images.`);
        }

        renderGallery(response.data.hits);
        showBtnLoadMore(true);
    } catch (error) {
        Notify.failure(error.message);
    };
}

function clearCallery() {
    page = 1;
    renderGallery([]);
    showBtnLoadMore(false);
}

function renderGallery(data) {
    let markup = "";
    if (data.length) {
        data.map(({largeImageURL, webformatURL, tags, likes, views, comments, downloads}) => {
            markup += `<a href="${largeImageURL}" class="photo-card">
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
            </a>`});        
    }
    getElement(".gallery").innerHTML = markup;
    window.scrollTo(top);
}

function showBtnLoadMore(isShow) {
    btnLoadMoreRef.style.display = isShow ? "block" : "none";
}