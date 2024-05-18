// Ambil data buku dari localStorage jika ada, jika tidak, set data buku sebagai array kosong
const books = JSON.parse(localStorage.getItem("books")) || [];

// Event yang dipancarkan ketika perlu merender ulang daftar buku
const RENDER_EVENT = "render-book";

// Event listener yang dipanggil ketika halaman selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Menambahkan event listener pada form submit
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Menghentikan perilaku bawaan form submit
    addBook(); // Panggil fungsi untuk menambahkan buku
  });
  // Event listener untuk merender buku setelah DOM selesai dimuat
  document.addEventListener(RENDER_EVENT, function () {
    renderBooks(); // Panggil fungsi untuk merender buku
  });
  renderBooks(); // Panggil fungsi untuk merender buku saat DOM selesai dimuat
});

// Fungsi untuk menambahkan buku baru
function addBook() {
  // Mengambil nilai input dari form
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const statusInput = document.getElementById("status");
  const yearInput = document.getElementById("year");

  // Mengambil nilai input dan memasukkannya ke dalam variabel
  const title = titleInput.value;
  const author = authorInput.value;
  const status = statusInput.value;
  const year = parseInt(yearInput.value, 10);

  // Validasi tahun harus berupa angka positif
  if (!/^\d+$/.test(year)) {
    alert("Tahun harus berupa angka positif");
    return;
  }

  // Objek buku baru
  const bookObject = {
    id: generateId(), // ID buku yang dihasilkan
    title, // Judul buku
    author, // Penulis buku
    status, // Status buku (selesai/belum selesai)
    year, // Tahun terbit buku
  };

  // Menambahkan buku baru ke dalam array books
  books.push(bookObject);
  saveToLocalStorage(); // Menyimpan data buku ke dalam localStorage
  document.dispatchEvent(new Event(RENDER_EVENT)); // Memancarkan event untuk merender ulang buku

  // Mengosongkan form setelah buku ditambahkan
  titleInput.value = "";
  authorInput.value = "";
  statusInput.value = "unfinished";
  yearInput.value = "";
}

// Fungsi untuk menghasilkan ID unik berdasarkan timestamp
function generateId() {
  return +new Date();
}

// Fungsi untuk membuat tampilan buku dalam DOM
function makeBook(bookObject) {
  // Membuat elemen-elemen untuk judul, penulis, dan tahun buku
  const titleElement = document.createElement("h2");
  titleElement.innerText = bookObject.title;

  const authorElement = document.createElement("p");
  authorElement.innerText = `Penulis: ${bookObject.author}`;

  const yearElement = document.createElement("p");
  yearElement.innerText = `Tahun: ${bookObject.year}`;

  // Membuat struktur DOM untuk buku
  const innerContainer = document.createElement("div");
  innerContainer.classList.add("inner");
  innerContainer.append(titleElement, authorElement, yearElement);

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book", "shadow");
  bookContainer.append(innerContainer);

  // Menambahkan tombol sesuai status buku
  if (bookObject.status === "unfinished") {
    const moveToFinishedButton = createButton(
      "Selesai dibaca",
      "finished",
      bookObject.id
    );
    const deleteButton = createButton("Hapus", "delete", bookObject.id);
    bookContainer.append(moveToFinishedButton, deleteButton);
  } else {
    const moveToUnfinishedButton = createButton(
      "Belum Selesai dibaca",
      "unfinished",
      bookObject.id
    );
    const deleteButton = createButton("Hapus", "delete", bookObject.id);
    bookContainer.append(moveToUnfinishedButton, deleteButton);
  }
  return bookContainer;
}

// Fungsi untuk membuat tombol
function createButton(label, status, bookId) {
  const button = document.createElement("button");
  button.innerText = label;
  button.addEventListener("click", function () {
    handleButtonClicked(status, bookId);
  });
  return button;
}

// Fungsi untuk merender daftar buku dalam DOM
function renderBooks() {
  const unfinishedShelf = document.getElementById("unfinished-shelf");
  const finishedShelf = document.getElementById("finished-shelf");

  // Mengosongkan rak buku sebelum merender ulang
  unfinishedShelf.innerHTML = "";
  finishedShelf.innerHTML = "";

  // Menggunakan loop untuk merender setiap buku
  for (const bookObject of books) {
    const bookElement = makeBook(bookObject);

    // Memasukkan buku ke dalam rak yang sesuai berdasarkan statusnya
    if (bookObject.status === "unfinished") {
      unfinishedShelf.append(bookElement);
    } else {
      finishedShelf.append(bookElement);
    }
  }
}

// Fungsi untuk menangani aksi tombol yang diklik
function handleButtonClicked(status, bookId) {
  const bookIndex = findBookIndex(bookId);

  // Jika buku tidak ditemukan, keluar dari fungsi
  if (bookIndex === -1) return;

  const bookToMove = books[bookIndex];

  // Memindahkan status buku atau menghapus buku berdasarkan aksi tombol yang diklik
  if (status === "unfinished" && bookToMove.status === "finished") {
    bookToMove.status = "unfinished";
  } else if (status === "finished" && bookToMove.status === "unfinished") {
    bookToMove.status = "finished";
  } else if (status === "delete") {
    books.splice(bookIndex, 1);
  }

  saveToLocalStorage(); // Menyimpan perubahan ke dalam localStorage
  document.dispatchEvent(new Event(RENDER_EVENT)); // Memancarkan event untuk merender ulang buku
}

// Fungsi untuk mencari index buku berdasarkan ID
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1; // Mengembalikan -1 jika buku tidak ditemukan
}

// Fungsi untuk menyimpan data buku ke dalam localStorage
function saveToLocalStorage() {
  localStorage.setItem("books", JSON.stringify(books));
}
