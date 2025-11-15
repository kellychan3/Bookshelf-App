const bookList = [];
const STORAGE_KEY = "books";
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";

let searchKeyword = "";
let editingBookId = null;

function isStorageExist() {
  if (typeof Storage == "undefined") {
    Swal.fire('Browser anda tidak mendukung web storage!');
    return false;
  }
  return true;
}

function generateBookId() {
  return Date.now();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function saveBooks() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookList);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = +document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedBookId = generateBookId();
  const bookObject = generateBookObject(
    generatedBookId,
    title,
    author,
    year,
    isComplete,
  );
  bookList.push(bookObject);

  document.getElementById("bookForm").reset();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: 'Buku berhasil ditambahkan',
    timer: 1500,
    showConfirmButton: false
  });
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  textTitle.setAttribute("data-testid", "bookItemTitle");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;
  textYear.setAttribute("data-testid", "bookItemYear");

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-group");

  if (bookObject.isComplete) {
    const incompleteButton = document.createElement("button");
    incompleteButton.classList.add("btn", "btn-complete");
    incompleteButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    incompleteButton.innerHTML = `<i data-feather="rotate-ccw"></i> Belum selesai dibaca`;
    incompleteButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    buttonContainer.append(incompleteButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("btn", "btn-complete");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.innerHTML = `<i data-feather="check-circle"></i> Selesai dibaca`;
    completeButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    buttonContainer.append(completeButton);
  }

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-delete");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerHTML = `<i data-feather="trash-2"></i> Hapus Buku`;
  deleteButton.addEventListener("click", function () {
    deleteBook(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("btn", "btn-edit");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerHTML = `<i data-feather="edit"></i> Edit Buku`;
  editButton.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  buttonContainer.append(deleteButton, editButton);

  const textContainer = document.createElement("div");
  textContainer.classList.add("item-book");
  textContainer.setAttribute("data-bookid", bookObject.id);
  textContainer.setAttribute("data-testid", "bookItem");
  textContainer.append(textTitle, textAuthor, textYear, buttonContainer);

  return textContainer;
}

function loadDataFromStorage() {
  const storageBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (storageBooks !== null) {
    for (const book of storageBooks) {
      bookList.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
  for (const book of bookList) {
    if (book.id == bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookList) {
    if (bookList[index].id == bookId) {
      return index;
    }
  }
  return -1;
}

function addBookToCompleted(bookId) {
  const target = findBook(bookId);
  if (target == null) return;

  target.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
}

function undoBookFromCompleted(bookId) {
  const target = findBook(bookId);
  if (target == null) return;

  target.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
}

function deleteBook(bookId) {
  Swal.fire({
    title: 'Apakah kamu yakin?',
    text: 'Data buku akan dihapus!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      const bookIndex = findBookIndex(bookId);
      if (bookIndex == -1) return;

      bookList.splice(bookIndex, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveBooks();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Buku berhasil dihapus',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

function editBook(bookId) {
  const target = findBook(bookId);
  if (target == null) return;

  document.getElementById("form-title").innerText = "Edit Data Buku";

  document.getElementById("bookFormTitle").value = target.title;
  document.getElementById("bookFormAuthor").value = target.author;
  document.getElementById("bookFormYear").value = target.year;
  document.getElementById("bookFormIsComplete").checked = target.isComplete;

  editingBookId = bookId;
  
  const submitBtn = document.getElementById("bookFormSubmit");
  submitBtn.innerHTML = "Simpan Perubahan";
  submitBtn.classList.add("btn-edit");

  document.getElementById("add-book-section").scrollIntoView({
    behavior: "smooth",
  });
}

function saveEditedBook() {
  const editedBook = findBook(editingBookId);
  if (editedBook == null) return;

  editedBook.title = document.getElementById("bookFormTitle").value;
  editedBook.author = document.getElementById("bookFormAuthor").value;
  editedBook.year = +document.getElementById("bookFormYear").value;
  editedBook.isComplete = document.getElementById("bookFormIsComplete").checked;

  editingBookId = null;

  document.getElementById("form-title").innerText = "Tambah Buku Baru";

  const submitBtn = document.getElementById("bookFormSubmit");
  submitBtn.innerHTML = "Masukkan Buku ke Bookself";
  submitBtn.classList.remove("btn-edit");
  
  document.getElementById("bookForm").reset();

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: 'Buku berhasil diperbarui.',
    timer: 1500,
    showConfirmButton: false
  });

}

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  document.getElementById('bookFormYear').max  = new Date().getFullYear();
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (editingBookId !== null) {
      saveEditedBook();
    } else {
      addBook();
    }
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    searchKeyword = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  for (const book of bookList) {
    if (
      searchKeyword !== "" &&
      !book.title.toLowerCase().includes(searchKeyword)
    ) {
      continue;
    }

    const bookItem = makeBook(book);
    if (!book.isComplete) {
      incompleteBookList.append(bookItem);
    } else {
      completeBookList.append(bookItem);
    }
  }

  feather.replace();
});
