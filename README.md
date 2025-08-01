## Description

This project is an example of an **event-driven microservices architecture** built with **NestJS** and **RabbitMQ**.  
The services communicate asynchronously through events, enabling a **loosely coupled** and scalable system.

## 🚀 Services

- **Order Service** — Manages order lifecycle (create, cancel, update status)  
- **Inventory Service** — Manages product stock, increments and decrements inventory  
- **Notification Service** — Handles notifications (mock email/SMS sending)  
- **RabbitMQ** — Message broker for inter-service communication  
- **PostgreSQL** — Persistent data storage

## 📌 Event Flow

### Order Creation
1. **Order Service** emits `order.created` event.  
2. **Inventory Service** listens and verifies stock availability.  
3. If stock is sufficient:  
   - Decrements inventory  
   - Emits `order.completed` event  
4. If stock is insufficient:  
   - Emits `order.rejected` event 
5. **Notification Service** listens to these events and sends notifications accordingly.

## ⚙️ Setup

### 1. Clone the repository
```bash
git clone https://github.com/oktaykocak/ecommerce-microservices.git
cd ecommerce-microservices

# Open the project in VS Code:
code .
```

### 2. Environment Variables (.env)
Create **.env** files for each service with necessary variables, for example:
```bash
RABBITMQ_URL=amqp://oktay:secret123@rabbitmq:5672
RABBITMQ_DEFAULT_SERVICE=inventory_service_queue
RABBITMQ_ORDER_SERVICE=order_service_queue
RABBITMQ_NOTIFICATION_SERVICE=notification_service_queue
DB_HOST=postgres
DB_PORT=5432
DB_USER=oktay
DB_PASS=secret123
DB_NAME=ecommerce_db
APP_PORT=8090
```

### 3. Start with Docker Compose
```bash
docker-compose up --build
```

### 4. Verify Running Services
1. RabbitMQ Management UI → **http://localhost:15672** (user: oktay, pass: secret123)
2. **Order Service** → **http://localhost:8080** 
3. **Inventory Service** → **http://localhost:8090** 
4. **Notification Service** → **http://localhost:8070** 

### 5. 📂 Project Structure
```bash
ecommerce-microservices/
│── order-service/
│── inventory-service/
│── notification-service/
│── docker-compose.yml
│── README.md
```

## API Endpoints

### Inventory Service

- Get all inventory  
    GET /inventories?searchTerm=ABC  
    Response:  
    ```bash
    [
        {
            "id": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
            "name": "Product 1",
            "sku": "ABC-1",
            "quantity": "15"
        }
    ...
    ]
    ```
- Get a single inventory  
    GET /inventories/:id  
    Response:  
    ```bash
    {
        "id": "a372a1bf-6781-42da-867c-03895d9ef503",
        "name": "Product 1",
        "sku": "ABC",
        "quantity": "5"
    }
    ```
- Get a single inventory with history 
    GET /inventories/histories/:id  
    Response:  
    ```bash
    {
        "id": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
        "name": "Product 1",
        "sku": "ABC-1",
        "quantity": "15",
        "history": [
            {
                "id": "87607347-f3c4-466d-94bd-fe976367c48a",
                "operationType": "STOCK_CREATED",
                "orderId": null,
                "productId": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                "newQuantity": "15",
                "oldQuantity": "0",
                "createdAt": "2025-08-01T03:09:16.201Z"
            },
            {
                "id": "73086b2c-7abc-4de6-9d74-496baed93b43",
                "operationType": "ORDER_OPERATION_COMPLETED",
                "orderId": "64ad5559-68f8-4fea-8443-cb39c8eb2578",
                "productId": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                "newQuantity": "10",
                "oldQuantity": "15",
                "createdAt": "2025-08-01T03:09:46.628Z"
            },
            {
                "id": "7042ccc7-89dc-4365-bd80-8a3ac5f9e0f6",
                "operationType": "ORDER_OPERATION_CANCELLED",
                "orderId": "64ad5559-68f8-4fea-8443-cb39c8eb2578",
                "productId": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                "newQuantity": "15",
                "oldQuantity": "10",
                "createdAt": "2025-08-01T04:09:17.844Z"
            }
        ]
    }
    ```
- Create a new inventory  
    POST /directors
    Variables
    ```bash
    {
        "id"        : UUID  (Optional),
        "name"      : String(Unique) ('name is required when id is not provided'),
        "sku"       : String(Unique) ('sku is required when id is not provided'),
        "quantity"  : Number(Required)
    }
    ```
    Response:  
    ```bash
    Request:  
    ```bash
    {
        "name":"Product 1",
        "sku": "ABC-1",
        "quantity": 15
    }
    ```
    Response:  
    ```bash
    {
        "id": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
        "name": "Product 1",
        "sku": "ABC-1",
        "quantity": 15
    }
    ```

### Notification Service

- Get customer notification preference  
    GET /notifications/:id  
    Response:  
    ```bash
    {
        "id": "b14c07e5-40d2-4f37-bcae-6721bcd7e0e6",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "emailEnabled": true,
        "email": "test",
        "smsEnabled": false,
        "phoneNumber": null,
        "pushEnabled": false,
        "deviceId": null,
        "createdAt": "2025-08-01T03:08:51.721Z"
    }
    ```
- Get customer notification preference by customer id  
    GET /notifications/customer/:id  
    Response:  
    ```bash
    {
        "id": "b14c07e5-40d2-4f37-bcae-6721bcd7e0e6",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "emailEnabled": true,
        "email": "test",
        "smsEnabled": false,
        "phoneNumber": null,
        "pushEnabled": false,
        "deviceId": null,
        "createdAt": "2025-08-01T03:08:51.721Z"
    }
    ```
- Get customer notification preference with notification history by customer id  
    GET /notifications/histories/:id  
    Response:  
    ```bash
	{
        "id": "b14c07e5-40d2-4f37-bcae-6721bcd7e0e6",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "emailEnabled": true,
        "email": "test",
        "smsEnabled": false,
        "phoneNumber": null,
        "pushEnabled": false,
        "deviceId": null,
        "createdAt": "2025-08-01T03:08:51.721Z",
        "notifications": [
            {
                "id": "7113b906-865a-47be-bc89-3c8e4a23a553",
                "recipientId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
                "type": "EMAIL",
                "message": "Order Completed",
                "status": "SENT",
                "createdAt": "2025-08-01T03:09:46.895Z"
            },
            ...
        ]
    }
    ```
- Create a customer notification preference  
    POST /notifications
    Variables
    ```bash
    {
        "id"            : UUID      (Optional),
        "customerId"    : UUID      (Required),
        "emailEnabled"  : Boolean   (Required),
        "email"         : String    (Optional) ('email is required when emailEnabled is true'),
        "smsEnabled"    : Boolean   (Required),
        "phoneNumber"   : String    (Optional) ('phoneNumber is required when smsEnabled is true'),
        "pushEnabled"   : Boolean   (Required),
        "deviceId"      : String    (Optional) ('phoneNumber is required when pushEnabled is true'),
    }
    ```  
    Request:  
    ```bash
    {
        "customerId":"4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "emailEnabled": true,
        "email": "test",
        "smsEnabled": false,
        "pushEnabled": false
    }
    ```
    Response:  
    ```bash
    {
        "id": "b14c07e5-40d2-4f37-bcae-6721bcd7e0e6",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "emailEnabled": true,
        "email": "test",
        "smsEnabled": false,
        "pushEnabled": false,
        "createdAt": "2025-08-01T03:08:51.721Z",
        "phoneNumber": null,
        "deviceId": null
    }
    ```

### Order Service
- Get all order  
    GET /orders
    Response:  
    ```bash
    [
        {
           "id": "64ad5559-68f8-4fea-8443-cb39c8eb2578",
            "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
            "status": "COMPLETED",
            "createdAt": "2025-08-01T03:09:46.425Z",
            "items": [
                {
                    "id": "052e0328-3c7f-4090-8bc0-52bda89be183",
                    "productId": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                    "quantity": 5
                },
                ...
            ]
        },
        ...
    ]
    ```

- Get a single order  
    GET /orders/:id  
    Response:  
    ```bash
    {
        "id": "5f7c372c-36c1-46c5-941c-b73125091e39",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "status": "PENDING",
        "createdAt": "2025-07-31T01:41:54.726Z",
        "items": [
            {
                "id": "def750f8-e163-4caa-9ab8-0fcf26038a4e",
                "productId": "e1a09c04-d5ef-44e7-acb8-a8f2739c2df9",
                "quantity": 1
            },
            {
                "id": "4ce80a1a-7886-446c-bf91-0497cfba8261",
                "productId": "e1a09c04-d5ef-44e7-acb8-a8f2739c2df0",
                "quantity": 3
            }
        ]
    }
    ```

- Get all order by customer id 
    GET /orders/customer/:id
    Response:  
    ```bash
    [
        {
            "id": "bdf8e0a0-4c4e-4114-b5b5-aaeed2de8311",
            "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
            "status": "PENDING",
            "createdAt": "2025-07-31T01:15:44.154Z",
            "items": [
                {
                    "id": "c50ce7bc-e49d-448f-b530-e109a4bb7408",
                    "productId": "e1a09c04-d5ef-44e7-acb8-a8f2739c2df9",
                    "quantity": 1
                },
                {
                    "id": "884d6b87-314c-4085-b41e-1cc4a45ce3ec",
                    "productId": "e1a09c04-d5ef-44e7-acb8-a8f2739c2df0",
                    "quantity": 3
                }
            ]
        },
        ...
    ]
    ```    

- Create a new order  
    PUT /orders
    Variables
    ```bash
    {
        "customerId"    : UUID  (Required),
        "items"         : Array Of Object(Required),
            "productId" : UUID  (Required),
            "quantity"  : Number(Required),
    }
    ```  
    Request:  
    ```bash
    {
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "items":[
            {
                "productId":"154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                "quantity": 5
            }
        ]
    }
    ```
    Response:  
    ```bash
    {
        "id": "64ad5559-68f8-4fea-8443-cb39c8eb2578",
        "customerId": "4010f6ba-b5b9-4c25-92e7-ed42f8ed57dc",
        "status": "PENDING",
        "createdAt": "2025-08-01T03:09:46.425Z",
        "items": [
            {
                "id": "052e0328-3c7f-4090-8bc0-52bda89be183",
                "productId": "154f5d4d-dd5c-46f1-a180-cea51ddddb4c",
                "quantity": 5
            }
        ]
    }
    ```
- Cancel a order  
    DELETE /orders/:id  
    Response:  
    ```bash
        204 No Content
    ```

## License

Project is [WTFPL licensed](https://github.com/spdx/license-list-data/blob/main/text/WTFPL.txt).
