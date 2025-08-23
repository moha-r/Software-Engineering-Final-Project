// home.js
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');

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

  return bookCard;
}

// Helper function to fetch Google Books data
async function fetchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      let price = null;
      let currency = null;
      if (
        item.saleInfo &&
        item.saleInfo.listPrice &&
        typeof item.saleInfo.listPrice.amount === "number"
      ) {
        price = item.saleInfo.listPrice.amount;
        currency = item.saleInfo.listPrice.currencyCode || "USD";
      }
      return {
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        thumbnail:
          item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail
            ? item.volumeInfo.imageLinks.thumbnail
            : "",
        id: item.id,
        price: price,
        currency: currency,
        infoLink: item.volumeInfo.infoLink,
        previewLink: item.volumeInfo.previewLink || null,
        platform: "Google Books",
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Helper function to fetch eBay price for a book (by title)
async function fetchEbayPrice(query) {
  // eBay Finding API via RapidAPI or public CORS proxy (for demo, use rapidapi-mock or skip API key)
  // NOTE: For real use, replace 'YOUR_RAPIDAPI_KEY' with a real key.
  const url = `https://api.bayut.com/v1/listings/search?q=${encodeURIComponent(query)}`; // Dummy endpoint for placeholder
  // Instead, use eBay public Finding API via RapidAPI (mocked here, as eBay API requires key)
  // We'll use a CORS proxy and the eBay Finding API endpoint for demonstration.
  // For demo, fallback to a fake price
  try {
    // Example using RapidAPI (replace with real API key):
    // const response = await fetch(`https://ebay-data-scraper.p.rapidapi.com/products/search?query=${encodeURIComponent(query)}`, {
    //   headers: {
    //     "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    //     "X-RapidAPI-Host": "ebay-data-scraper.p.rapidapi.com"
    //   }
    // });
    // const data = await response.json();
    // if (data.success && data.data && data.data.length > 0) {
    //   const first = data.data[0];
    //   return {
    //     title: first.title,
    //     price: parseFloat(first.price.replace(/[^\d.]/g, "")),
    //     currency: first.currency || "USD",
    //     thumbnail: first.image,
    //     link: first.url,
    //     platform: "eBay"
    //   }
    // }
    // Simulate eBay result for demo:
    return {
      title: query,
      price: (Math.random() * 20 + 5).toFixed(2),
      currency: "USD",
      thumbnail: "",
      link: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`,
      platform: "eBay"
    };
  } catch (e) {
    return null;
  }
}

// Helper function to fetch Amazon price for a book (by title)
async function fetchAmazonPrice(query) {
  // Amazon API is not public, but for demo, we'll simulate with a placeholder or use a scraping API if available
  // For demonstration, return a simulated price
  try {
    // If you have access to Amazon Product Advertising API, use that here.
    // For demo, simulate:
    return {
      title: query,
      price: (Math.random() * 25 + 8).toFixed(2),
      currency: "USD",
      thumbnail: "",
      link: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      platform: "Amazon"
    };
  } catch (e) {
    return null;
  }
}

// Comparison function to find the lowest price
function findLowestPrice(sources) {
  let min = null;
  sources.forEach((src) => {
    if (
      src &&
      src.price !== null &&
      src.price !== undefined &&
      !isNaN(Number(src.price))
    ) {
      if (!min || Number(src.price) < Number(min.price)) {
        min = src;
      }
    }
  });
  return min;
}

// Main fetchBooks function integrating all APIs
async function fetchBooks(query) {
  if (!query) {
    searchResultsSection.style.display = "none";
    return;
  }

  searchResultsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; font-size:1.1em;">Loading price comparison...</div>';
  searchResultsSection.style.display = "block";

  // Fetch Google Books (for details)
  const googleBook = await fetchGoogleBooks(query);
  // Fetch eBay and Amazon in parallel
  const [ebay, amazon] = await Promise.all([
    fetchEbayPrice(query),
    fetchAmazonPrice(query),
  ]);

  // Compose sources for comparison
  const sources = [];
  if (googleBook) {
    sources.push({
      ...googleBook,
      price: googleBook.price !== null ? googleBook.price : null,
      link: googleBook.infoLink,
      platform: "Google Books",
      thumbnail: googleBook.thumbnail,
      previewLink: googleBook.previewLink || null,
    });
  }
  if (amazon) {
    sources.push({
      ...amazon,
      price: amazon.price !== null ? amazon.price : null,
      link: amazon.link,
      platform: "Amazon",
      thumbnail: amazon.thumbnail,
    });
  }
  if (ebay) {
    sources.push({
      ...ebay,
      price: ebay.price !== null ? ebay.price : null,
      link: ebay.link,
      platform: "eBay",
      thumbnail: ebay.thumbnail,
    });
  }

  // Find the lowest price source
  const lowest = findLowestPrice(sources);

  // Build the result card
  searchResultsGrid.innerHTML = ""; // clear loading
  if (!googleBook) {
    searchResultsGrid.innerHTML = "<p>No books found.</p>";
    return;
  }

  // Compose the card
  const card = document.createElement("div");
  card.className = "book-card";
  card.style.width = "100%";
  card.style.maxWidth = "400px";
  card.style.margin = "auto";

  // Book cover
  const coverDiv = document.createElement("div");
  coverDiv.className = "book-cover";
  if (googleBook.thumbnail) {
    const img = document.createElement("img");
    img.src = googleBook.thumbnail;
    img.alt = googleBook.title;
    img.style.width = "100%";
    img.style.height = "auto";
    coverDiv.appendChild(img);
  } else {
    coverDiv.textContent = "No Image";
    coverDiv.style.display = "flex";
    coverDiv.style.alignItems = "center";
    coverDiv.style.justifyContent = "center";
    coverDiv.style.backgroundColor = "#ccc";
    coverDiv.style.height = "150px";
    coverDiv.style.color = "#666";
  }
  card.appendChild(coverDiv);

  // Book info
  const infoDiv = document.createElement("div");
  infoDiv.className = "book-info";
  const title = document.createElement("h3");
  title.textContent = googleBook.title || "No Title";
  infoDiv.appendChild(title);
  const authors = document.createElement("p");
  authors.textContent = googleBook.authors
    ? googleBook.authors.join(", ")
    : "Unknown Author";
  infoDiv.appendChild(authors);

  // Price comparison table
  // Add a heading
  const tableHeading = document.createElement("div");
  tableHeading.textContent = "Price Comparison";
  tableHeading.style.fontWeight = "bold";
  tableHeading.style.marginTop = "10px";
  tableHeading.style.marginBottom = "4px";
  infoDiv.appendChild(tableHeading);

  const priceTable = document.createElement("table");
  priceTable.style.width = "100%";
  priceTable.style.marginTop = "2px";
  priceTable.style.borderCollapse = "collapse";
  priceTable.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;padding:4px 8px;">Platform</th>
        <th style="text-align:left;padding:4px 8px;">Price</th>
        <th style="text-align:left;padding:4px 8px;">Buy Link</th>
      </tr>
    </thead>
    <tbody>
      ${sources
        .map(
          (src) => `
        <tr style="${
          lowest && src.platform === lowest.platform
            ? "background: #e8fefb; font-weight:bold;"
            : ""
        }">
          <td style="padding:4px 8px;">${src.platform}</td>
          <td style="padding:4px 8px;">
            ${src.price !== null && src.price !== undefined
              ? src.price + " " + (src.currency || "USD")
              : "N/A"}
            ${
              lowest && src.platform === lowest.platform
                ? '<span style="color:#27ae60;font-size:0.95em;"> (Lowest)</span>'
                : ""
            }
          </td>
          <td style="padding:4px 8px;">
            <a href="book-details.html?id=${encodeURIComponent(googleBook.id)}" style="color: #4ba3a6; text-decoration: underline;">View Details</a>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
  infoDiv.appendChild(priceTable);

  // Highlight lowest price
  if (lowest && lowest.price !== null) {
    const bestDeal = document.createElement("div");
    bestDeal.style.marginTop = "10px";
    bestDeal.style.fontWeight = "bold";
    bestDeal.style.color = "#27ae60";
    bestDeal.textContent =
      "Best Price: " +
      lowest.price +
      " " +
      (lowest.currency || "USD") +
      " on " +
      lowest.platform;
    infoDiv.appendChild(bestDeal);
  }

  // Make the whole card clickable to go to book-details with ID
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    window.location.href = `book-details.html?id=${encodeURIComponent(googleBook.id)}`;
  });

  card.appendChild(infoDiv);
  searchResultsGrid.appendChild(card);
}

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  fetchBooks(query);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    fetchBooks(query);
  }
});

