import './sass/index.scss';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//axios.defaults.baseURL = 'https://pixabay.com/api/';

let simpleLightbox = new SimpleLightbox('.gallery a');

const Notiflix = require('notiflix');
const axios = require('axios');

const input = document.querySelector('.search-form');

const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

const infoitem = document.querySelector('.info-item');

const basicURL =
  'https://pixabay.com/api/?key=35246329-add22568f1c638791398d2d1c';
const filters =
  '&image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

let currentHits = 0;
let page = 1;
let currentPage = 1;
const perPage = 40;
let search = '';

//submit handler

function sHandler(ev) {
  page = 1;
  ev.preventDefault();
  clearGallery();

  search = ev.currentTarget.searchQuery.value.trim();

  if (search === '') {
    Notiflix.Notify.info('Oops...Nothing entered, please try again.');
    return;
  }

  // get function in action

  fetchImages(search, currentPage)
    .then(currentHits => {
      if (currentHits.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtn.classList.add('is-hidden');
      } else {
        renderCard(currentHits.hits);
        simpleLightbox.refresh();
        Notiflix.Notify.success(
          `Hooray! We found ${currentHits.totalHits} images.`
        );
      }
      if (currentHits.totalHits > perPage) {
        loadMoreBtn.classList.remove('is-hidden');
      }
    })

    .catch(error => console.log(error));
}

// gallery creation

function renderCard(a) {
  const markup = a
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card"><a class="photo-link" href="${largeImageURL}">
      <img class="photo-image"src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
      <div class="info">
      <p class="info-item"> <b>Likes</b> <span class="info-item--api">${likes}</span></p>
      </span><p class="info-item"> <b>Views</b> <span class="info-item--api">${views}</span></p>
      <p class="info-item"> <b>Comments</b> <span class="info-item--api">${comments} </span></p>
      <p class="info-item"> <b>Downloads</b> <span class="info-item--api">${downloads}</span></p>
      </div>
      </div>`;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

// more pages handler

loadMoreBtn.addEventListener('click', mHandler);

async function mHandler() {
  currentPage += 1;
  const response = await fetchImages(search, currentPage);
  renderCard(response.hits);
  currentHits += response.hits.length;

  simpleLightbox.refresh();
  if ((currentPage - 1) * 40 + currentHits === response.totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// new search = no previous gallery

function clearGallery() {
  gallery.innerHTML = '';
  page = 1;
  currentPage = 1;
  loadMoreBtn.classList.add('is-hidden');
  infoitem.classList.add('is-hidden');
}

async function fetchImages(search, page) {
  try {
    const response = await axios.get(
      `${basicURL}&q=${search}${filters}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

input.addEventListener('submit', sHandler);
