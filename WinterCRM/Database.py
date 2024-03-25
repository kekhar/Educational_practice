import sqlite3
from datetime import datetime, timedelta
import json

class Database:
    def StartDataBase():
        with sqlite3.connect("database.db") as conn:
            conn.execute("""CREATE TABLE IF NOT EXISTS Clients (
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        FIO TEXT NOT NULL,
                        Pledge TEXT NOT NULL,
                        DataDocument TEXT NOT NULL,
                        PhoneNumber TEXT NOT NULL
                     )
                 """)
            
            conn.execute("""CREATE TABLE IF NOT EXISTS WinterInventoryTypes (
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL
                     )
                 """)
            
            data_to_insert = [
                ("Сноуборд",),
                ("Ботинки",),
                ("Лыжи",),
                ("г/л Ботинки",),
                ("Шлема",),
                ("Лыжные Чехлы",),
                ("Маски",),
                ("Палки",)
            ]
            
            for item in data_to_insert:
                cursor = conn.execute("SELECT ID FROM WinterInventoryTypes WHERE Name = ?", item).fetchone()
                if not cursor:
                    conn.execute("INSERT OR IGNORE INTO WinterInventoryTypes (Name) VALUES (?)", item)

            conn.execute("""CREATE TABLE IF NOT EXISTS WinterInventory (
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL,
                        Type INTEGER NOT NULL,
                        Rented TEXT NOT NULL,
                        Size INTEGER,
                        Sold BOOLEAN,
                        FOREIGN KEY (ID) REFERENCES WinterInventoryTypes (Type)
                     )
                 """)
            conn.execute("""CREATE TABLE IF NOT EXISTS Consumables(
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL,
                        Cost INTEGER NOT NULL,
                        Left INTEGER NOT NULL
            )
            """)
            conn.execute("""CREATE TABLE IF NOT EXISTS Shop(
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        ConsumableId INTEGER NOT NULL,
                        Date DATE,
                        FOREIGN KEY (ID) REFERENCES Consumables (ConsumableId)
            )
            """)
            conn.execute("""CREATE TABLE IF NOT EXISTS SoldInventory (
                        ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        InventoryID INT NOT NULL,
                        Cost INT NOT NULL,
                        Comment TEXT,
                        FOREIGN KEY (ID) REFERENCES WinterInventory (InventoryID)
                     )
                 """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS Employees (
                    ID INTEGER PRIMARY KEY,
                    Name TEXT NOT NULL
                )
            """)
            data_to_employees = [
                ("Малинкин Кирилл",)
            ]

            for item in data_to_employees:
                cursor = conn.execute("SELECT ID FROM Employees WHERE Name = ?", item).fetchone()
                if not cursor:
                    conn.execute("INSERT OR IGNORE INTO Employees (Name) VALUES (?)", item)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS Tasks (
                    ID INTEGER PRIMARY KEY,
                    Task TEXT NOT NULL,
                    Performer INT NOT NULL,
                    DateCreate DATE,
                    Status TEXT DEFAULT 'Ожидает' CHECK(Status IN ('в Работе', 'Выполнено', 'Ожидает')),
                    Color TEXT,
                    FOREIGN KEY (ID) REFERENCES Employees (Performer)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS Work_status (
                    ID INTEGER PRIMARY KEY,
                    Status TEXT NOT NULL
                )
            """)
            data_to_insert = [
                ("Работает",),
                ("Больничный",),
                ("Отпуск",)
            ]

            for item in data_to_insert:
                cursor = conn.execute("SELECT ID FROM Work_status WHERE Status = ?", item).fetchone()
                if not cursor:
                    conn.execute("INSERT OR IGNORE INTO Work_status (Status) VALUES (?)", item)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS Employee_schedule (
                    ID INTEGER PRIMARY KEY,
                    Employee_id INTEGER NOT NULL,
                    Date DATE NOT NULL,
                    Status_id INTEGER NOT NULL,
                    FOREIGN KEY (ID) REFERENCES Employees (Employee_id),
                    FOREIGN KEY (ID) REFERENCES Work_status (Status_id)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS Rents (
                    ID INTEGER PRIMARY KEY,
                    Start_Date DATE NOT NULL,
                    Start_Time TIME NOT NULL,
                    Return_Date DATE,
                    Return_Time TIME,
                    StartItemsJSON TEXT NOT NULL,
                    ReturnedItemsJSON TEXT,
                    Client INT NOT NULL,
                    Deposit TEXT NOT NULL,
                    COST INT NOT NULL,
                    IsPayed BOOLEAN NOT NULL,
                    PaymentMethod TEXT,
                    FOREIGN KEY (ID) REFERENCES Clients (Client)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS Service (
                    ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Creation_Date DATE not null,
                    Client_Id INT,
                    Inventory_Id INT not null,
                    Task text not null,
                    Parts int,
                    Cost int,
                    IsPayed BOOLEAN,
                    Status TEXT DEFAULT 'Ожидает' CHECK(Status IN ('в Работе', 'Выполнено', 'Ожидает')),
                    FOREIGN KEY (ID) REFERENCES Clients (Client_Id),
                    FOREIGN KEY (ID) REFERENCES WinterInventory (Inventory_Id)
                )
            """)
    
    def sellConsumable(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE Consumables SET Left = Left - 1 WHERE id = ?", (id,))
            conn.execute("INSERT INTO Shop (ConsumableId, Date) VALUES (?,?)", (id,datetime.now().date(),))

    def CheckInventoryStatuses():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM WinterInventory")
            Inventory = cursor.fetchall()
            current_datetime = datetime.now()
            for i in Inventory:
                ClosestRentStart = datetime.now() + timedelta(days=99999)
                ClosestRentStartPrev = ClosestRentStart
                cursor = conn.execute(f"SELECT * FROM Rents WHERE StartItemsJSON LIKE '%\"ID\": {i[0]}%'")
                if ClosestRentStartPrev == ClosestRentStart:
                        conn.execute(f"UPDATE WinterInventory SET Rented = 'Свободно' WHERE ID = '{i[0]}'")
                for Rent in cursor.fetchall():
                    StartDateTime = datetime.strptime(Rent[1] + ' ' + Rent[2], '%Y-%m-%d %H:%M')
                    ReturnDateTime = datetime.strptime(Rent[3] + ' ' + Rent[4], '%Y-%m-%d %H:%M')
                    if ReturnDateTime < current_datetime:
                        continue
                    elif StartDateTime < current_datetime and ReturnDateTime > current_datetime:
                        conn.execute(f"UPDATE WinterInventory SET Rented = 'В аренде до {ReturnDateTime}' WHERE ID = '{i[0]}'")
                        break
                    elif StartDateTime > current_datetime and ClosestRentStart > StartDateTime:
                        ClosestRentStart = StartDateTime
                    
                    if ClosestRentStartPrev != ClosestRentStart:
                        conn.execute(f"UPDATE WinterInventory SET Rented = 'Свободно до {ClosestRentStart}' WHERE ID = '{i[0]}'")
                
    def getConsumableById(id):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Consumables WHERE id = ?", (id,))
            row = cursor.fetchone()
            if not row:
                return None

            output = {
                "ID": row[0],
                "Name": row[1],
                "Cost": row[2],
                "Left": row[3]
            }

            cursor = conn.execute("SELECT Count() FROM Shop WHERE ConsumableId = ?", (id,))
            sold_count = cursor.fetchone()

            if sold_count:
                output["Sold"] = sold_count[0]
            else:
                output["Sold"] = 0

            return output
        
    def addConsumable(id, howMany):
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE Consumables SET Left = Left + ? WHERE id = ?", (howMany, id))
            conn.commit()
        return
    
    def addConsumableType(name, cost):
        with sqlite3.connect("database.db") as conn:
           conn.execute("INSERT INTO Consumables (Name, Cost, Left) VALUES (?, ?, ?)", (name, cost, 0))
        return
    
    def delConsumable(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("DELETE FROM Consumables WHERE ID = ?", (id,))
            conn.commit()

    def getConsumables():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Consumables")
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            for row in rows:
                output.append({
                    "ID" : row[0],
                    "Name": row[1],
                    "Cost" : row[2],
                    "Left" : row[3]})
            
            for consumable in output:
                cursor = conn.execute("SELECT Count() FROM Shop WHERE ConsumableId = ?",(consumable["ID"],))
                rows = cursor.fetchone()
                if not rows:
                    return output
                rows = [row for row in rows]
                consumable["Sold"] = rows[0]
            return output

    def getClientRents(id):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Rents WHERE Client = ?",(id,))
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            for row in rows:
                output.append({
                    "ID" : row[0],
                    "Start_Date" : datetime.strptime(row[1], "%Y-%m-%d"),
                    "Return_Date" : datetime.strptime(row[2], "%Y-%m-%d"),
                    "StartItemsJSON" : row[3],
                    "ReturnedItemsJSON" : row[4],
                    "Client" : Database.GetClientById(row[5]),
                    "Deposit" : row[6],
                    "Cost" : row[7],
                    "IsPayed" : row[8]})
            return output

    def getClients():
        with sqlite3.connect("database.db") as conn:
           cursor = conn.execute("SELECT * FROM Clients")
           rows = cursor.fetchall()
           if not rows:
               return None
           rows = [row for row in rows]
           output = []
           for row in rows:
               output.append({
                   "ID" : row[0],
                   "FIO" : row[1],
                   "Pledge" : row[2],
                   "Documents" : row[3],
                   "PhoneNumber" : row[4]})
           return output

    def delClientById(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("DELETE FROM Clients WHERE ID = ?", (id,))
            conn.commit()

    def updateClient(id, FIO, Pledge, DataDocument, PhoneNumber):
        with sqlite3.connect("database.db") as conn:
            conn.execute(f"UPDATE Clients SET FIO = ?, Pledge = ?, DataDocument = ?, PhoneNumber = ? WHERE ID = {id}", (FIO, Pledge, DataDocument, PhoneNumber,))
    def addClient(fio,pledge, documents, phone_number):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Clients (FIO, Pledge, DataDocument, PhoneNumber) VALUES (?,?,?,?)", (fio, pledge, documents, phone_number,))
            conn.commit()

            newid = cursor.lastrowid
        return newid

    def getInventoryTypes():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT ID, Name FROM WinterInventoryTypes")
            rows = cursor.fetchall()
            output = []
            if rows:
                rows = [row for row in rows]
                for row in rows:
                    output.append({
                        "ID" : row[0],
                        "Name" : row[1]})
                return output
            return None
        
    def addInventory(name:str, type: int, rented: bool, size: int):
        with sqlite3.connect("database.db") as conn:
            conn.execute("INSERT INTO WinterInventory (Name, Type, Rented, Size, Sold) VALUES (?,?,?,?,?)", (name, type, 'Свободно', size, False,))
            conn.commit()

    def sellInventory(id, Cost, Comment):
        with sqlite3.connect("database.db") as conn:
            conn.execute("INSERT INTO SoldInventory (InventoryID,Cost,Comment) VALUES (?,?,?)", (id, Cost, Comment,))
            conn.execute("UPDATE WinterInventory SET Sold = True WHERE ID = ?", (id,))
            conn.commit()

    def delInventory(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("DELETE FROM WinterInventory WHERE ID = ?", (id,))
            conn.commit()

    def getInventoryById(id):
        Database.CheckInventoryStatuses()
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM WinterInventory WHERE NOT Sold = True AND ID = ?",(id,))
            rows = cursor.fetchone()
            if not rows:
                return None
            rows = [row for row in rows]
            output = {}
            
            cursor = conn.execute("SELECT Name FROM WinterInventoryTypes WHERE ID = ?", (rows[2],))
            services = Database.getServicesForInventory(rows[0])
            output={
                "ID" : rows[0],
                "Name" : rows[1],
                "Type" : cursor.fetchone()[0],
                "Rented":rows[3],
                "Size" : rows[4],
                "Services": services if services else None
                }
            return output
    def addEmployee(Name):
        with sqlite3.connect("database.db") as conn:
            conn.execute("INSERT INTO Employees (Name) Values(?)",(Name,))
    def getInventory():
        Database.CheckInventoryStatuses()
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM WinterInventory WHERE NOT Sold = True")
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            for row in rows:
                cursor = conn.execute("SELECT Name FROM WinterInventoryTypes WHERE ID = ?", (row[2],))
                services = Database.getServicesForInventory(row[0])
                output.append({
                    "ID" : row[0],
                    "Name" : row[1],
                    "Type" : cursor.fetchone()[0],
                    "Rented" : row[3],
                    "Size" : row[4],
                    "Services": services if services else None})
            #print(output)
            output.reverse()
            return output
            
    
    def addClientDocument(id, documentdict):
        ClientDocs = Database.GetClientById(id)['Documents']
        list(ClientDocs).append(documentdict)
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE Clients SET Documents = ? WHERE ID = ?",(ClientDocs, id,))

    def GetClientById(id):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Clients WHERE ID = ?",(id,))
            rows = cursor.fetchone()
            if not rows:
                return None
            client = {
                "ID" : rows[0],
                "FIO" : rows[1],
                "Pledge" : rows[2],
                "DataDocument": rows[3],
                "PhoneNumber" : rows[4]
            }
            return client

    def addRent(Start_Date, Start_Time, Return_Date, Return_Time, StartItems:list, ReturnedItems:list, Client:int, Deposit:str, Cost:int, IsPayed:bool, paymentMethod: str):
        itemsdump = []
        for item in StartItems:
            itemsdump.append(Database.getInventoryById(item))
        with sqlite3.connect("database.db") as conn:
            for item in StartItems:
                conn.execute("UPDATE WinterInventory SET Rented = ? WHERE ID = ?",(True,item,))
            conn.execute("INSERT INTO Rents (Start_Date, Start_Time, Return_Date, Return_Time, StartItemsJSON, ReturnedItemsJSON, Client, Deposit, Cost, IsPayed, paymentMethod) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (Start_Date, Start_Time, Return_Date, Return_Time, json.dumps(itemsdump), json.dumps(ReturnedItems), Client, Deposit, Cost, IsPayed, paymentMethod))
        return
    
    def updateRent(ID, Return_Date, Return_Time, ReturnedItems, paymentMethod, IsPayed, Cost):
        itemsdump = []
        for item in ReturnedItems:
            itemsdump.append(Database.getInventoryById(item))
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE Rents SET Return_Date = ?, Return_Time = ?, ReturnedItemsJSON = ?, paymentMethod = ?, IsPayed = ?, Cost = ? WHERE ID = ?",(Return_Date, Return_Time, json.dumps(itemsdump), paymentMethod, IsPayed, Cost, ID))
        return
    
    def getRentsWithParams(IsExpired:bool, Search:str):
         with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Rents")
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            current_date = datetime.now()
            for row in rows:
                if row[6]:
                    returnedItems = json.loads(row[6])
                returnedItemsLen = 0
                if returnedItems:
                   returnedItemsLen = len(returnedItems)
                return_datetime = datetime.strptime(f"{row[3]} {row[4]}", "%Y-%m-%d %H:%M")
                output.append({
                    "ID" : row[0],
                    "Start_Date" : row[1],
                    "Start_Time" : row[2],
                    "Return_Date" : row[3],
                    "Return_Time" : row[4],
                    "StartItems" : json.loads(row[5]),
                    "StartItemsCount" : len(json.loads(row[5])),
                    "ReturnedItems" : returnedItems,
                    "ReturnedItemsCount" : returnedItemsLen,
                    "Client" : Database.GetClientById(row[7]),
                    "Deposit" : row[8],
                    "Cost" : row[9],
                    "IsPayed" : row[10],
                    "Expired": return_datetime < current_date,
                    "paymentMethod" : row[11]
                    })
                
            return output
         
    def countShopsByDate():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT Date, COUNT(*) FROM Shop GROUP BY Date")
            data = cursor.fetchall()
        return data

    def countRentsByDate():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT Start_Date, COUNT(*) FROM Rents GROUP BY Start_Date")
            data = cursor.fetchall()
        return data
    
    
    def getRents():
         with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Rents")
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            current_date = datetime.now()
            for row in rows:
                if row[6]:
                    returnedItems = json.loads(row[6])
                returnedItemsLen = 0
                if returnedItems:
                   returnedItemsLen = len(returnedItems)
                try:
                    return_datetime = datetime.strptime(f"{row[3]} {row[4]}", "%Y-%m-%d %H:%M")
                except:
                    try:
                        return_datetime = datetime.strptime(f"{row[3]} {row[4]}", "%Y-%m-%d %H:%M:%S")
                    except:
                        return_datetime = datetime.now() + timedelta(days=1)
                output.append({
                    "ID" : row[0],
                    "Start_Date" : row[1],
                    "Start_Time" : row[2],
                    "Return_Date" : row[3],
                    "Return_Time" : row[4],
                    "StartItems" : json.loads(row[5]),
                    "StartItemsCount" : len(json.loads(row[5])),
                    "ReturnedItems" : returnedItems,
                    "ReturnedItemsCount" : returnedItemsLen,
                    "Client" : Database.GetClientById(row[7]),
                    "Deposit" : row[8],
                    "Cost" : row[9],
                    "IsPayed" : row[10],
                    "Expired": return_datetime < current_date,
                    "paymentMethod" : row[11]
                    })
            return output
         
    def SetInventoryStatus(id,status):
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE WinterInventory SET Rented = ? WHERE id = ?",(status,id,))
            
    def getStaffName():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT Name FROM Employees ")
            rows = cursor.fetchall()
            if rows:
                rows = [row[0] for row in rows]
                return rows
            return None
    
    def getStaffAll():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Employees ")
            rows = cursor.fetchall()
            output = []
            if rows:
                for row in rows:
                    output.append({
                        'ID':row[0],
                        'Name':row[1]
                    })
                return output
            return None
    
    def UpdateServicePayment(id:int,IsPayed:bool):
        with sqlite3.connect("database.db") as conn:
            conn.execute("UPDATE Service SET IsPayed = ? WHERE ID = ?",(IsPayed,id,))
            
    def getDaySchedule(idEmployee:int, date: str):
        with sqlite3.connect("database.db") as conn:
            rows = conn.execute("SELECT Status_id FROM Employee_schedule WHERE Employee_id = ? AND Date = ?",(idEmployee,date,)).fetchone()
            if rows:
                return str(rows[0])
            return None
            

    def putSchedule(idEmployee: int, date: str, idStatus: int):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.cursor()

            # Проверяем, существует ли запись с заданными значениями Employee_id и Date
            cursor.execute("SELECT Employee_id FROM Employee_schedule WHERE Employee_id = ? AND Date = ?;", (idEmployee, date))
            existing_record = cursor.fetchone()

            if existing_record:
                # Если запись существует, обновляем ее
                cursor.execute("UPDATE Employee_schedule SET Status_id = ? WHERE Employee_id = ? AND Date = ?;", (idStatus, idEmployee, date))
            else:
                # Если запись не существует, вставляем новую
                cursor.execute("INSERT INTO Employee_schedule (Employee_id, Date, Status_id) VALUES (?, ?, ?);", (idEmployee, date, idStatus))

    def getIdEployee(name: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT ID FROM Employees WHERE Name = ?", (name,))
            row = cursor.fetchone()
            if row:
                return row[0]
            return None
    def DelEmployee(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("DELETE FROM Employees WHERE ID = ?",(id,))
    def getIdWorkStatus(status: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT ID FROM Work_status WHERE Status = ?", (status,))
            row = cursor.fetchone()
            if row:
                return row[0]
            return None
        
    def getScheduleForEmployees(id: int):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Employee_schedule WHERE Employee_id = ?", (id,))
            rows = cursor.fetchall()
            if rows:
                result = []
                for row in rows:
                    schedule_id, employee_id, date, status_id = row
                    # Получите имя сотрудника и значение статуса по их id из соответствующих таблиц
                    cursor.execute("SELECT name FROM Employees WHERE id = ?", (employee_id,))
                    employee_name = cursor.fetchone()[0]
                    cursor.execute("SELECT status FROM Work_status WHERE id = ?", (status_id,))
                    status_value = cursor.fetchone()[0]
                    result.append((schedule_id, employee_name, date, status_value))
                return result
            return None
        
    def getTasksAll():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Tasks")
            rows = cursor.fetchall()
            output = []
            if rows:
                for row in rows:
                    Employee = conn.execute("SELECT ID,NAME FROM Employees WHERE ID = ?",(row[2],)).fetchone()
                    output.append({
                        "ID": row[0],
                        "Task": row[1],
                        "Performer" : {"ID":Employee[0],"Name":Employee[1]},
                        "DateCreate" : row[3],
                        "Status" : row[4],
                        "Color" : row[5]
                    })
                return output
            return None
    
    def getTasksForEmployees(idEmployee: int):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Tasks WHERE Employee_id = ?", (idEmployee,))
            rows = cursor.fetchall()
            if rows:
                return rows
            return None
    
    def delTask(idTask: int):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("DELETE FROM Tasks WHERE ID = ?", (idTask,))

    def createTask(task: str, idEployees: int, datecreate: str, color: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("INSERT INTO Tasks (Task, Performer, DateCreate, Color)VALUES (?, ?, ?, ?)", (task, idEployees, datecreate, color,))

    def statusPut(idTask: int, status: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("UPDATE Tasks SET Status = ? WHERE id = ?", (status, idTask))

    def createService(creating_date: str, id_client: int, id_inventory:int, task: str, parts: int, cost: int, isPayed: bool):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("INSERT INTO Service (Creation_Date, Client_Id, Inventory_Id, Task, Parts, Cost, IsPayed) VALUES (?, ?, ?, ?, ?, ?, ?);", (creating_date, id_client, id_inventory, task, parts, cost, isPayed))
    
    def updateServiceStatus(id: int, status: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("UPDATE Service SET Status = ? WHERE ID = ?; ", (status, id))

    def delService(id):
        with sqlite3.connect("database.db") as conn:
            conn.execute("DELETE FROM Service WHERE ID = ?",(id,))

    def getServicesForInventory(InventoryId):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Service WHERE Inventory_Id = ?",(InventoryId,))
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            for row in rows:
                if(row[8]!="Выполнено"):
                    output.append({
                            "ID":row[0],
                            "Creation_Date":row[1],
                            "Client_Id":row[2],
                            "Inventory_Id":row[3],
                            "Task":row[4],
                            "Parts":row[5],
                            "Cost":row[6],
                            "IsPayed":row[7]
                        })
            return output
                 
    def getService():
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Service")
            rows = cursor.fetchall()
            if not rows:
                return None
            output = []
            for row in rows:
                client = {"ID": 0, "FIO": "Нет", "Passport": "Нет", "PhoneNumber": "Нет"}
                if row[2]:
                    client = Database.GetClientById(row[2])
                if row[3]:
                    inventory = Database.getInventoryById(row[3])
                output.append({
                        "ID":row[0],
                        "Creation_Date":row[1],
                        "Client": client,
                        "Inventory": inventory,
                        "Task":row[4],
                        "Parts":row[5],
                        "Cost":row[6],
                        "IsPayed":row[7],
                        "Status":row[8]
                    })
            output.reverse()
            return output
    
    def getRentById(id):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("SELECT * FROM Rents WHERE ID = ?",(id,))
            rows = cursor.fetchall()
            if not rows:
                return None
            rows = [row for row in rows]
            output = []
            current_date = datetime.now()
            for row in rows:
                if row[6]:
                    returnedItems = json.loads(row[6])
                returnedItemsLen = 0
                if returnedItems:
                   returnedItemsLen = len(returnedItems)
                try:
                    return_datetime = datetime.strptime(f"{row[3]} {row[4]}", "%Y-%m-%d %H:%M")
                except:
                    return_datetime = datetime.now() + timedelta(days=1)
                output.append({
                    "ID" : row[0],
                    "Start_Date" : row[1],
                    "Start_Time" : row[2],
                    "Return_Date" : row[3],
                    "Return_Time" : row[4],
                    "StartItems" : json.loads(row[5]),
                    "StartItemsCount" : len(json.loads(row[5])),
                    "ReturnedItems" : returnedItems,
                    "ReturnedItemsCount" : returnedItemsLen,
                    "Client" : Database.GetClientById(row[7]),
                    "Deposit" : row[8],
                    "Cost" : row[9],
                    "IsPayed" : row[10],
                    "Expired": return_datetime < current_date,
                    "paymentMethod" : row[11]
                    })
            return output[0]
        
    def getScheduleDateAndName(name: str, date: str):
        with sqlite3.connect("database.db") as conn:
            cursor = conn.execute("""
                SELECT * FROM Employee_schedule
                JOIN Employees ON Employee_schedule.Employee_id = Employees.ID
                JOIN Work_status ON Employee_schedule.Status_id = Work_status.ID
                WHERE Employees.Name = ? AND strftime('%Y-%m', Employee_schedule.Date) = ?
                """, (name, date))
            return cursor.fetchall()
Database.StartDataBase()
Database.CheckInventoryStatuses()