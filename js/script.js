const todos = []; // variabel berisi array yang akan menampung beberapa object. Object ini berisikan data-data Todo user. 
const RENDER_EVENT = 'render-todo'; // Custom event ini digunakan sebagai patokan dasar ketika ada perubahan data pada variabel todos, seperti perpindahan todo (dari incomplete menjadi complete, dan sebaliknya), menambah todo, maupun menghapus todo. 


document.addEventListener('DOMContentLoaded', function () { // "DOMContentLoaded" dibangkitkan  ketika semua elemen HTML sudah dimuat menjadi DOM dengan baik.
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault(); // menyimpan data tetap ada saat browser dimuat ulang
      addTodo();
    });
    if (isStorageExist()) {
      loadDataFromStorage();
    }
});


function addTodo() {
    const textTodo = document.getElementById('title').value; // mengambil value dari elemen pada id 'title'
    const timestamp = document.getElementById('date').value; // mengambil value dari elemen pada id 'date'
   
    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false); // membuat sebuah object dari todo untuk membuat object baru yang disimpan pada array todos menggunakan metode push().
    todos.push(todoObject);
    /* bentuk object dari todo
    {
    id: "string",
    textTodo: "string",
    timestamp: "string",
    isCompleted: "boolean"
    } */
   
    document.dispatchEvent(new Event(RENDER_EVENT));  // Custom event ini akan  diterapkan untuk me-render data yang telah disimpan pada array todos.
    saveData();
}

function generateId() { // berfungsi untuk menghasilkan identitas unik pada setiap item todo
    return +new Date(); // Untuk menghasilkan identitas yang unik, kita manfaatkan +new Date() untuk mendapatkan timestamp pada JavaScript.
}
   
function generateTodoObject(id, task, timestamp, isCompleted) { // berfungsi untuk membuat object baru dari data yang sudah disediakan dari inputan (parameter function), diantaranya id, nama todo (task), waktu (timestamp), dan isCompleted (penanda todo apakah sudah selesai atau belum).
    return {
      id,
      task,
      timestamp,
      isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('todos'); // mengambil element 'todos'
    uncompletedTODOList.innerHTML = ''; // untuk memastikan agar container dari uncompletedTodoList bersih sebelum diperbarui, maka kita perlu membersihkannya dengan memanggil property innerHTML = ' '. Sehingga dengan mengatur property tersebut, tidak terjadi duplikasi data ketika menambahkan elemen DOM yang baru dengan append().
   

    const completedTODOList = document.getElementById('completed-todos'); // mengambil element id bernama 'completed-todos'
    completedTODOList.innerHTML = ''; // untuk memastikan agar container dari completedTodoList bersih sebelum diperbarui, maka kita perlu membersihkannya dengan memanggil property innerHTML = ' '. Sehingga dengan mengatur property tersebut, tidak terjadi duplikasi data ketika menambahkan elemen DOM yang baru dengan append().
   

    for (const todoItem of todos) {
      const todoElement = makeTodo(todoItem); // Setiap iterasi yang dilakukan akan membuat satu elemen DOM
      if (!todoItem.isCompleted) { // jika todo 'belum completed' dimasukkan kedalam list "uncompletedTODOList"
        uncompletedTODOList.append(todoElement); 
      }    
      else
      completedTODOList.append(todoElement); // jika todo 'completed' dimasukkan kedalam list "completedTODOList"
    }
});


function makeTodo(todoObject) {
    const textTitle = document.createElement('h2'); // membuat element 'h2'
    textTitle.innerText = todoObject.task; // mengisi element 'h2' dengan 'task' yang ada pada object todo
   
    const textTimestamp = document.createElement('p'); // membuat element 'p'
    textTimestamp.innerText = todoObject.timestamp; // mengisi element 'p' dengan 'timestamp' yang ada pada object todo
   
    const textContainer = document.createElement('div'); // membuat element 'div'
    textContainer.classList.add('inner'); // menambahkan class "inner" pada "textContainer"
    textContainer.append(textTitle, textTimestamp); // memasukkan 'textTitle' dan 'textTimestamp' kedalam "textContainer"
   
    const container = document.createElement('div'); // membuat element 'div'
    container.classList.add('item', 'shadow'); // menambahkan kelas 'item' dan 'shadow'
    container.append(textContainer); // memasukkan 'textContainer'  kedalam "container"
    container.setAttribute('id', `todo-${todoObject.id}`); // membuat atribut 'id' diisi dengan "todoObject.id"
   
    if (todoObject.isCompleted) {
        const undoButton = document.createElement('button'); // membuat elemet 'button'
        undoButton.classList.add('undo-button'); // menambahkan class 'undo-button'
     
        undoButton.addEventListener('click', function () { // event onClick pada undobutton
          undoTaskFromCompleted(todoObject.id);
        });
     
        const trashButton = document.createElement('button'); // membuat elemet 'button'
        trashButton.classList.add('trash-button'); // menambahkan class 'trash-button'
     
        trashButton.addEventListener('click', function () { // event onClick
          removeTaskFromCompleted(todoObject.id);
        });
     
        container.append(undoButton, trashButton); // menambahkan 'undoButton' dan 'trashButton' ke dalam "container"
      } else {
        const checkButton = document.createElement('button'); // membuat element 'button'
        checkButton.classList.add('check-button'); // menambahkan class 'check-button'
        
        checkButton.addEventListener('click', function () { // event onClick
          addTaskToCompleted(todoObject.id);
        });
        
        container.append(checkButton); // memasukkan 'checkButton' ke dalam "container"
    }

    return container;
}

function addTaskToCompleted (todoId) { // menginisiasi function "addTaskToCompleted"
    const todoTarget = findTodo(todoId); // mencari 'todo' berdasarkan 'id'
   
    if (todoTarget == null) return;
   
    todoTarget.isCompleted = true; // mengubah state boolean dari false menjadi true apabila terpenuhi
    document.dispatchEvent(new Event(RENDER_EVENT)); // memanggil custom event untuk memperbarui data
    saveData();
}

function findTodo(todoId) { // menginisiasi function "findTodo"
    for (const todoItem of todos) {
      if (todoItem.id === todoId) {
        return todoItem;
      }
    }
    return null;
}

function removeTaskFromCompleted(todoId) { // menginisiasi function "removeTaskFromCompleted"
    const todoTarget = findTodoIndex(todoId); // menghapus Todo berdasarkan index yang didapatkan dari pencarian Todo dengan menggunakan findTodoIndex()
   
    if (todoTarget === -1) return;
   
    todos.splice(todoTarget, 1); // Apabila pencarian berhasil, maka akan menghapus todo tersebut menggunakan fungsi splice() yang disediakan oleh JavaScript.
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
   
   
function undoTaskFromCompleted(todoId) { // menginisiasi function "undoTaskFromCompleted"
    const todoTarget = findTodo(todoId);
   
    if (todoTarget == null) return;

    todoTarget.isCompleted = false; // mengembalikan state isCompleted pada object menjadi 'false'
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findTodoIndex(todoId) { // menginisiasi function "findTodoIndex"
    for (const index in todos) {
      if (todos[index].id === todoId) {
        return index;
      }
    }
   
    return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';
 
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}