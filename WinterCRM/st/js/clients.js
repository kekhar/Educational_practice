function formatClientCount(count) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return count + " клиент";
  } else if (
    2 <= count % 10 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return count + " клиента";
  } else {
    return count + " клиентов";
  }
}

function openModal() {
  modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function closeModal() {
  modal = document.getElementById("myModal");
  modal.style.display = "none";
}
var currentClientId = 0
function openModal2(id) {
  currentClientId = id
  fetch(`/get_client?ID=`+id, {
    method: "GET"
  })
    .then((response) => response.json())
    .then((data) => {
        document.getElementById('ChangeClientFIO').value = data['FIO']
        document.getElementById('ChangeClientPhoneNumber').value = data['PhoneNumber']
        document.getElementById('ChangeClientPledge').value = data['Pledge']
        document.getElementById('ChangeClientNumber').value = data['DataDocument']
    })
    .catch((error) => {
      console.error("Ошибка сети: " + error);
      return
    });
  modal = document.getElementById("myModal2");
  modal.style.display = "block";
}

function closeModal2() {
  modal = document.getElementById("myModal2");
  modal.style.display = "none";

}

// Функция для обновления массива rows
function updateRows() {
  rows = Array.from(tbody.querySelectorAll("tr")).slice(1);
  return rows;
}



document
  .getElementById("addItemForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const Fio = event.target.FIO.value;
    const Pledge = event.target.Pledge.value;
    const Passport = event.target.Passport.value;
    const PhoneNumber = event.target.PhoneNumber.value;

    const table = document.querySelector("table");
    const newRow = table.insertRow(table.rows.length);
    const cells = [
      newRow.insertCell(0),
      newRow.insertCell(1),
      newRow.insertCell(2),
      newRow.insertCell(3),
      newRow.insertCell(4),
    ];

    cells[0].classList.add("table-colon");
    cells[1].classList.add("table-colon");
    cells[1].classList.add("table-colon2");
    cells[2].classList.add("table-colon");
    cells[3].classList.add("table-colon");
    cells[4].classList.add("table-colon");

    const button = document.createElement("button");
    button.classList.add("delete-button");
    button.innerText = "Удалить";
    cells[4].appendChild(button);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("select-checkbox");
    cells[4].appendChild(checkbox);

    cells[0].innerText = Fio;
    cells[1].innerText = Pledge;
    cells[2].innerText = Passport;
    cells[3].innerText = PhoneNumber;

    const formData = new FormData();
    formData.append("FIO", Fio);
    formData.append("Passport", Passport);
    formData.append("Pledge", Pledge);
    formData.append("PhoneNumber", PhoneNumber);

    fetch("/add_client", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const newId = data.id;
        button.setAttribute("data-id", newId);
        checkbox.setAttribute("data-id", newId);
        newRow.setAttribute("data-id", newId);

        const clientsCountElement = document.getElementById("clientsCount");
        const currentCount = parseInt(clientsCountElement.textContent, 10) + 1;
        clientsCountElement.textContent = formatClientCount(currentCount);
        location.reload();
      })
      .catch((error) => {
        console.error("Ошибка при отправке запроса:", error);
      });

    event.target.reset();
  });

var modal = document.getElementById("myModal");

var closeModalBtn = document.getElementById("closeModalBtn");


closeModalBtn.addEventListener("click", closeModal);

var modalButtons = document.getElementsByClassName("mdlbutton");

for (var i = 0; i < modalButtons.length; i++) {
    modalButtons[i].addEventListener("click", openModal);
}

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Назначить обработчик события на родительский элемент, который существует на момент загрузки страницы
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button")) {
    const button = event.target;
    const objectId = button.getAttribute("data-id");

    fetch(`/del_client`, {
      method: "DELETE",
      body: JSON.stringify({ id: objectId }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          button.closest("tr").remove();

          // Обновить счетчик клиентов
          const clientsCountElement = document.getElementById("clientsCount");
          const currentCount =
            parseInt(clientsCountElement.textContent, 10) - 1;
          clientsCountElement.textContent = formatClientCount(currentCount);
          updateRows();
        } else {
          console.error("Ошибка удаления объекта.");
        }
      })
      .catch((error) => {
        console.error("Ошибка сети: " + error);
      });
  }
});



document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "deleteSelected") {
    const selectedCheckboxes = document.querySelectorAll(
      ".select-checkbox:checked"
    );

    if (selectedCheckboxes.length > 0) {
      const idsToDelete = Array.from(selectedCheckboxes).map((checkbox) =>
        checkbox.getAttribute("data-id")
      );

      // Отправка запроса на сервер для удаления выбранных объектов
      fetch("/del_selected_clients", {
        method: "POST",
        body: JSON.stringify({ ids: idsToDelete }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Успешно удалено, обновите интерфейс
            idsToDelete.forEach((id) => {
              const rowToDelete = document.querySelector(`tr[data-id="${id}"]`);
              console.log(rowToDelete);
              if (rowToDelete) {
                rowToDelete.remove();
              }
              updateRows();
            });

            const clientsCountElement = document.getElementById("clientsCount");
            const currentCount =
              parseInt(clientsCountElement.textContent, 10) -
              idsToDelete.length;
            clientsCountElement.textContent = formatClientCount(currentCount);
          } else {
            console.error("Ошибка удаления объектов.");
          }
        })
        .catch((error) => {
          console.error("Ошибка сети: " + error);
        });
    } else {
      console.log("Нет выбранных объектов для удаления.");
    }
  }
});
document
  .getElementById("ChangeItemForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const ID = currentClientId
    const Fio = event.target.FIO.value;
    const Pledge = event.target.Pledge.value;
    const Passport = event.target.Passport.value;
    const PhoneNumber = event.target.PhoneNumber.value;
    fetch("/update_old_client", {
      method: "POST",
      body: JSON.stringify({ id: ID,FIO:Fio,Pledge:Pledge, DataDocument:Passport,PhoneNumber:PhoneNumber }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        location.reload()
      })
      .catch((error) => {
        console.error("Ошибка сети: " + error);
      });
  });
document
  .querySelector(".clients__search-input")
  .addEventListener("input", function () {
    var searchInput = this.value.toLowerCase();
    var rows = document.querySelectorAll("tbody tr");

    for (var i = 0; i < rows.length; i++) {
      // Начинаем с 1, чтобы пропустить строку с заголовками
      var cells = rows[i].querySelectorAll(".table-colon");
      var match = false;

      for (var j = 0; j < cells.length; j++) {
        var cellContent = cells[j].textContent.toLowerCase();
        if (cellContent.indexOf(searchInput) !== -1) {
          match = true;
          break;
        }
      }

      if (match) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  });
// СОРТИРОВКА
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("clients-table");
  switching = true;

  // Set the column index based on the selected value
  var columnIndex;
  var sortBy = document.getElementById("sortirovka-filter").value;
  switch (sortBy) {
    case "name":
      columnIndex = 0; // Index of the "ФИО" column
      break;
    case "surname":
      columnIndex = 0; // Index of the "ФИО" column
      break;
    case "lastname":
      columnIndex = 0; // Index of the "ФИО" column
      break;
    default:
      return; // No sorting needed
  }

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;

      x = rows[i]
        .getElementsByTagName("td")
        [columnIndex].innerText.toLowerCase();
      y = rows[i + 1]
        .getElementsByTagName("td")
        [columnIndex].innerText.toLowerCase();

      if (x > y) {
        shouldSwitch = true;
        break;
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}


// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })