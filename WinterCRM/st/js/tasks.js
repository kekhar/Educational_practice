var selectedColor = "rgb(204, 204, 204)";

document
  .querySelector(".tasks__search-input")
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

function filterTasks() {
  const selectColor = document.getElementById("color-filter");
  const selectEmployee = document.getElementById("staff-filter");

  const selectedColor = selectColor.value;
  const selectedEmployeeId = selectEmployee.value;
  console.log(selectedColor);
  console.log(selectedEmployeeId);
  const rows = document.querySelectorAll("table tr");

  const colors = {
    red: "rgb(255, 104, 104)",
    blue: "rgb(138, 199, 255)",
    yellow: "rgb(255, 194, 115)",
    gray: "rgb(204, 204, 204)",
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowColor = row.style.backgroundColor;
    const performerName = row.querySelector(
      ".table-colon:nth-child(2)"
    ).textContent;

    if (
      (selectedColor === "all" ||
        selectedColor === "placeholder" ||
        colors[selectedColor] === rowColor) &&
      (selectedEmployeeId === "all" ||
        selectedEmployeeId === "placeholder" ||
        selectedEmployeeId === performerName)
    ) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  }
}

function Delete(btnid) {
  fetch("/del-task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: btnid }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Ошибка HTTP: " + response.status);
      }
    })
    .then((data) => {
      // Обработка данных после успешного запроса
      console.log("Успешно удалено", data);
      document.getElementById(btnid).remove();
      const allTasksCount = document.getElementById("allTasksCount");
      const uncheckedTasksCount = document.getElementById(
        "uncheckedTasksCount"
      );
      const currentValueAllTasks = parseInt(allTasksCount.innerText, 10);
      const currentValueUncheckedTasks = parseInt(
        uncheckedTasksCount.innerText,
        10
      );

      if (!isNaN(currentValueAllTasks) && !isNaN(currentValueUncheckedTasks)) {
        allTasksCount.innerText = currentValueAllTasks - 1;
        uncheckedTasksCount.innerText = currentValueUncheckedTasks - 1;
      }
    })
    .catch((error) => {
      console.error("Ошибка при отправке запроса:", error);
    });
}

function selectColor(element) {
  // Убираем границу со всех цветов
  var colorCircles = document.querySelectorAll(".color-circle");
  colorCircles.forEach(function (circle) {
    circle.style.border = "2px solid transparent";
  });

  // Добавляем границу выбранному цвету
  element.style.border = "2px solid black";
  selectedColor = getComputedStyle(element).backgroundColor;
  console.log(selectedColor);
}

const addTaskButton = document.getElementById("addTaskButton");
const taskInput = document.getElementById("task");
const employeesSelect = document.getElementById("employees");
const dueDateInput = document.getElementById("dueDate");

addTaskButton.addEventListener("click", async () => {
  const task = taskInput.value;
  const employee = employeesSelect.value;
  const dueDate = dueDateInput.value;

  if (task) {
    const data = {
      task: task,
      employee: employee,
      dueDate: dueDate,
      color: selectedColor,
    };

    const response = await fetch("/addTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      taskInput.value = "";
      employeesSelect.value = "";
      dueDateInput.value = "";
      selectedColor = "rgb(204, 204, 204)";
      location.reload();
    } else {
      alert("Ошибка");
    }
  } else {
    alert("Please enter a task");
  }
});

document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('myModal');
    var openModalButton = document.getElementById('openModalButton');
    var closeModalSpan = document.getElementsByClassName('close')[1];
  
    openModalButton.onclick = function () {
      modal.style.display = 'block';
    };
  
    closeModalSpan.onclick = function () {
      modal.style.display = 'none';
    };
  
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  });

  // Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })
document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("myModal");
  var openModalButton = document.getElementById("openModalButton");
  var closeModalSpan = document.getElementsByClassName("close")[0];

  openModalButton.onclick = function () {
    modal.style.display = "block";
  };

  closeModalSpan.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});

function sendSelectedValue(id) {
  var selectElement = document.getElementById("StatusListBox_" + id);
  var selectedValue = selectElement.options[selectElement.selectedIndex].value;
  console.log(selectedValue);
  const data = {
    idTask: id,
    status: selectedValue,
  };

  const response = fetch("/updateTaskStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
