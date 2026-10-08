# Упругая бесконечная галерея

Source: https://patmos.studio/

## What is interesting

Картинка прогибается вокруг указателя и возвращается на место; лента циклически движется от колеса мыши.

## Behavior

Картинка прогибается вокруг указателя и возвращается на место; лента циклически движется от колеса мыши. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Наведение + колесо мыши / свайп

## Implementation

В основном Astro-бандле: Three.js, сетка изображения, исходные координаты, velocity и spring restore, radial pointer force, затухание; позиции карточек циклически переносятся. Live-home/live-hover/live-wheel фиксируют canvas после входа без звука.

## Distilled implementation

Canvas2D с аффинным отображением треугольников, упругая сетка 22×16, процедурная текстура. Отдельная инерция прокрутки и циклические координаты карточек.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.spring = .085; CONFIG.damping = .84; CONFIG.radius = 180; CONFIG.force = 40; CONFIG.columns = 22

## Fidelity

approximate

CPU Canvas2D заменяет GPU-сетку; shader glitch/ink и исходные фото не воспроизведены. Не утверждается совпадение GPU-симуляции.

## Difficulty

Hard

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 8.148 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
