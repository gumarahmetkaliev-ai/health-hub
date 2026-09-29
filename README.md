# Health Hub

Публичный health-tech сайт без обязательной регистрации.

## Разделы

- Dashboard
- Medications — личные напоминания (не назначения)
- Water
- Activity
- First Aid — справочник с источниками NHS / Red Cross / CDC / WHO / Mayo Clinic
- AI Assistant — объяснения терминов, без диагноза и рецептов
- History + очистка localStorage

## Стек

Next.js 15, TypeScript, React 19, Tailwind CSS 4.

Данные MVP хранятся в `localStorage`. Ключ ИИ только server-side: `OPENAI_API_KEY`.

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Экстренные номера Казахстана: **103** скорая, **112** единый номер.

Приложение не является медицинской услугой и не заменяет врача.
