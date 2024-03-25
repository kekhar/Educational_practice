document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('myModal');
    var openModalBtn = document.getElementById('openModalBtn');

    var closeModalBtn = document.getElementById('closeModalBtn');

    openModalBtn.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    var addItemForm = document.getElementById('addItemForm');
    addItemForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = {
            FIO: document.querySelector('input[name="FIO"]').value,
        };

        // Отправляем данные на сервер в формате JSON
        fetch('/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            location.reload()
            console.log(data);
        })
        .catch(error => {
            // Обработка ошибок
            console.error('Ошибка:', error);
        });
    });

});
function Delete(id){
    fetch("/delete_employee?ID="+id, {method: "POST"})
    location.reload()
}
function Search(){
        var searchvalue = document.getElementById('employees__search').value
        const rows = document.querySelectorAll("table tr");
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            var RowName = row.children[0].textContent;
            if (RowName.includes(searchvalue)) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
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
