
// При загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  UpdateRents()
});
var clients = null
var RentId = 0
var RentsFilterOption = "all"
//При изменении значения в фильтре
function filterChanged(){
  RentsFilterOption = document.getElementById("rents-filter").value
  UpdateRents()
}
var RentsSearchText = ""
//При изменении значения в поиске
function SearchBoxChanged(){
  RentsSearchText = document.getElementById("rents-searchbox").value
  UpdateRents()
}
const RentsMainTable = document.getElementById("RentsMainTable")
const SaveRentBtn = document.getElementById("SaveRentBtn")
const NotRentedInventoryModalWindow = document.getElementById("NotRentedInventoryModalWindow")
NotRentedInventoryModalWindow.style.display = "none";
//Обновление главной таблицы
function UpdateRents(){
  
  fetch('/getallrents')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
      //Логика обновления данных в таблице
      ////console.log(data)
      //headers
      RentsMainTable.innerHTML = ''
      var headers = ['Предметы', 'Имя клиента', 'Время взятия', 'Время возврата'];
      var headerRow = document.createElement('tr');

      headers.forEach(function(headerText) {
          var th = document.createElement('th');
          th.textContent = headerText;
          //th.classList.add("")
          headerRow.appendChild(th);
          headerRow.classList.add("table__header")
      });
      RentsMainTable.appendChild(headerRow)

      //Фильтрация по фильтру
      data = data.filter(function(item) {
        return item.Expired.toString().toLowerCase() === RentsFilterOption || RentsFilterOption === 'all';
      });

      //Фильтрация по Поиску
      data = data.filter(function(item) {
        item = JSON.stringify(item)
        
        return item.includes(RentsSearchText) || RentsSearchText === "";
      });

      data.forEach(function(dataRow) {
        var tr = document.createElement('tr');

    // Добавляем ячейку в строку
        console.log(dataRow)
        var Items = document.createElement('td');
        Items.textContent = dataRow.StartItems.length
        tr.appendChild(Items);
        var Client = document.createElement('td');
        Client.textContent = dataRow.Client.FIO
        tr.appendChild(Client);
        var StartTime = document.createElement('td');
        StartTime.textContent = dataRow.Start_Date+ " " + dataRow.Start_Time
        tr.appendChild(StartTime);
        var ReturnTime = document.createElement('td');
        ReturnTime.textContent = dataRow.Return_Date+ " " + dataRow.Return_Time
        tr.appendChild(ReturnTime);
        tr.classList.add('table-row')
        tr.onclick = function(){OpenRentInfo(dataRow.ID)}
        Array.from(tr.children).forEach(row => row.classList.add('colone'))
        RentsMainTable.appendChild(tr)
      });
      document.getElementById("rentsCount").innerText = RentsMainTable.rows.length-1;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    
}

const RentMainModalContainer = document.getElementById("RentMainModalContainer")
const RentMainModal = document.getElementById("RentMainModal")
const SelectedInventoryTable = document.getElementById("SelectedInventoryTable")
const InventoryInfoContainer = document.getElementById("InventoryInfoContainer")
const ServiceList = document.getElementById("service_list")
const addItemButton = document.getElementById("addItemButton")
const CreateRentBtn = document.getElementById("CreateRentBtn")
// Модальное окно создания аренды
document.getElementById("openCreateRentModalBtn").addEventListener("click", function() {
    SaveRentBtn.style.display = 'none'
    CreateRentBtn.style.display = 'block'
    NotRentedInventoryModalWindow.style.display = "block";

    NotRentedInventoryModal.style.display = "block";
    clients = null
    RentMainModalContainer.style.display = "flex";
    RentMainModal.style.display = "block";
    UpdateNotRentedInventory()
});



document.getElementById("closeCreateRentModalBtn").addEventListener("click", function() {
      RentMainModalContainer.style.display = "none";
      InventoryInfoContainer.style.display = "none";
      NotRentedInventoryModalWindow.style.display = "none";
      RentMainModal.style.display = "none";
      NotRentedInventoryModal.style.display = "none";
      SelectedInventoryTable.innerHTML = "";
      ServiceList.innerHTML = "";
      FormClientSelect.value = null
      FormPaymentMethodSelect.value = null
      rentalStartDate.value = null
      rentalStartTime.value = null
      rentalEndDate.value = null
      rentalEndTime.value = null
      itemsSum.value = null
      deposit.value = null
      FormClientSelect.disabled = false
      rentalStartDate.disabled = false
      rentalStartTime.disabled = false
      deposit.disabled = false
    });
const NotRentedInventoryTable = document.getElementById("NotRentedInventoryTable")
const NotRentedInventoryModal = document.getElementById("NotRentedInventoryModal")


var InventorySearchText = ""

//При изменении текста в поиске инвентаря
function InventorySearchBoxChanged(){
  InventorySearchText = document.getElementById("inventory-searchbox").value
  UpdateNotRentedInventory()
}

function UpdateNotRentedInventory(){
  NotRentedInventoryTable.innerHTML = "";
  fetch('/getNotRentedInventory')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
    //Логика обновления данных в таблице
    ////console.log(data)
    //headers
    NotRentedInventoryTable.innerHTML = ''
    var headers = ['Название', 'Размер', 'Тип','Статус'];
    var headerRow = document.createElement('tr');

    headers.forEach(function(headerText) {
        var th = document.createElement('th');
        th.textContent = headerText;
        //th.classList.add("")
        headerRow.appendChild(th);
        headerRow.classList.add("table__header")
    });
    NotRentedInventoryTable.appendChild(headerRow)

    //Фильтрация по Поиску
    data = data.filter(function(item) {
      itemID = item.ID
      item = JSON.stringify(item)
      
      return (item.includes(InventorySearchText) || InventorySearchText === "") && !SelectedInventoryTable.innerHTML.includes('data-id="'+itemID+'"');
    });

    data.forEach(function(dataRow) {
      var tr = document.createElement('tr');
      var Name = document.createElement('td');
      Name.textContent = dataRow.Name
      tr.appendChild(Name);
      var Size = document.createElement('td');
      Size.textContent = dataRow.Size
      tr.appendChild(Size);
      var Type = document.createElement('td');
      Type.textContent = dataRow.Type
      tr.appendChild(Type);
      var Status = document.createElement('td');
      Status.textContent = dataRow.Rented
      tr.appendChild(Status);
      tr.onclick = function(){AddInventoryToList(dataRow.ID), NotRentedInventoryTable.removeChild(tr)}
      tr.classList.add('table-row')
      Array.from(tr.children).forEach(row => row.classList.add('colone'))
      NotRentedInventoryTable.appendChild(tr)
    });
    
  })
  .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
  });
}

function AddInventoryToList(id){
  fetch('/getInventoryData?ID='+id)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(async dataRow => {
      //Логика обновления данных в таблице
      //console.log(dataRow)
      // Create a div with class "item-card"
        const div = document.createElement('div');
        div.classList.add("item-card");

        // Create left section
        const divLeft = document.createElement('div');
        divLeft.classList.add("item_card-left");
        const divName = document.createElement('div');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = dataRow.Name;
        divName.appendChild(nameSpan);
        divLeft.appendChild(divName);

        // Create center section
        const divCenter = document.createElement('div');
        divCenter.classList.add("item_card-center");
        const divSize = document.createElement('div');
        const sizeSpan = document.createElement('span');
        sizeSpan.textContent = "Размер:" + dataRow.Size;
        divSize.appendChild(sizeSpan);
        divCenter.appendChild(divSize);
        const divType = document.createElement('div');
        const typeSpan = document.createElement('span');
        typeSpan.textContent = "Тип:" + dataRow.Type;
        divType.appendChild(typeSpan);
        divCenter.appendChild(divType);
        const divRent = document.createElement('div');
        const rentSpan = document.createElement('span');
        rentSpan.textContent = dataRow.Rented;
        divRent.appendChild(rentSpan);
        divCenter.appendChild(divRent);

        // Create damage section
        const divDamage = document.createElement('div');
        divDamage.classList.add("item_card-damage");
        const damageTable = document.createElement('table');
        const th = document.createElement("th");
        th.textContent = "Поломки";
        damageTable.appendChild(th);
        if(dataRow.Services){
          dataRow.Services.forEach(element => {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = element.Task;
            tr.appendChild(td);
            damageTable.appendChild(tr);
        });
        }

        divDamage.appendChild(damageTable);

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Удалить";
        deleteButton.classList.add("addItemButton", "card-right");
        deleteButton.onclick = function () {
            SelectedInventoryTable.removeChild(div);
            DeleteSelectedInventory(dataRow.ID);
        };

        // Append all elements to the main div
        div.appendChild(divLeft);
        div.appendChild(divCenter);
        div.appendChild(divDamage);
        div.appendChild(deleteButton);

        // Set dataset ID and append to SelectedInventoryTable
        div.dataset.id = dataRow.ID;
        SelectedInventoryTable.appendChild(div);

        })
        .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function DeleteSelectedInventory(id){
  UpdateNotRentedInventory()
}
const SelectedItemName = document.getElementById("SelectedItemName");
const SelectedItemSize = document.getElementById("SelectedItemSize");
const SelectedItemType = document.getElementById("SelectedItemType");
var ItemId = 0
function ShowOldInventoryData(data){
  //console.log(data)
  ItemId = data.ID
  //console.log(ItemId)
  ServiceList.innerHTML = ""
  var headers = ['Поломки'];
      var headerRow = document.createElement('tr');

      headers.forEach(function(headerText) {
          var th = document.createElement('th');
          th.textContent = headerText;
          //th.classList.add("")
          headerRow.appendChild(th);
          headerRow.classList.add("table__header")
      });
      ServiceList.appendChild(headerRow)
  
      ////console.log(dataRow)
      SelectedItemName.textContent = data.Name;
      SelectedItemSize.textContent = data.Size;
      SelectedItemType.textContent = data.Type;
      if (data.Services !== null){

        data.Services.forEach(function(row) {
          var tr = document.createElement('tr');
          tr.textContent = row.Task;
          //th.classList.add("")
          ServiceList.appendChild(tr);
          tr.classList.add("colon")});
      }

    
    
    InventoryInfoContainer.style.display="flex"
    
 
}
async function GetInventoryData(id){
  return await fetch('/getInventoryData?ID='+id)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(dataRow => {
      console.log(dataRow)
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

//Модалка для добавления сервиса
const serviceModalContainer = document.getElementById("serviceModalContainer");
const serviceModal = document.getElementById("serviceModal");

document.getElementById("addServiceButton").addEventListener("click",function(){
  serviceModalContainer.style.display="flex"
  serviceModal.style.display="block"
});

document.getElementById("closeAddServiceModal").addEventListener("click",function(){
  serviceModalContainer.style.display="none"
  serviceModal.style.display="none"
});

document.getElementById("addServiceForm").addEventListener("submit",function(event){
  event.preventDefault();
  const Text = event.target.ToDo.value;
    //console.log(ItemId)
    const data = {
      creating_date: null,
      clients: clients,
      inventory: ItemId,
      task: Text,
      parts: 0,
      cost: 0,
      ispayed: false
    }
    // Отправьте данные на сервер с использованием Fetch API
    fetch("/service_create", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            // Обработка успешной отправки данных
            console.log("Данные успешно отправлены на сервер.");
            const listItem = document.createElement("tr");
            listItem.innerText = Text;
            ServiceList.appendChild(listItem);
            listItem.classList.add("colon")
        } else {
            // Обработка ошибки отправки данных
            console.error("Ошибка при отправке данных на сервер.");
        }
    })
    .catch(error => {
        console.error("Произошла ошибка: " + error);
    });
  
});
const rentalStartDate = document.getElementById('rentalStartDate')
const rentalStartTime = document.getElementById('rentalStartTime')
const rentalEndDate = document.getElementById('rentalEndDate')
const rentalEndTime = document.getElementById('rentalEndTime')
const FormClientSelect = document.getElementById('FormClientSelect')
const FormPaymentMethodSelect = document.getElementById('FormPaymentMethodSelect')
const deposit = document.getElementById('passportLabel')
const isPayed = document.getElementById('isPayed')
const itemsSum = document.getElementById('itemsSum')
document.getElementById("CreateRentBtn").addEventListener("click", function(){
  var rows = SelectedInventoryTable.querySelectorAll('div');
  var idInventoryArray = [];
  rows.forEach(function (row) {
    var idInventory = row.dataset.id;
    if (idInventory !== null && idInventory !== undefined) {
      idInventoryArray.push(idInventory);
    }
  });
  var formData = {
    Start_Date: rentalStartDate.value,
    Start_Time: rentalStartTime.value,
    Return_Date: rentalEndDate.value,
    Return_Time: rentalEndTime.value,
    StartItems: idInventoryArray,
    Client: FormClientSelect.value,
    paymentMethod: FormPaymentMethodSelect.value,
    Deposit: document.getElementById('passportLabel').innerText,
    IsPayed: false,
    Cost: itemsSum.value
  };
  fetch('/rents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Успех:', data);
      UpdateRents();
      UpdateNotRentedInventory();
      RentMainModalContainer.style.display = "none";
      RentMainModal.style.display = "none";
      InventoryInfoContainer.style.display = "none";
      NotRentedInventoryModalWindow.style.display = "none";
      NotRentedInventoryModal.style.display = "none";
      SelectedInventoryTable.innerHTML = "";
      ServiceList.innerHTML = "";
    })
    .catch((error) => {
      console.error('Ошибка:', error);
    });

});

document.getElementById('SaveRentBtn').addEventListener('click',function(){
  var rows = SelectedInventoryTable.querySelectorAll('div');
  var idInventoryArray = [];
  rows.forEach(function (row) {
    var idInventory = row.dataset.id;
    if (idInventory !== null && idInventory !== undefined) {
      idInventoryArray.push(idInventory);
    }
  });
  var formData = {
    ID:RentId,
    Return_Date: rentalEndDate.value,
    Return_Time: rentalEndTime.value,
    ReturnedItems: idInventoryArray,
    paymentMethod: FormPaymentMethodSelect.value,
    Deposit: deposit.value,
    IsPayed: false,
    Cost: itemsSum.value
  };
  fetch('/updaterent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Успех:', data);
      UpdateRents();
      UpdateNotRentedInventory();
      RentMainModalContainer.style.display = "none";
      RentMainModalContainer.style.display = "none";
      InventoryInfoContainer.style.display = "none";
      SelectedInventoryTable.innerHTML = "";
      ServiceList.innerHTML = "";
    })
    .catch((error) => {
      console.error('Ошибка:', error);
    });
});
function OpenRentInfo(id){
  RentId = id
  SaveRentBtn.style.display = 'block'
  CreateRentBtn.style.display = 'none'
  RentMainModalContainer.style.display = "flex";
  RentMainModal.style.display = "block";
  FormClientSelect.disabled = true
  rentalStartDate.disabled = true
  rentalStartTime.disabled = true
  fetch('/getrentbyid?ID='+id)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(resp => {
      var data
      if(resp.ReturnedItems){
        data = resp.ReturnedItems
      }
      else{
        data = resp.StartItems
      }
      
      data.forEach(dataRow => {
        
      
      const div = document.createElement('div');
        div.classList.add("item-card");

        // Create left section
        const divLeft = document.createElement('div');
        divLeft.classList.add("item_card-left");
        const divName = document.createElement('div');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = dataRow.Name;
        divName.appendChild(nameSpan);
        divLeft.appendChild(divName);

        // Create center section
        const divCenter = document.createElement('div');
        divCenter.classList.add("item_card-center");
        const divSize = document.createElement('div');
        const sizeSpan = document.createElement('span');
        sizeSpan.textContent = "Размер:" + dataRow.Size;
        divSize.appendChild(sizeSpan);
        divCenter.appendChild(divSize);
        const divType = document.createElement('div');
        const typeSpan = document.createElement('span');
        typeSpan.textContent = "Тип:" + dataRow.Type;
        divType.appendChild(typeSpan);
        divCenter.appendChild(divType);
        
        // Create damage section
        const divDamage = document.createElement('div');
        divDamage.classList.add("item_card-damage");
        const damageTable = document.createElement('table');
        const th = document.createElement("th");
        th.textContent = "Поломки";
        damageTable.appendChild(th);
        if(dataRow.Services){
          dataRow.Services.forEach(element => {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = element.Task;
            tr.appendChild(td);
            damageTable.appendChild(tr);
        });
        }

        divDamage.appendChild(damageTable);

        // Append all elements to the main div
        div.appendChild(divLeft);
        div.appendChild(divCenter);
        div.appendChild(divDamage);

        // Set dataset ID and append to SelectedInventoryTable
        div.dataset.id = dataRow.ID;
        SelectedInventoryTable.appendChild(div);
      });
      
      FormClientSelect.value = resp.Client.ID
      FormPaymentMethodSelect.value = resp.paymentMethod
      rentalStartDate.value = resp.Start_Date
      rentalStartTime.value = resp.Start_Time
      rentalEndDate.value = resp.Return_Date
      rentalEndTime.value = resp.Return_Time
      console.log(resp)
      deposit.innerText = resp.Deposit
      document.getElementById('passportText').value = resp.Client.DataDocument
      itemsSum.value = resp.Cost
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function ClientChanged(){
  currentClientId = document.getElementById("FormClientSelect").value
  console.log(currentClientId)
  fetch(`/get_client?ID=`+currentClientId, {
    method: "GET"
  })
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        document.getElementById('passportLabel').innerText = data['Pledge']
        document.getElementById('passportText').value = data['DataDocument']
    })
    .catch((error) => {
      console.error("Ошибка сети: " + error);
      return
    });
}

// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })