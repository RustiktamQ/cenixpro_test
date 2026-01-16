# Тестовое

Скрин странички и парс её данных

### Установка

```bash
npm i
```

В качестве линтера используется prettier

### Запуск

#### Часть 1

```bash
npm run start:part1 -- <ссылка> <название_региона>
```

Примеры

```bash
npm run start:part1 -- https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202 "Санкт-Петербург и область"
```

```bash
npm run start:part1 -- https://www.vprok.ru/product/lavazza-kofe-lavazza-1kg-oro-zerno--450647 "Калужская обл."
```

---

#### Часть 2

```bash
npm run start:part2 -- <ссылка_на_категорию>
```

Примеры

```bash
npm run start:part2 -- https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory
```

```bash
npm run start:part2 -- https://www.vprok.ru/catalog/1401/frukty
```
