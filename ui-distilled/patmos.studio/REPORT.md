# Patmos — разбор интерфейса

URL: https://patmos.studio/

Analyzed: 2026-10-08 · 3 pages · 7 candidates · 3 distilled

Pages: /, /about/, /episode/

## Design language

Чёрный фон, небольшие serif-подписи, большой свободный canvas с разноразмерными изображениями. Index располагается в строке сверху; в Episode можно сменить сетку на текстовое представление.

## Motion language

Spring displacement изображения, затухание скорости и циклический перенос галереи. Crossfade контента .5s out и .8s in вместо движения панели; shader ink/glitch найден в коде, но не воспроизводился как отдельный эффект.

## Interaction philosophy

Галерея откликается на указатель и колесо мыши. Index временно заменяет сцену; настройки и маршрут Episode возвращают более привычные способы чтения. Sound Off позволяет войти без аудио.

## Technology observations

Подтверждены Astro assets, Three.js, GSAP, Swup и Lenis в полном рабочем бандле. Есть shader uniforms для pointer force, spring и damping; присутствуют CPU и GPU компоненты, поэтому не утверждается, что каждый вид страницы использует одну конкретную симуляцию.

## Canvas and scroll census

| Canvas / page | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 homepage | Three.js WebGL, live canvas | 2880×1800 | 100%, 1440×900 CSS | wheel-driven, window остаётся 0 | distilled: 01-elastic-infinite-gallery |
| /about/, /episode/ | canvas отсутствует | — | 0% | — | DOM-only страницы |

Homepage: window высотой 900px; колесо двигает виртуальную сцену, не scrollY. /episode/ — window, 7062px в Text mode. Меню останавливает Lenis.

## Best patterns

| # | Pattern | Score | Difficulty |
|---|---|---|---|
| 01 | [Упругая бесконечная галерея](patterns/01-elastic-infinite-gallery/index.html) | 4.8 | Hard |
| 03 | [Изображения ↔ текстовый индекс](patterns/03-grid-list-preview/index.html) | 4.2 | Medium |
| 02 | [Индекс заменяет сцену](patterns/02-index-crossfade/index.html) | 3.6 | Medium |

## Patterns

### 01 — Упругая бесконечная галерея

Картинка прогибается вокруг указателя и возвращается на место; лента циклически движется от колеса мыши. [Механизм и параметры](patterns/01-elastic-infinite-gallery/README.md).

### 03 — Изображения ↔ текстовый индекс

Один набор проектов переключается между сеткой изображений и компактным списком. В списке миниатюра следует за курсором. [Механизм и параметры](patterns/03-grid-list-preview/README.md).

### 02 — Индекс заменяет сцену

Контент уходит в темноту, затем на той же сцене появляются ссылки индекса. Закрытие возвращает исходный вид. [Механизм и параметры](patterns/02-index-crossfade/README.md).

## What makes this site special

Меш превращает изображение в упругую поверхность; в свободной сцене совмещаются разные масштабы и вертикальные позиции; Index заменяет основной слой без смены маршрута; Image/Text хранит выбор в localStorage; активная кнопка view disabled; текстовый режим связывает описание с preview.

## Notes and limits

Первая попытка щёлкнула Sound Off до подключения обработчика. Повторная дождалась Loading complete и дала реальные live-home/live-hover/live-wheel. Ранние снимки интро не считаются подтверждением механики галереи. В демо лента горизонтальная и равномерная: не повторены вертикальное рассеивание и разные масштабы исходной сцены. CPU triangle mesh заменяет GPU; shader glitch/ink не реализованы. FLIP view switch — добавленная интерпретация, исходник может менять layout без такого перехода.

Все три демо: approximate; clean-room code, нейтральная графика, без сети. Это изучение механик, не копия сайта. [Проверка](../../docs/verification.md).
