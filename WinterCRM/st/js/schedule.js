var option = 0;
const statuses = {
  0: {
    color: "rgb(255, 255, 255)",
    status: "",
    backgroundColor: " style='color: rgb(255, 255, 255)'",
  },
  1: {
    color: "rgb(207, 232, 255)",
    status: "Работает",
    backgroundColor: " style='color: rgb(143, 175, 255)'",
  },
  2: {
    color: "rgb(255, 207, 207)",
    status: "Болеет",
    backgroundColor: " style='color: rgb(255, 157, 157)'",
  },
  3: {
    color: "rgb(255, 255, 174)",
    status: "Отпуск",
    backgroundColor: " style='color: rgb(235, 225, 110)'",
  },
};
const employeeSelect = document.getElementById("employeeSelect");

// Функция для создания календаря
async function createCalendar() {
  if (employeeSelect.value === "placeholder") {
    return;
  }
  var selectedDate = new Date(document.getElementById("monthInput").value);
  if (selectedDate.toString() === "Invalid Date") {
    return;
  }
  var year = selectedDate.getFullYear();
  var month = selectedDate.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
  // Получаем контейнер для календаря
  var calendarContainer = document.getElementById("calendarContainer");

  // Создаем новую таблицу
  var table = document.createElement("table");

  // Создаем заголовок таблицы
  var headerRow = table.insertRow(0);
  var daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  for (var i = 0; i < daysOfWeek.length; i++) {
    var cell = headerRow.insertCell(i);
    cell.innerHTML = daysOfWeek[i];
  }

  // Получаем первый день месяца
  var firstDay = new Date(year, month - 1, 1);
  var startingDay = firstDay.getDay();
  // Получаем количество дней в месяце
  var daysInMonth = new Date(year, month, 0).getDate();
  if (startingDay === 0) {
    startingDay = 7;
  }
  // Создаем ячейки для каждого дня месяца
  var row = table.insertRow(1);
  var dayCount = 1;

  for (var i = 0; i < daysInMonth / 7; i++) {
    for (var j = 0; j < 7; j++) {
      var cell = row.insertCell(j);

      if (i === 0 && j < startingDay - 1) {
        // Пустые ячейки до начала месяца
        continue;
      }

      if (dayCount > daysInMonth) {
        cell.remove();
        // Завершаем создание таблицы, если превышено количество дней в месяце
        break;
      }
      cell.classList.add("cell");
      cell.dataset.day = dayCount;
      cell.dataset.month = month;
      cell.dataset.year = year;
      cell.innerHTML = dayCount;
      await fetch(
        "/getschedule?employee=" +
          employeeSelect.value +
          "&date=" +
          year +
          "-" +
          month +
          "-" +
          dayCount,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data["status_id"] === null) {
            cell.style.background = statuses["0"];
          } else {
            cell.style.background = statuses[data["status_id"]]["color"];
            cell.innerHTML =
              cell.dataset.day +
              "<br><span" +
              statuses[data["status_id"]]["backgroundColor"] +
              ">" +
              statuses[data["status_id"]]["status"] +
              "</span>";
          }
        });

      dayCount++;
    }

    // Переходим на следующую строку
    row = table.insertRow(table.rows.length);
  }

  // Очищаем предыдущий календарь
  calendarContainer.innerHTML = "";

  // Добавляем таблицу в контейнер
  calendarContainer.appendChild(table);
  document.querySelectorAll(".cell").forEach(function (element) {
    element.addEventListener("click", function (event) {
      var selectedRadio = document.querySelector(
        'input[name="radioGroup"]:checked'
      );
      var data = {
        idEmployee: employeeSelect.value,
        date:
          element.dataset.year +
          "-" +
          element.dataset.month +
          "-" +
          element.dataset.day,
        idStatus: selectedRadio.value,
      };
      fetch("/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          element.style.background = statuses[selectedRadio.value]["color"];
          element.innerHTML = "";
          element.innerHTML =
            element.dataset.day +
            "<br><span" +
            statuses[selectedRadio.value]["backgroundColor"] +
            ">" +
            statuses[selectedRadio.value]["status"] +
            "</span>";
          console.log("Ответ от сервера:", data);
        })
        .catch((error) => {
          console.error("Ошибка при отправке запроса:", error);
        });
    });
  });
}

// Обработчик изменения значения в поле выбора месяца
document.getElementById("monthInput").addEventListener("change", function () {
  // Получаем выбранный год и месяц
  var selectedDate = new Date(this.value);
  var selectedYear = selectedDate.getFullYear();
  var selectedMonth = selectedDate.getMonth() + 1; // Месяцы в JavaScript начинаются с 0

  // Создаем календарь
  createCalendar(selectedYear, selectedMonth);
});

document
  .querySelector(".getSchedule")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    var monthInput = document.getElementById("monthInput");

    // Подготавливаем данные для отправки на сервер
    var formData = {
      employee: employeeSelect.value,
      month: monthInput.value,
    };

    // Отправляем запрос на сервер
    fetch("/get_schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Обработка ответа от сервера
        console.log("Ответ от сервера:", data);
      })
      .catch((error) => {
        console.error("Ошибка при отправке запроса:", error);
      });
  });

document.getElementById("passwordButton").addEventListener("click", () => {
  const password = document.getElementById("password").value;

  // Создаем объект FormData для отправки данных формы
  const formData = new FormData();
  formData.append("password", password);

  // Отправляем POST-запрос на сервер
  fetch("/get_password", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Обработка ответа от сервера (data.result будет содержать True или False)
      if (data.result === true) {
        const statusElement = document.querySelector(".status");
        statusElement.style.display = "block";
      } else {
        console.log("Пароль неверный");
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });
});

// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");
toggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

// для меню
document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.getElementById("menuButton");
  var menuForm = document.getElementById("menuForm");

  menuButton.addEventListener("click", function () {
    if (menuForm.style.display === "block") {
      menuForm.style.display = "none";
      menuButton.innerHTML = "&#9776;";
    } else {
      menuForm.style.display = "block";
      menuButton.innerHTML = "&#8601;";
    }
  });
});
