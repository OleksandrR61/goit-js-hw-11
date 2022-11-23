import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from "lodash.throttle";


let page = null;
let totalPage = null;
let query = null;
let lightBox = null;
let scrollEvent = false;

let galleryRef = getElement(".gallery");

getElement("#search-form").addEventListener("submit", onSearch);
document.addEventListener("scroll", throttle(onScroll, 500));

function getElement(selector) {
    return document.querySelector(selector);
}

function onSearch(event) {
    event.preventDefault();

    clearCallery();
    query = event.srcElement.searchQuery.value.trim();
    page = 1;

    if (!query) {
        Notify.info("You have entered an empty search string.");
        return;
    }
    
    fetchPics();
}

function clearCallery() {
    scrollEvent = false;
    galleryRef.innerHTML = "";
}

async function fetchPics() {
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
        let isNewSearch = page === 1;

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
            Notify.success(`Hooray! We found ${response.data.totalHits < 500 ? response.data.totalHits : "over 500"} images.`);
        }

        renderGallery(response.data.hits);
    } catch (error) {
        Notify.failure(error.message);
    };
}

function renderGallery(data) {
    let markup = "";
    if (data.length) {
        data.map(({largeImageURL, webformatURL, tags, likes, views, comments, downloads}) => {
            markup += `<a href="${largeImageURL}" class="photo-card gallery__item">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" class="gallery__image" />
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
    galleryRef.insertAdjacentHTML("beforeend", markup);
    
    addLightBox();

    scrollEvent = true;

    if (page > 1) {
        scrollToNextPage();
    }
}

function addLightBox() {
    if (!lightBox) {
        lightBox = new SimpleLightbox('.gallery a', { captionsData: "alt", captionDelay: 500 });
    } else {
        lightBox.refresh();
    }
}

function scrollToNextPage() {
    let { height: cardHeight } = getElement(".gallery").firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

function onScroll() {
    let {scrollTop, clientHeight, scrollHeight} = document.documentElement;
    
    if (scrollEvent && scrollTop + clientHeight >= scrollHeight) {
        onLoadMore();
    }
}

function onLoadMore() {
    page += 1;

    if (page > totalPage) {
        scrollEvent = false;
        Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }
    
    fetchPics();
}