from sanic import Sanic, response, HTTPResponse, json, redirect, html, file
from sanic import Sanic
from sanic.response import text, html
from jinja2 import Environment, FileSystemLoader, select_autoescape
from Database import Database
from datetime import datetime

app = Sanic("WinterCRM")

env = Environment(
    loader=FileSystemLoader('temp'),  # Папка с шаблонами
    autoescape=select_autoescape(['html', 'xml'])
)

app.static("/static/", "./st/")

#region /index
@app.route("/")
async def index(request):
    return response.redirect('/statistics')

#region /shop
@app.post("/shop")
async def addConsumableType(request):
    Name = request.form.get('Name')
    Cost = request.form.get('Cost')
    Database.addConsumableType(Name,Cost)
    return response.json({'status':'ok'})

@app.post("/add-consumable")
async def addConsumable(request):
    Database.addConsumable(request.json.get('id'), request.json.get('howmany'))
    return response.json({'response':'OK'}, status = 200)

@app.post("/sell-consumable")
async def sellConsumable(request):
    try:
        item_id = int(request.json.get('id'))
        Database.sellConsumable(item_id)
        return response.json({'response':'OK'}, status=200)
    except Exception as e:
        return response.json({'response': 'Error'}, status=500)

@app.post("/del-consumable")
async def deleteConsumable(request):
    Database.delConsumable(request.json.get('id'))
    return response.json({'response':'OK'}, status = 200)

@app.get("/shop")
async def shop(request):
    consumables = Database.getConsumables()
    Data = {}
    if consumables:
        Data['Consumables'] = consumables
    template = env.get_template('shop.html')
    rendered_html = template.render(data=Data)

    return html(rendered_html)

@app.route("/getShopInfo")
async def getShopInfo(request):
    shop_count = Database.countShopsByDate()
    if shop_count:
        return response.json(shop_count)
    else:
        return response.json({}, status=404)
#endregion

#region /task
@app.route("/addTask", methods=['POST'])
async def addTask(request):
    try:
        task = request.json.get('task')
        employee = request.json.get('employee')
        date = request.json.get('dueDate')
        color = request.json.get('color')
    except:
        return response.text('NOT OK, NOT OK', status=500)
    if task == '' or employee == '' or date == None or color == '':
        return response.text('NOT OK, NOT OK', status=500)
    Database.createTask(task=task, idEployees=employee, datecreate=date, color = color)
    return response.text('OK',status=200)

@app.post("/del-task")
async def delTask(request):
    Database.delTask(request.json.get('id'))
    return response.json({'response':'OK'}, status = 200)

@app.route("/tasks")
async def tasks(request):
    tasks = Database.getTasksAll()
    staff = Database.getStaffAll()
    data = {}
    data['allTasksCount'] = 0
    data['uncheckedTasksCount'] = 0
    if tasks:
        order_dict = {"Ожидает": 1, "в Работе": 2, "Выполнено": 3}
        data["tasks"] = sorted(tasks, key=lambda x: order_dict.get(x['Status'], float('inf')))
        data['allTasksCount'] = len(tasks)
        data['uncheckedTasksCount'] = sum(1 for task in tasks if task['Status'] == 'в Работе' or task['Status'] == 'Ожидает' )
    if staff:
        data['staff'] = staff
    
    template = env.get_template('tasks.html')
    render_template = template.render(data = data)
    return response.html(render_template)

@app.route("/updateTaskStatus", methods=['POST'])
async def updateTaskStatus(request):
    taskId = request.json.get('idTask')
    status = request.json.get('status')
    Database.statusPut(idTask=taskId, status=status)
    return response.json({"status": 200})

#endregion

#region /employees
@app.post('/employees')
async def addEmployee(request):
    Database.addEmployee(request.json.get("FIO"))

@app.post('/delete_employee')
async def delEmployee(request):
    try:
        Database.DelEmployee(request.args.get('ID'))
    except:
        return response.json({'status':'error'}, status=500)
    return response.json({'status':'ok'}, status=200)

@app.get('/employees')
async def Employees(request):
    getClients = Database.getStaffAll()
    template = env.get_template('employees.html')
    render_template = template.render(data = getClients)
    return response.html(render_template)
#endregion

#region /service
@app.post("/service_delete")
async def delservice(request):
    Database.delService(request.args.get('id'))
    return response.json({"status":"ok"}, status=200)

@app.route("/service", methods=['GET'])
async def service(request):
    getClients = Database.getClients()
    getInventory = Database.getInventory()
    getService = Database.getService()
    data = {}
    if getClients:
        data["clients"] = getClients
    if getInventory:
        data['inventory'] = getInventory
    if getService:
        data['service'] = getService
    
    template = env.get_template('service.html')
    render_template = template.render(data = data)
    return response.html(render_template)

@app.post("/update_service_payment")
async def update_service_payment(request):
    try:Database.UpdateServicePayment(request.json.get('ID'), request.json.get("IsPayed"))
    except:return response.json({"status":"bad"}, status=500)
    return response.json({"status":"ok"}, status=200)

@app.route("/service_create", methods=['POST'])
async def service_create(request):
    creating_date = request.json.get('creating_date')
    clients = request.json.get('clients')
    inventory = request.json.get('inventory')
    task = request.json.get('task')
    parts = request.json.get('parts')
    cost = request.json.get('cost')
    ispayed = request.json.get('ispayed')
    if not creating_date:
        creating_date = datetime.now().date()
    
    Database.createService(creating_date=creating_date, id_client=clients, id_inventory=inventory, task=task, parts=parts, cost=cost, isPayed=ispayed)
    return text("норм")

@app.route("/updateStatus", methods=['POST'])
async def updateStatus(request):
    id = request.json.get('serviceId')
    status = request.json.get('newStatus')
    Database.updateServiceStatus(id, status)
    return response.json({"status":"ok"}, status=200)

#endregion

#region /rents
@app.post("/rents")
async def addRent(request):
    try:
        StartDate = request.json.get('Start_Date')
        if not StartDate:
            StartDate = datetime.now().date().strftime("%Y-%m-%d")
        StartTime = request.json.get('Start_Time')
        if not StartTime:
            StartTime = datetime.now().time().strftime("%H:%M")
        ReturnDate = request.json.get('Return_Date')
        if not ReturnDate:
            ReturnDate = datetime.now().date().strftime("%Y-%m-%d")
        ReturnTime = request.json.get('Return_Time')
        if not ReturnTime:
            ReturnTime = datetime.now().time().strftime("%H:%M")
        StartItems = request.json.get('StartItems')
        ReturnedItems = request.json.get('ReturnedItems')
        ClientId = request.json.get('Client')
        try:
            int(ClientId)
        except:
            return response.json({'status':'NotAdded'}, status=200)
        Deposit = request.json.get('Deposit')
        Cost = request.json.get('Cost')
        IsPayed = request.json.get('IsPayed')
        paymentMethod = request.json.get('paymentMethod')
        Database.addRent(Start_Date=StartDate,
                         Start_Time=StartTime,
                         Return_Date=ReturnDate,
                         Return_Time=ReturnTime,
                         StartItems=StartItems, 
                         ReturnedItems=ReturnedItems, 
                         Client=ClientId,
                         paymentMethod=paymentMethod,
                         Deposit=Deposit, 
                         Cost=Cost, 
                         IsPayed=IsPayed)
    except Exception as exception:
        return response.json({'error':str(exception)}, status=500)
    return response.json({'status':'Ok'}, status=200)

@app.get("/getInventoryData")
async def InventoryData(request):
    inventory = Database.getInventoryById(request.args.get('ID'))
    if not inventory:
        return response.json(None)
    return response.json(inventory)

@app.get("/getNotRentedInventory")
async def NotRentedInventory(request):
    Inventory = Database.getInventory()
    if Inventory:
        NotRentedInventory = list(filter(lambda item: 'Свободно' in item['Rented'], Inventory))
        return json(NotRentedInventory)
    else: return response.json({},status=404)

@app.get("/getrentbyid")
async def getrentbyid(request):
    Rents = Database.getRentById(request.args.get('ID'))
    if Rents:
        return response.json(Rents)
    else:
        return response.json({},status=404)

@app.get("/getallrents")
async def getallrents(request):
    Rents = Database.getRents()
    if Rents:
        return response.json(Rents)
    else:
        return response.json({},status=404)
    
@app.route("/getrentcountbydate")
async def get_rent_count_by_date(request):
    rent_count_by_date = Database.countRentsByDate()
    if rent_count_by_date:
        return response.json(rent_count_by_date)
    else:
        return response.json({}, status=404)
    
@app.post("/updaterent")
async def updaterent(request):
    try:
        id = request.json.get('ID')
        ReturnDate = request.json.get('Return_Date')
        ReturnTime = request.json.get('Return_Time')
        ReturnedItems = request.json.get('ReturnedItems')
        Cost = request.json.get('Cost')
        IsPayed = request.json.get('IsPayed')
        paymentMethod = request.json.get('paymentMethod')
        Database.updateRent(ID = id,
                         Return_Date=ReturnDate,
                         Return_Time=ReturnTime,
                         ReturnedItems=ReturnedItems,
                         paymentMethod=paymentMethod,
                         Cost=Cost,
                         IsPayed=IsPayed)
    except Exception as exception:
        return response.json({'error':str(exception)}, status=500)
    return response.json({'status':'Ok'}, status=200)
@app.get("/rents")
async def rents(request):
    data = {}
    Rents = Database.getRents()
    data['lenRents'] = 0
    if Rents:
        data['Rents'] = Rents
        data['lenRents'] = len(Rents)
    Clients = Database.getClients()
    if Clients:
        data['Clients'] = Clients
    template = env.get_template('rents.html')
    render_template = template.render(data = data)
    return response.html(render_template)
#endregion 

#region /statistics
@app.route("/statistics")
async def statistic(request):
    staff = Database.getStaffName()
    template = env.get_template('statistics.html')
    rendered_html = template.render(data=staff)

    return html(rendered_html)

@app.get("/getAllStaff")
async def getAllStaff(request):
   return response.json(Database.getStaffAll())

@app.get("/getStaffCount")
async def getStaffCount(request):
    return response.json(len(Database.getStaffAll()))
#endregion

#region /schedule
# Функция для получения значений по определенной дате
def get_data_by_date(data_list, target_date):
    for item in data_list:
        _, _, date, value = item  # Распаковываем элемент кортежа
        if date == target_date:
            return value
    return False  # Если данных на указанную дату нет

@app.get("/getschedule")
async def getschedule(request):
    return response.json({"status_id":Database.getDaySchedule(request.args.get("employee"),request.args.get("date"))})

@app.post("/schedule")
async def UpdateSchedule(request):

    Database.putSchedule(request.json.get('idEmployee'), request.json.get('date'), request.json.get('idStatus'))
    return response.json({"status":"ok"}, status=200)

@app.route("/schedule")
async def schedule(request):
    staff = Database.getStaffAll()
    template = env.get_template('schedule.html')
    rendered_html = template.render(data=staff)
    return html(rendered_html)

@app.route('/get_password', methods=['POST'])
async def get_password(request):
    password = "adminqwerty"
    return response.json({'result': request.form.get('password') == password})
#endregion

#region /clients
@app.route('/add_client', methods=['POST'])
async def addClient(request):
    Fio = request.form.get('FIO')
    Pledge = request.form.get('Pledge')
    Passport = request.form.get('Passport')
    PhoneNumber = request.form.get('PhoneNumber')
    newclient = {"id":Database.addClient(Fio,Pledge,Passport,PhoneNumber)}
    return response.json(newclient)

@app.route('/del_client', methods=['DELETE'])
async def delClient(request):
    idClient = request.json.get('id')
    Database.delClientById(idClient)
    responseData = {"success": True}
    return response.json(responseData)
@app.post('/update_old_client')
async def update_client(request):
    Database.updateClient(request.json.get('id'),request.json.get("FIO"),request.json.get("Pledge"),request.json.get("DataDocument"),request.json.get("PhoneNumber"))
    return response.json('ok',status=200)
@app.get('/get_client')
async def get_client(request):
    return json(Database.GetClientById(request.args.get('ID')))
@app.route('/del_selected_clients', methods=['POST'])
async def delSelectedClient(request):
    idsClient = request.json.get('ids')
    for i in idsClient:
        Database.delClientById(i)
    responseData = {"success": True}
    return response.json(responseData)

@app.post('/client-adddocument')
async def addDocument(request):
    #Здесь мне нужно "Name" документа и "Info" о нем
    #json или form - поменять
    Database.addClientDocument(request.json.get("ClientId"), {"Name" : request.json.get("Name"), 'Info': request.json.get("Info")})
    return response.json({'status':'ok'},status=200)

@app.route('/clients', methods=['GET'])
async def clients(request):
    # Получение клиентов из БД, создание словаря и занесение в него данных.
    clients = Database.getClients()
    Data = {}
    Data['lenClients'] = "0 клиентов"
    if clients:
        Data['Clients'] = clients
        # Динамический показ количества клиентов.
        lenClients = len(clients)
        if lenClients % 10 == 1 and lenClients % 100 != 11:
            lenClients = str(len(clients)) + " клиент"
        elif 2 <= lenClients % 10 <= 4 and (lenClients % 100 < 10 or lenClients % 100 >= 20):
            lenClients = str(len(clients)) + " клиента"
        else:
            lenClients = str(len(clients)) + " клиентов"
        Data['lenClients'] = lenClients
    # Добавление данных в шаблонизатор
    template = env.get_template('clients.html')
    rendered_html = template.render(data=Data)

    return html(rendered_html)

@app.route('/clientsCount', methods=['GET'])
async def clientsCount(request):
    # Получение клиентов из БД, создание словаря и занесение в него данных.
    clients = Database.getClients()
    Data = {}
    Data['lenClients'] = "0 клиентов"
    if clients:
        Data['Clients'] = clients
        # Динамический показ количества клиентов.
        lenClients = len(clients)
        if lenClients % 10 == 1 and lenClients % 100 != 11:
            lenClients = str(len(clients)) + " клиент"
        elif 2 <= lenClients % 10 <= 4 and (lenClients % 100 < 10 or lenClients % 100 >= 20):
            lenClients = str(len(clients)) + " клиента"
        else:
            lenClients = str(len(clients)) + " клиентов"
        Data['lenClients'] = lenClients

    return response.json(Data, status = 200)
#endregion

#region /inventory
@app.post('/sell_inventory')
async def sellInventory(request):
   Cost = request.json.get('cost')
   Comment = request.json.get('comment')
   id = request.json.get('idinventory')
   Database.sellInventory(id,Cost,Comment)
   return response.json({'status':'ok'}, status=200)

@app.post('/del-inventory')
async def deleteInventory(request):
    Database.delInventory(request.json.get('id'))
    return response.json({'response':'OK'}, status = 200)

@app.get('/inventory')
async def inventoryPage(request):
    Data = {}
    inventory = Database.getInventory()
    if inventory:
        Data['Inventory'] = inventory
        Data['lenInventory'] = len(inventory)
    Data['InventoryTypes'] = Database.getInventoryTypes()
    template = env.get_template('inventory.html')
    return response.html(template.render(data = Data))

@app.post('/inventory')
async def add_inventory(request):
    name = request.form.get('name')
    type = request.form.get('type')
    rented = request.form.get('rented')
    size = request.form.get('size')
    Database.addInventory(name,type,rented,size)
    return response.json('OK', status=200)
#endregion

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)

