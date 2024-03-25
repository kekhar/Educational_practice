document
  .getElementById("CreateServiceBtn")
  .addEventListener("click", function () {
    // Получите данные из полей вручную
    const creating_date = document.querySelector(
      'input[name="creating_date"]'
    ).value;
    const clients = document.querySelector('select[name="clients"]').value;
    const inventory = document.querySelector('select[name="inventory"]').value;
    const task = document.querySelector('input[name="task"]').value;
    const parts = document.querySelector('input[name="parts"]').value;
    const cost = document.querySelector('input[name="cost"]').value;
    const ispayed = document.querySelector('input[name="ispayed"]').checked;
    // Соберите данные в объект
    const data = {
      creating_date: creating_date,
      clients: clients,
      inventory: inventory,
      task: task,
      parts: parts,
      cost: cost,
      ispayed: ispayed,
    };
    // Отправьте данные на сервер с использованием Fetch API
    fetch("/service_create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          // Обработка успешной отправки данных
          console.log("Данные успешно отправлены на сервер.");
          location.reload();
        } else {
          // Обработка ошибки отправки данных
          console.error("Ошибка при отправке данных на сервер.");
        }
      })
      .catch((error) => {
        console.error("Произошла ошибка: " + error);
      });
  });
function SearchBox() {
  var SearchText = document.getElementById("serviceSearch").value;
  var rows = document.getElementById("Table").children;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    rowText = row.children[2].innerHTML;
    console.log(rowText);
    console.log(SearchText);
    if (SearchText === "" || rowText.includes(SearchText)) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  }
}
function Delete(id) {
  // Отправьте данные на сервер с использованием Fetch API
  fetch("/service_delete?id=" + id, {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        // Обработка успешной отправки данных
        console.log("Данные успешно отправлены на сервер.");
        location.reload();
      } else {
        // Обработка ошибки отправки данных
        console.error("Ошибка при отправке данных на сервер.");
      }
    })
    .catch((error) => {
      console.error("Произошла ошибка: " + error);
    });
}
document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("myModal");
  var openModalButton = document.getElementById("openModalBtn");
  var closeModalSpan = document.getElementsByClassName("close")[1];

  openModalButton.onclick = function () {
    modal.style.display = "block";
  };

  closeModalSpan.onclick = function () {
    modal.style.display = "none";
  };
});

function UpdatePaymentStatus(id) {
  var data = {
    ID: id,
    IsPayed: document.getElementById(id).children[7].children[0].checked,
  };
  fetch("/update_service_payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        // Обработка успешной отправки данных
        console.log("Данные успешно отправлены на сервер.");
      } else {
        // Обработка ошибки отправки данных
        console.error("Ошибка при отправке данных на сервер.");
      }
    })
    .catch((error) => {
      console.error("Произошла ошибка: " + error);
    });
}
function SearchBox() {
  var input, filter, table, tr, td, i, j, txtValue;
  var SortValue = document.getElementById("sortirovka-filter").value;
  input = document.getElementById("serviceSearch");
  filter = input.value.toUpperCase();
  table = document.getElementById("Table");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td");
    for (j = 0; j < td.length; j++) {
      if (td[j]) {
        txtValue = td[j].textContent || td[j].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          break;
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
  var rows = Array.from(tr);
  console.log(rows);
  var data = rows.map(function (row) {
    return {
      id: row.id,
      date: row.cells[0].textContent,
      client: row.cells[1].textContent,
      inventory: row.cells[2].textContent,
      task: row.cells[3].textContent,
      parts: row.cells[4].textContent,
      cost: row.cells[5].textContent,
      ispayed: row.cells[6].querySelector('input[type="checkbox"]').checked,
      rowItem: row,
    };
  });
  if (SortValue === "date") {
    data.sort(function (a, b) {
      // Сортировка по дате
      return new Date(a.date) - new Date(b.date);
    });
  } else if (SortValue === "inventory") {
    data.sort(function (a, b) {
      // Сортировка по названию инвентаря
      return a.inventory.localeCompare(b.inventory);
    });
  } else if (SortValue === "summ") {
    data.sort(function (a, b) {
      // Сортировка по cost
      return parseFloat(a.cost) - parseFloat(b.cost);
    });
  } else if (SortValue === "clients") {
    data.sort(function (a, b) {
      // Сортировка по client
      return a.client.localeCompare(b.client);
    });
  }
  // Удаляем текущие строки из таблицы
  rows.forEach(function (row) {
    row.remove();
  });
  data.forEach(function (item) {
    var row = item.rowItem;
    table.appendChild(row);
  });
  console.log(data);
}

document.addEventListener("DOMContentLoaded", function () {
  const statusList = document.querySelectorAll("#StatusListBox");

  statusList.forEach((select) => {
    select.addEventListener("change", function () {
      const serviceId = this.dataset.serviceId;
      const newStatus = this.value;

      // Отправка запроса на сервер с использованием fetch
      fetch("/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: serviceId,
          newStatus: newStatus,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Обработка успешного ответа от сервера
          console.log("Запрос успешно отправлен", data);
        })
        .catch((error) => {
          // Обработка ошибки
          console.error(
            "Произошла ошибка при отправке запроса на сервер",
            error
          );
        });
    });
  });
});


// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })