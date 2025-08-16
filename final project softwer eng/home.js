// home.js
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

function createBookCard(book) {
  const bookCard = document.createElement('div');
  bookCard.className = 'book-card';

  const bookCover = document.createElement('div');
  bookCover.className = 'book-cover';
  if (book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail) {
    const img = document.createElement('img');
    img.src = book.volumeInfo.imageLinks.thumbnail;
    img.alt = book.volumeInfo.title;
    img.style.width = '100%';
    img.style.height = 'auto';
    bookCover.appendChild(img);
  } else {
    bookCover.textContent = 'No Image';
    bookCover.style.display = 'flex';
    bookCover.style.alignItems = 'center';
    bookCover.style.justifyContent = 'center';
    bookCover.style.backgroundColor = '#ccc';
    bookCover.style.height = '150px';
    bookCover.style.color = '#666';
  }

  const bookInfo = document.createElement('div');
  bookInfo.className = 'book-info';

  const title = document.createElement('h3');
  title.textContent = book.volumeInfo.title || 'No Title';

  const authors = document.createElement('p');
  authors.textContent = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';

  bookInfo.appendChild(title);
  bookInfo.appendChild(authors);

  bookCard.appendChild(bookCover);
  bookCard.appendChild(bookInfo);

  // Wrap the bookCard in a link to book-details.html with the book ID
  const link = document.createElement('a');
  link.href = `book-details.html?id=${encodeURIComponent(book.id)}`;
  link.appendChild(bookCard);

  return link;
}

async function fetchBooks(query = 'fiction', category = '') {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&orderBy=relevance&maxResults=12`;

  // Adjust URL based on category
  switch(category) {
    case 'fiction':
      url = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&printType=books&orderBy=relevance&maxResults=12`;
      break;
    case 'non-fiction':
      url = `https://www.googleapis.com/books/v1/volumes?q=subject:nonfiction&printType=books&orderBy=relevance&maxResults=12`;
      break;
    case 'best-sellers':
      // Use "best seller" query to get most popular books
      url = `https://www.googleapis.com/books/v1/volumes?q=best%20seller&printType=books&orderBy=relevance&maxResults=12`;
      break;
    case 'new-arrivals':
      // Use orderBy=newest to get recent books
      url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&orderBy=newest&maxResults=12`;
      break;
    default:
      // Use the query as is
      url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&orderBy=relevance&maxResults=12`;
      break;
  }

  const containerId = category ? `${category}BooksGrid` : 'booksGrid';
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = 'Loading...';
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Fetched books data for category "${category}":`, data);
    container.innerHTML = '';
    if (data.items && data.items.length > 0) {
      data.items.forEach(book => {
        container.appendChild(createBookCard(book));
      });
    } else {
      container.textContent = 'No books found.';
    }
  } catch (error) {
    container.textContent = 'Error loading books.';
    console.error('Error fetching books:', error);
  }
}

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchBooks(query);
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      fetchBooks(query);
    }
  }
});

// Function to show only the selected category section and hide others
function showCategorySection(category) {
  const categories = ['fiction', 'non-fiction', 'best-sellers', 'new-arrivals'];
  categories.forEach(cat => {
    const section = document.getElementById(`${cat}Section`);
    if (section) {
      section.style.display = (cat === category) ? 'block' : 'none';
    }
  });
  // Also hide main search grid when category section is shown
  const mainGridSection = document.getElementById('mainGridSection');
  if (mainGridSection) {
    mainGridSection.style.display = category ? 'none' : 'block';
  }
}

// Add event listeners to sidebar links for categories
const sidebarLinks = document.querySelectorAll('.sidebar a');
sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const category = link.getAttribute('data-category');
    if (category && ['fiction', 'non-fiction', 'best-sellers', 'new-arrivals'].includes(category)) {
      showCategorySection(category);
      fetchBooks('', category);
    } else {
      // If no category or category is not one of the book categories, show main grid
      showCategorySection('');
    }
  });
});

// Initial load for main search grid
fetchBooks();

// Initial load for category sections
fetchBooks('', 'fiction');
fetchBooks('', 'non-fiction');
fetchBooks('', 'best-sellers');
fetchBooks('', 'new-arrivals');

// Initially show main grid and hide category sections
showCategorySection('');