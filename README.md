# QR Generator

> A full-stack web application for generating, customizing, and managing QR codes with user authentication and history.

---

## 🇬🇧 English

### Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Programming Principles](#programming-principles)
- [Design Patterns](#design-patterns)
- [Refactoring Techniques](#refactoring-techniques)

---

### Overview

QR Generator is a Node.js/Express web application that allows authenticated users to generate QR codes for a variety of data types, customize their appearance, save them to a personal history, and download them as PNG images.

---

### Features

- **10 QR code types:** URL, Wi-Fi, Email, Phone, vCard, SMS, Geolocation, Calendar Event, Social Media, Plain Text
- **Visual customization:** foreground/background color pickers, adjustable size and margin, optional logo overlay
- **User accounts:** registration and login with bcrypt-hashed passwords, session-based auth
- **History management:** view, delete individual entries, clear all history, regenerate from history
- **UX extras:** light/dark theme toggle, PNG download, geolocation auto-fill, social link preview

---

### Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Runtime    | Node.js (ESM modules)                           |
| Server     | Express 4                                       |
| Auth       | express-session + bcryptjs                      |
| Database   | SQLite3                                         |
| Frontend   | Vanilla JS (ES modules), HTML5, CSS3            |
| QR engine  | qrcode.js (client-side via CDN)                 |

---

### Project Structure

```
├── server/
│   ├── app.js                      # Express entry point, all routes
│   ├── controllers/
│   │   └── authController.js       # Login / register request handlers
│   ├── services/
│   │   └── authService.js          # Business logic: validation, bcrypt hashing
│   ├── models/
│   │   ├── userModel.js            # User DB queries
│   │   └── qrModel.js              # QR code CRUD DB queries
│   └── db/
│       └── db.js                   # SQLite singleton + schema initialization
│
├── client/
│   ├── html/
│   │   ├── index.html              # Main app page
│   │   ├── login.html              # Login page
│   │   └── register.html          # Registration page
│   ├── css/
│   │   ├── style.css               # Main styles + theme variables
│   │   └── auth.css                # Auth page styles
│   └── js/
│       ├── script.js               # Main app logic and UI controller
│       ├── theme.js                # Light/dark theme toggle
│       ├── login.js                # Login form handler
│       ├── register.js             # Register form handler
│       ├── factories/
│       │   └── QrStrategyFactory.js
│       ├── generators/
│       │   ├── BaseQrStrategy.js
│       │   ├── UrlQrStrategy.js
│       │   ├── WifiQrStrategy.js
│       │   ├── EmailQrStrategy.js
│       │   ├── PhoneQrStrategy.js
│       │   ├── VCardQrStrategy.js
│       │   ├── SmsQrStrategy.js
│       │   ├── GeoQrStrategy.js
│       │   ├── EventQrStrategy.js
│       │   ├── SocialQrStrategy.js
│       │   └── TextQrStrategy.js
│       ├── renderers/
│       │   └── QrCanvasRenderer.js
│       ├── utils/
│       │   ├── dateUtils.js
│       │   ├── htmlUtils.js
│       │   └── wifiUtils.js
│       └── validators/
│           └── validators.js
│
├── database.db
├── package.json
└── package-lock.json
```

---

### Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

#### Installation

```bash
cd FinalProjectKPZ
npm install
npm start
```

The app will be available at **http://localhost:3000**

For development with auto-restart:

```bash
npm run dev
```

#### First use

1. Open http://localhost:3000
2. Click **Register** and create an account
3. Log in and start generating QR codes
4. Generated codes are saved to your history automatically

---

### API Reference

| Method   | Endpoint        | Auth | Description                       |
|----------|-----------------|------|-----------------------------------|
| `POST`   | `/api/register` | No   | Create a new user account         |
| `POST`   | `/api/login`    | No   | Log in and start a session        |
| `POST`   | `/api/logout`   | Yes  | Destroy current session           |
| `GET`    | `/api/me`       | Yes  | Get current user info             |
| `POST`   | `/api/qr`       | Yes  | Save a generated QR code          |
| `GET`    | `/api/qr`       | Yes  | Get current user's QR history     |
| `DELETE` | `/api/qr/:id`   | Yes  | Delete a specific QR code entry   |
| `DELETE` | `/api/qr`       | Yes  | Clear all QR history for the user |

---

### Programming Principles

#### 1. Single Responsibility Principle (SRP)

Every file handles exactly one concern. [`authService.js`](server/services/authService.js) is responsible only for authentication business logic (password hashing, credential validation). [`qrModel.js`](server/models/qrModel.js) handles only database queries for QR codes. [`QrCanvasRenderer.js`](client/js/renderers/QrCanvasRenderer.js) is responsible only for drawing the QR code and logo onto a canvas element.

#### 2. Open/Closed Principle (OCP)

The QR generation system is open for extension but closed for modification. Adding a new QR type requires only creating a new class that extends [`BaseQrStrategy.js`](client/js/generators/BaseQrStrategy.js) and registering it in [`QrStrategyFactory.js`](client/js/factories/QrStrategyFactory.js) — no existing code needs to be changed.

#### 3. DRY — Don't Repeat Yourself

Shared validation logic lives in one place: [`validators.js`](client/js/validators/validators.js) exports `isValidUrl`, `isValidEmail`, `isValidLatitude`, `isValidLongitude` and they are imported and reused across multiple strategy classes (`UrlQrStrategy`, `VCardQrStrategy`, `GeoQrStrategy`, `SocialQrStrategy`) instead of being duplicated. Wi-Fi string escaping is centralized in [`wifiUtils.js`](client/js/utils/wifiUtils.js).

#### 4. Separation of Concerns

The project is clearly split into layers: routing (`app.js`) → controllers (`authController.js`) → services (`authService.js`) → models (`userModel.js`, `qrModel.js`) → database (`db.js`). On the frontend, UI logic (`script.js`), QR generation strategies (`generators/`), rendering (`renderers/`), utilities (`utils/`), and validators (`validators/`) are kept in separate modules.

#### 5. Fail Fast

Validation happens at the earliest possible point. Each strategy's `validate()` method runs before `buildPayload()` is ever called, so invalid input never reaches the QR generation step. On the server side, [`authService.js`](server/services/authService.js) checks for duplicate logins and minimum password length before touching the database.

#### 6. Encapsulation

Each QR type encapsulates all knowledge about its own format: how to build the payload, how to validate inputs, and how to parse a raw payload back into form fields. This logic is hidden inside each strategy class and not exposed to the rest of the application.

---

### Design Patterns

#### 1. Strategy

**Files:** [`BaseQrStrategy.js`](client/js/generators/BaseQrStrategy.js), [`UrlQrStrategy.js`](client/js/generators/UrlQrStrategy.js), [`WifiQrStrategy.js`](client/js/generators/WifiQrStrategy.js), [`EmailQrStrategy.js`](client/js/generators/EmailQrStrategy.js), and all other files in `client/js/generators/`

**Why:** There are 10 different QR code types, each with its own payload format, validation rules, and field parsing logic. The Strategy pattern lets each type define its own behaviour (`buildPayload`, `validate`, `parsePayload`, `getLabel`) while the main UI controller (`script.js`) interacts with all of them through the same interface — it never needs to know which specific type it is working with. Adding a new QR type does not require touching any existing code.

#### 2. Factory

**File:** [`QrStrategyFactory.js`](client/js/factories/QrStrategyFactory.js)

**Why:** The UI controller needs to get the correct strategy object for a given type string (e.g. `"wifi"`, `"url"`). The Factory centralizes strategy creation and lookup in one place. The rest of the code calls `QrStrategyFactory.getStrategy(type)` and receives the right object without knowing how strategies are instantiated or stored.

#### 3. Singleton

**File:** [`db.js`](server/db/db.js)

**Why:** The application must have exactly one open connection to the SQLite database across its entire lifetime. The `Database` class uses a `static instance` check to ensure only one instance is ever created. All models import and share the same database connection, preventing resource leaks and connection conflicts.

---

### Refactoring Techniques

#### 1. Extract Method

Long blocks of logic were broken out into focused, named functions. For example, Wi-Fi string escaping/unescaping (`escapeWifiValue`, `unescapeWifiValue`, `parseWifiPayload`) was extracted into [`wifiUtils.js`](client/js/utils/wifiUtils.js), date formatting into [`dateUtils.js`](client/js/utils/dateUtils.js), and HTML sanitization into [`htmlUtils.js`](client/js/utils/htmlUtils.js).

#### 2. Extract Class

The canvas drawing logic (rendering the QR image, overlaying a rounded logo, loading images as Promises) was extracted from the main script into a dedicated [`QrCanvasRenderer`](client/js/renderers/QrCanvasRenderer.js) class. This made `script.js` shorter and the renderer independently reusable.

#### 3. Replace Conditional with Polymorphism

The original approach would require a large `if/else` or `switch` block in the main script to handle each of the 10 QR types differently. This was replaced with the Strategy pattern: each type has its own class, and the conditional is reduced to a single `QrStrategyFactory.getStrategy(type)` call.

#### 4. Introduce Parameter Object

Instead of passing many individual fields into QR generation functions, all form values are collected into a single `formData` object that is passed to `strategy.validate(formData)`, `strategy.sanitize(formData)`, and `strategy.buildPayload(formData)`. This keeps method signatures clean and consistent across all strategies.

#### 5. Move Method to Appropriate Layer

Authentication logic that originally could have lived inside the route handler was moved to [`authService.js`](server/services/authService.js), and all database access was moved to [`userModel.js`](server/models/userModel.js) and [`qrModel.js`](server/models/qrModel.js). Each layer has a single, clear responsibility.

#### 6. Replace Magic Literals with Named Constants

Raw values that carry domain meaning were replaced with named constants. Examples: `SALT_ROUNDS = 10` in [`authService.js`](server/services/authService.js), `MAX_SSID_LENGTH = 32` and `MAX_WIFI_PASSWORD_LENGTH = 63` in [`WifiQrStrategy.js`](client/js/generators/WifiQrStrategy.js), `GEO_COORDINATE_PRECISION = 6` in [`GeoQrStrategy.js`](client/js/generators/GeoQrStrategy.js), `ALLOWED_PROTOCOLS` in [`UrlQrStrategy.js`](client/js/generators/UrlQrStrategy.js).

---
---

## 🇺🇦 Українська

### Зміст

- [Огляд](#огляд)
- [Функціональність](#функціональність)
- [Технологічний стек](#технологічний-стек)
- [Структура проєкту](#структура-проєкту)
- [Запуск проєкту](#запуск-проєкту)
- [API](#api)
- [Принципи програмування](#принципи-програмування)
- [Патерни проєктування](#патерни-проєктування)
- [Техніки рефакторингу](#техніки-рефакторингу)

---

### Огляд

QR Generator — це повноцінний веб-застосунок на Node.js/Express, що дозволяє авторизованим користувачам генерувати QR-коди для різних типів даних, налаштовувати їх зовнішній вигляд, зберігати в особистій історії та завантажувати у форматі PNG.

---

### Функціональність

- **10 типів QR-кодів:** URL, Wi-Fi, Email, Телефон, vCard, SMS, Геолокація, Подія календаря, Соцмережі, Текст
- **Візуальне налаштування:** кольори переднього плану і фону, розмір, відступи, накладення логотипу
- **Облікові записи:** реєстрація та вхід з bcrypt-хешуванням, сесійна автентифікація
- **Управління історією:** перегляд, видалення окремих записів, очищення всієї історії, повторна генерація
- **Додатковий UX:** перемикач теми, завантаження PNG, автозаповнення геокоординат, превʼю соцпосилання

---

### Технологічний стек

| Рівень         | Технологія                                  |
|----------------|---------------------------------------------|
| Рантайм        | Node.js (ESM-модулі)                        |
| Сервер         | Express 4                                   |
| Автентифікація | express-session + bcryptjs                  |
| База даних     | SQLite3                                     |
| Фронтенд       | Vanilla JS (ES-модулі), HTML5, CSS3         |
| QR-рушій       | qrcode.js (на клієнті через CDN)            |

---

### Структура проєкту

```
├── server/
│   ├── app.js                      # Точка входу Express, маршрути
│   ├── controllers/
│   │   └── authController.js       # Обробники запитів реєстрації/входу
│   ├── services/
│   │   └── authService.js          # Бізнес-логіка: валідація, хешування
│   ├── models/
│   │   ├── userModel.js            # SQL-запити для користувачів
│   │   └── qrModel.js              # CRUD-запити для QR-кодів
│   └── db/
│       └── db.js                   # Singleton SQLite + ініціалізація схеми
│
├── client/
│   ├── html/
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   ├── css/
│   │   ├── style.css
│   │   └── auth.css
│   └── js/
│       ├── script.js
│       ├── theme.js
│       ├── login.js
│       ├── register.js
│       ├── factories/
│       │   └── QrStrategyFactory.js
│       ├── generators/
│       │   ├── BaseQrStrategy.js
│       │   ├── UrlQrStrategy.js
│       │   ├── WifiQrStrategy.js
│       │   ├── EmailQrStrategy.js
│       │   ├── PhoneQrStrategy.js
│       │   ├── VCardQrStrategy.js
│       │   ├── SmsQrStrategy.js
│       │   ├── GeoQrStrategy.js
│       │   ├── EventQrStrategy.js
│       │   ├── SocialQrStrategy.js
│       │   └── TextQrStrategy.js
│       ├── renderers/
│       │   └── QrCanvasRenderer.js
│       ├── utils/
│       │   ├── dateUtils.js
│       │   ├── htmlUtils.js
│       │   └── wifiUtils.js
│       └── validators/
│           └── validators.js
│
├── database.db
├── package.json
└── package-lock.json
```

---

### Запуск проєкту

#### Вимоги

- [Node.js](https://nodejs.org/) версії 18 або вище

#### Встановлення

```bash
cd FinalProjectKPZ
npm install
npm start
```

Застосунок буде доступний за адресою **http://localhost:3000**

Для розробки з автоматичним перезапуском:

```bash
npm run dev
```

#### Перший запуск

1. Відкрийте http://localhost:3000
2. Натисніть **Реєстрація** та створіть обліковий запис
3. Увійдіть та починайте генерувати QR-коди
4. Згенеровані коди автоматично зберігаються в історії

---

### API

| Метод    | Ендпоінт        | Авт. | Опис                                   |
|----------|-----------------|------|----------------------------------------|
| `POST`   | `/api/register` | Ні   | Створення нового облікового запису     |
| `POST`   | `/api/login`    | Ні   | Вхід та створення сесії                |
| `POST`   | `/api/logout`   | Так  | Завершення поточної сесії              |
| `GET`    | `/api/me`       | Так  | Дані поточного користувача             |
| `POST`   | `/api/qr`       | Так  | Збереження згенерованого QR-коду       |
| `GET`    | `/api/qr`       | Так  | Історія QR-кодів користувача           |
| `DELETE` | `/api/qr/:id`   | Так  | Видалення конкретного запису           |
| `DELETE` | `/api/qr`       | Так  | Очищення всієї історії                 |

---

### Принципи програмування

#### 1. Single Responsibility Principle (SRP) — Принцип єдиної відповідальності

Кожен файл відповідає рівно за одну задачу. [`authService.js`](server/services/authService.js) містить лише бізнес-логіку автентифікації (хешування паролів, перевірка облікових даних). [`qrModel.js`](server/models/qrModel.js) — лише запити до БД для QR-кодів. [`QrCanvasRenderer.js`](client/js/renderers/QrCanvasRenderer.js) — лише малювання QR-коду та логотипу на canvas.

#### 2. Open/Closed Principle (OCP) — Принцип відкритості/закритості

Система генерації QR-кодів відкрита для розширення, але закрита для змін. Додавання нового типу QR потребує лише створення нового класу-нащадка [`BaseQrStrategy.js`](client/js/generators/BaseQrStrategy.js) та реєстрації в [`QrStrategyFactory.js`](client/js/factories/QrStrategyFactory.js) — жоден існуючий файл змінювати не потрібно.

#### 3. DRY — Don't Repeat Yourself (Не повторюйся)

Спільна логіка валідації зосереджена в одному місці: [`validators.js`](client/js/validators/validators.js) експортує `isValidUrl`, `isValidEmail`, `isValidLatitude`, `isValidLongitude` — і ці функції імпортуються та перевикористовуються в кількох класах стратегій (`UrlQrStrategy`, `VCardQrStrategy`, `GeoQrStrategy`, `SocialQrStrategy`) замість того, щоб дублюватись. Утиліти для Wi-Fi рядків зосереджені в [`wifiUtils.js`](client/js/utils/wifiUtils.js).

#### 4. Separation of Concerns — Розділення відповідальностей

Проєкт чітко розділений на шари: маршрутизація (`app.js`) → контролери → сервіси → моделі → БД. На фронтенді UI-логіка (`script.js`), стратегії генерації (`generators/`), рендеринг (`renderers/`), утиліти (`utils/`) та валідатори (`validators/`) знаходяться в окремих модулях.

#### 5. Fail Fast — Падай якнайшвидше

Валідація відбувається якнайраніше. Метод `validate()` кожної стратегії викликається до `buildPayload()`, тому некоректні дані ніколи не доходять до етапу генерації QR-коду. На сервері [`authService.js`](server/services/authService.js) перевіряє дублікати логінів та мінімальну довжину паролю до звернення до БД.

#### 6. Encapsulation — Інкапсуляція

Кожен тип QR-коду інкапсулює всі знання про свій формат: як побудувати payload, як валідувати поля, як розпарсити сирий рядок назад у форму. Ця логіка прихована всередині класу стратегії і не виставляється назовні.

---

### Патерни проєктування

#### 1. Стратегія (Strategy)

**Файли:** [`BaseQrStrategy.js`](client/js/generators/BaseQrStrategy.js), [`UrlQrStrategy.js`](client/js/generators/UrlQrStrategy.js), [`WifiQrStrategy.js`](client/js/generators/WifiQrStrategy.js), [`EmailQrStrategy.js`](client/js/generators/EmailQrStrategy.js) та всі інші файли в `client/js/generators/`

**Навіщо:** В застосунку є 10 типів QR-кодів, кожен з власним форматом payload, правилами валідації та логікою парсингу полів. Патерн Стратегія дозволяє кожному типу визначати власну поведінку (`buildPayload`, `validate`, `parsePayload`, `getLabel`), тоді як головний UI-контролер взаємодіє з усіма через єдиний інтерфейс. Додавання нового типу не потребує змін у жодному існуючому файлі.

#### 2. Фабрика (Factory)

**Файл:** [`QrStrategyFactory.js`](client/js/factories/QrStrategyFactory.js)

**Навіщо:** UI-контролер має отримувати потрібний об'єкт стратегії за рядком типу (`"wifi"`, `"url"` тощо). Фабрика централізує створення та пошук стратегій в одному місці. Решта коду викликає `QrStrategyFactory.getStrategy(type)` і отримує потрібний об'єкт, не знаючи деталей інстанціювання.

#### 3. Одинак (Singleton)

**Файл:** [`db.js`](server/db/db.js)

**Навіщо:** Застосунок повинен мати рівно одне відкрите підключення до SQLite протягом усього часу роботи. Клас `Database` використовує перевірку `static instance`, щоб гарантувати створення лише одного екземпляра. Всі моделі імпортують та спільно використовують одне підключення, запобігаючи витокам ресурсів.

---

### Техніки рефакторингу

#### 1. Виділення методу (Extract Method)

Довгі блоки логіки були розбиті на сфокусовані іменовані функції. Екранування рядків Wi-Fi (`escapeWifiValue`, `unescapeWifiValue`, `parseWifiPayload`) виділено в [`wifiUtils.js`](client/js/utils/wifiUtils.js), форматування дат — у [`dateUtils.js`](client/js/utils/dateUtils.js), санітизація HTML — у [`htmlUtils.js`](client/js/utils/htmlUtils.js).

#### 2. Виділення класу (Extract Class)

Логіка малювання на canvas (рендеринг QR-зображення, накладення округленого логотипу, завантаження зображень як Promise) була виділена з головного скрипта в окремий клас [`QrCanvasRenderer`](client/js/renderers/QrCanvasRenderer.js). Це зменшило `script.js` і зробило рендерер незалежно перевикористовуваним.

#### 3. Заміна умовного оператора поліморфізмом (Replace Conditional with Polymorphism)

Початковий підхід потребував би великого `if/else` або `switch` для обробки 10 типів QR по-різному. Це замінено патерном Стратегія: кожен тип має власний клас, а умовна логіка зведена до одного виклику `QrStrategyFactory.getStrategy(type)`.

#### 4. Введення об'єкта-параметра (Introduce Parameter Object)

Замість передачі багатьох окремих полів у функції генерації, всі значення форми збираються в єдиний об'єкт `formData`, який передається в `strategy.validate(formData)`, `strategy.sanitize(formData)` та `strategy.buildPayload(formData)`. Це робить сигнатури методів чистими та однаковими для всіх стратегій.

#### 5. Переміщення методу у відповідний шар (Move Method to Appropriate Layer)

Логіка автентифікації перенесена з маршрут-обробника в [`authService.js`](server/services/authService.js), а доступ до БД — у [`userModel.js`](server/models/userModel.js) та [`qrModel.js`](server/models/qrModel.js). Кожен шар має єдину чітку відповідальність.

#### 6. Заміна магічних літералів іменованими константами (Replace Magic Literals with Named Constants)

Значення з доменним змістом замінені на іменовані константи: `SALT_ROUNDS = 10` у [`authService.js`](server/services/authService.js), `MAX_SSID_LENGTH = 32` і `MAX_WIFI_PASSWORD_LENGTH = 63` у [`WifiQrStrategy.js`](client/js/generators/WifiQrStrategy.js), `GEO_COORDINATE_PRECISION = 6` у [`GeoQrStrategy.js`](client/js/generators/GeoQrStrategy.js), `ALLOWED_PROTOCOLS` у [`UrlQrStrategy.js`](client/js/generators/UrlQrStrategy.js).