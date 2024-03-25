
var ItemId
document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('myModal');
    var openModalButton = document.getElementById('openModalBtn');
    var closeModalSpan = document.getElementsByClassName('close')[1];
  
    openModalButton.onclick = function () {
      modal.style.display = 'block';
    };
  
    closeModalSpan.onclick = function () {
      modal.style.display = 'none';
    };
  });
  var currentItemID;

  function openModal(itemId) {
    ItemId = itemId;
    document.getElementById('quantityModal').style.display = 'block';
  }

 
  
  document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('closeQuantityModalBtn').addEventListener('click', function () {
      document.getElementById('quantityModal').style.display = 'none';
    });

    document.getElementById('quantityForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var submittedItemID = document.getElementById('itemIDInput').value;

      document.getElementById('quantityModal').style.display = 'none';
    });
  });


    function Delete(btnid) {
            fetch("/del-consumable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: btnid })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Ошибка HTTP: " + response.status);
                }
            })
            .then(data => {
                console.log("Успешно удалено", data);
                location.reload();
            })
            .catch(error => {
                console.error("Ошибка при отправке запроса:", error);
            });
        }
        function Add(btnid){
            const itemData = {
                id: btnid
            };
        
            console.log("Отправка данных на сервер:", itemData);
        
            fetch("/add-consumable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(itemData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Ошибка HTTP: " + response.status);
                }
            })
            .then(data => {
                console.log("Успешно добавлено", data);
                location.reload();
            })
            .catch(error => {
                console.error("Ошибка при отправке запроса:", error);
            });
        }
        let sellingInProgress = false;
        function Sell(btnid){
            console.log("Продажа товара с ID:", btnid);
            fetch("/sell-consumable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: btnid })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Ошибка HTTP: " + response.status);
                }
            })
            .then(data => {
                // Обработка данных после успешного запроса
                console.log("Успешно продано", data);
                location.reload();
            })
            .catch(error => {
                console.error("Ошибка при отправке запроса:", error);
            });
        }
        document.getElementById("addItemForm").addEventListener("submit", function (event) {
            event.preventDefault();

            const name = event.target.name.value;
            const cost = event.target.cost.value;

            const table = document.querySelector("table");
            const newRow = table.insertRow(table.rows.length);
            newRow.style.background='rgb(255, 84, 84)'
            const cells = [newRow.insertCell(0), newRow.insertCell(1), newRow.insertCell(2), newRow.insertCell(3), newRow.insertCell(4)];

            const id = table.rows.length
            cells[0].innerText = name;
            cells[1].innerText = cost;
            cells[2].innerText = 0;
            cells[3].innerText = 0;
            var button = document.createElement("button");
            button.textContent = "Удалить";
            
            button.onclick = function () {
                Delete(id);
            };
            
            cells[4].appendChild(button);
            button.textContent = "Удалить"
            
            button.onclick = function () {
                Delete(id);
            };
            cells[4].appendChild(button)
            
            const formData = new FormData();
            formData.append("Name", name);
            formData.append("Cost", cost);

            fetch("/shop", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .catch(error => {
                console.error("Ошибка при отправке запроса:", error);
            });


            event.target.reset();
            location.reload();
        });
        
        document.getElementById("addQuantityBtn").addEventListener('click', function(){
            fetch("/add-consumable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: ItemId, howmany:document.getElementById('howmanyinput').value })
            })
            location.reload()
          })

// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })