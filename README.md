# Survey courses backend - NestJS + TypeScript + TypeORM

## Цель проекта

Бэкенд, предоставляющий данные о курсах и опросы для записи на них.

## Задачи

- [ ] Информация о курсах
- [X] CRUD опросов
- [ ] Система регистрации и авторизации по почте
- [ ] Swagger документация
- [ ] Загрузка изображений
- [ ] Api key защита
- [ ] Защита от тротлинга
- [ ] CRUD ответов
- [ ] Создание pdf документа по ответам
- [ ] Тесты для сервисов

## Технологии

- **TypeScript** — статическая типизация для повышения надёжности кода
- **NestJS** — фреймворк для построения серверных приложений
- **TypeORM** — ORM для работы с базой данных
- **MariaDB** — реляционная база данных
- **Passport.js + JWT** — аутентификация и авторизация
- **Nodemailer + Handlebars** — отправка писем с шаблонами
- **Argon2** — хэширование паролей и токенов
- **Swagger** — документация API
- **Docker** — контейнеризация БД и почтового сервера

## Установка

1. Клонировать репозиторий
```bash
git clone 
cd survey-courses-backend
```

2. Установить зависимости
```bash
npm install
```

3. Создать `.env` файл по образцу `.env.example`

Для генерации JWT секретов выполните команду дважды (для `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET`):

```bash
node -e "console.log(require('crypto').randomBytes(256).toString('base64'))"
```

4. Запустить БД и почтовый сервер через Docker
```bash
docker-compose up -d
```

### Режим разработки

5. Запустить приложение
```bash
npm run start:dev
```

### Продакшен

5. Скомпилировать приложение
```bash
npm run build
```

6. Запустить приложение
```bash
npm run start
```

API сервера доступен по адресу: `http://{HOST}:{PORT}/api/v1`  
Swagger документация доступна по адресу: `http://{HOST}:{PORT}/api/v1/docs`

## Структура БД

| Таблица | Описание |
|---|---|
| users | Пользователи |
| user-child | Дети пользователя |
| email_verifications | Коды подтверждения почты |
| refresh_sessions | Сессии refresh токенов |
| lessons | Занятия |
| surveys | Опросы |
| questions | Вопросы опроса |
| question_options | Варианты ответов |
| applications | Заявки на занятия |
| answers | Ответы на вопросы заявки |

## Структура проекта

```
src/
├── auth/                  — авторизация и аутентификация
├── users/                 — пользователи
├── lessons/               — занятия
├── surveys/               — опросы, вопросы, варианты ответов
├── applications/          — заявки и ответы
├── mail/                  — отправка писем
└── common/                — общие утилиты, guards, декораторы

.env.example
docker-compose.yml
tsconfig.json
package.json
```