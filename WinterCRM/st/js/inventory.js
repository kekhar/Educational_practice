var ItemId = 0
function openModal () {
    document.querySelector(".modal-container").style.display = "flex";
    document.querySelector(".modal").style.display = "block";
}

document.querySelectorAll(".close").forEach(function(element) {
    element.addEventListener("click", function() {
        document.querySelector(".modal-container").style.display = "none";
        document.querySelector(".modal").style.display = "none";
    });
});

function Delete(btnid) {
    fetch("/del-inventory", {
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
        console.log("Успешно удалено", data);
        document.getElementById(btnid).remove();
    })
    .catch(error => {
        console.error("Ошибка при отправке запроса:", error);
    });
}
function Sell(){
    var cost = document.getElementById("cost").value;
    var comment = document.getElementById("comment").value;
    console.log(cost)
    console.log(comment)
    console.log(ItemId)
    fetch("/sell_inventory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idinventory: ItemId, cost: cost, comment: comment 
        })
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
        console.log("Успешно удалено", data);
        document.getElementById(ItemId).remove();
        document.getElementById('ModalSell').style.display='none'
    })
    .catch(error => {
        console.error("Ошибка при отправке запроса:", error);
    });
};
function filterInventory() {
    var selectType = document.getElementById("type-filter");
    var selectRented = document.getElementById("rented-filter");
    var searchboxText = document.getElementById("inventory-searchbox");
    selectType = selectType.value;
    selectRented = selectRented.value;
    searchboxText = searchboxText.value;
    const rows = document.querySelectorAll("table tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        var RowName = row.children[0].textContent;
        var rowType = row.children[1].textContent;
        var RowRented = row.children[2].children[0].textContent;
        if ((rowType === selectType || selectType === 'all') && (RowRented.includes(selectRented) || selectRented === 'all')&&(RowName.includes(searchboxText))) {
            row.style.display = "table-row";
        } else {
            row.style.display = "none";
        }
    }
}
document.getElementById("addItemForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = event.target.name.value;
    const type = event.target.type.value;
    const typetext = event.target.type.options[event.target.type.selectedIndex].text;
    const rented = document.getElementById("rentedCheck").checked
    const size = document.getElementById("sizeInv").value;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("rented", rented);
    formData.append("size", size);

    fetch("/inventory", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .catch(error => {
        console.error("Ошибка при отправке запроса:", error);
    });
    location.reload();
    });
    

function openModalSell(id) {
    ItemId = id
    console.log(ItemId)
    document.getElementById('ModalSell').style.display = 'flex';
  }

  document.getElementById('ModalSell').addEventListener('click', function (e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });

  // Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })

  function toggleMenu() {
  var mobileMenu = document.getElementById("mobileMenu");
  mobileMenu.classList.toggle("show");
}