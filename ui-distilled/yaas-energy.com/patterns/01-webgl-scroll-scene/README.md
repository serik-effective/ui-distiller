# Объекты собираются в ряд

Source: https://yaas-energy.com/

## What is interesting

Три объёмных объекта переходят из свободной композиции в единый ряд; курсор добавляет небольшой наклон.

## Behavior

Три объёмных объекта переходят из свободной композиции в единый ряд; курсор добавляет небольшой наклон. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Прокрутка + движение курсора

## Implementation

В живом canvas подтверждён WebGL2. Scene.js: группы mesh, позиции и rotation, экспоненциальное сглаживание указателя 1−exp(−6·dt); вход и карточка товара управляются прогрессом из HomePage.js.

## Distilled implementation

Свой WebGL1-рендерер цилиндров, матрицы перспективы и освещение нормалей. Прогресс sticky-секции интерполирует позиции; procedural bands заменяют этикетки.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.tilt = 0.16; CONFIG.damping = 6; .scroll-run height = 320svh

## Fidelity

approximate

Упрощены материалы, форма и траектория входа; отсутствуют исходные текстуры и переход в карточку конкретного товара.

## Difficulty

Hard

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 7.590 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
