# Редакционная лента с фокусом

Source: https://www.odysseeclinic.com.au/

## What is interesting

Прогресс выбирает карточки по очереди; неактивные уходят в полупрозрачность, наведение переключает выбор.

## Behavior

Прогресс выбирает карточки по очереди; неактивные уходят в полупрозрачность, наведение переключает выбор. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Таймер + наведение / focus / клик

## Implementation

Why-секция source: GSAP scaleX progress duration=5×number slides, floor(progress×count) выбирает активную карту, таймер повторяется. Native scroll только закрепляет секцию center center с pinSpacing false. Выбор карточки НЕ управляется прокруткой.

## Distilled implementation

Четыре карточки, одна шкала rAF времени, hover/focus seek; Space/кнопка ставят таймер на паузу, reduced motion оставляет ручной выбор.

## Key techniques

pointer, interaction; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.seconds = 5; --inactive-opacity = .10; --fade-duration = 300ms

## Fidelity

approximate

Вынесен сам sequencer без pin-секции. Нейтральные иллюстрации; на мобильном сохраняется доступ к каждой кнопке.

## Difficulty

Medium

## Tags

pointer, interaction

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 4.760 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
