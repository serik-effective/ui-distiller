# Odyssée — разбор интерфейса

URL: https://www.odysseeclinic.com.au/

Analyzed: 2026-10-08 · 3 pages · 7 candidates · 3 distilled

Pages: /, /treatments, /about

## Design language

Светлый тёплый фон, тонкие линии, синий текст, крупная serif-типографика и асимметричная сетка. Полноэкранное hero video, затем медиа с большим количеством воздуха.

## Motion language

Media outer scaleX .8→1 и inner1.2→1 при scroll. После раскрытия yPercent0→20. Заголовки opacity0/y10, duration1s и stagger40ms. Drawer translateY−100%, 1200ms expo-out; backdrop500ms. Why-лента меняет активную карточку каждые5s.

## Interaction philosophy

Превью в меню помогает выбрать раздел. Hover и focus связаны с активной карточкой. Таймер Why-секции автономный; scroll только закрепляет блок. Это важное различие: видимый progress bar не означает scroll playhead.

## Technology observations

Подтверждены Next.js/React, GSAP/ScrollTrigger/SplitText, Lenis, Tailwind class syntax и Base UI Drawer в MainMenuClient. Canvas на трёх проверенных страницах отсутствует; крупное hero — video/DOM.

## Canvas and scroll census

| Canvas / page | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| /, /treatments, /about | canvas отсутствует | — | 0% | — | DOM/video; отдельного WebGL-эффекта нет |

window, homepage 8840px. Lenis смягчает scroll. Counterstretch scrubbed по положению медиа; editorial focus — временной timeline duration5×slides с restart. Pin секции не равен scrub таймера.

## Best patterns

| # | Pattern | Score | Difficulty |
|---|---|---|---|
| 01 | [Меню с контекстным превью](patterns/01-context-drawer/index.html) | 4.2 | Medium |
| 02 | [Раскрытие с обратным растяжением](patterns/02-counterstretch-reveal/index.html) | 4.2 | Medium |
| 03 | [Редакционная лента с фокусом](patterns/03-timed-editorial-focus/index.html) | 3.9 | Medium |

## Patterns

### 01 — Меню с контекстным превью

Панель падает сверху справа, фон размывается. Наведение на пункт меняет изображение и короткое описание. [Механизм и параметры](patterns/01-context-drawer/README.md).

### 02 — Раскрытие с обратным растяжением

Рамка изображения расширяется, внутреннее изображение компенсирует сжатие; после раскрытия начинается мягкий параллакс. [Механизм и параметры](patterns/02-counterstretch-reveal/README.md).

### 03 — Редакционная лента с фокусом

Прогресс выбирает карточки по очереди; неактивные уходят в полупрозрачность, наведение переключает выбор. [Механизм и параметры](patterns/03-timed-editorial-focus/README.md).

## What makes this site special

Рамка и вложенное медиа меняют масштаб в противоположных направлениях; sidebar совмещает навигацию и короткую справку; backdrop размывает и обесцвечивает фон; у активной карточки виден текст, у остальных только очень слабый контур; timer pausing видео связано с активностью карточки; повторяющиеся easing и сетка держат переходы спокойными.

## Notes and limits

Пройдены три страницы; формы консультации не отправлялись. В автоматическом inspect была одна transient ошибка загрузки; повторная ручная сессия дала zero pageerrors. Hero video и брендовая графика не переносились. Drawer без gesture dismiss, editorial focus в демо не закреплён, layout и imagery нейтральные.

Все три демо: approximate; clean-room code, нейтральная графика, без сети. Это изучение механик, не копия сайта. [Проверка](../../docs/verification.md).
