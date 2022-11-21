import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

getElement("#search-form").addEventListener("submit", onSearch);

function getElement(selector) {
    return document.querySelector(selector);
}

function onSearch(event) {
    event.preventDefault();
    let img = [];

    try {
        fetchPics(event.srcElement.searchQuery.value.trim());
    } catch (error) {
        Notify.failure(error.message);
    }        
}

async function fetchPics(str) {
    let images = [];
    renderGallery(images);

    if (!str) {
        Notify.info("You have entered an empty search string.");
        return;
    }

    const searchParams = new URLSearchParams({
        key: "31500744-82fe9083580524fe3bc41bb93",
        q: str,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true
    }).toString();

    try {
        Loading.hourglass();
        let response = await axios.get(`https://pixabay.com/api/?${searchParams}`);
        Loading.remove();

        if (response.data.hits.length === 0) {
            throw new Error("Sorry, there are no images matching your search query. Please try again.")
        }

        images = response.data.hits;
    } catch (error) {
        Notify.failure(error.message);
    }

    renderGallery(images);
}

function renderGallery(data) {
    console.log(data);
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
}