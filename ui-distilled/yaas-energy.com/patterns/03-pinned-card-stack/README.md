# Карточки уходят из стопки

Source: https://yaas-energy.com/

## What is interesting

Каждая карточка поднимается за край экрана с небольшим поворотом, открывая следующую.

## Behavior

Каждая карточка поднимается за край экрана с небольшим поворотом, открывая следующую. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Прокрутка

## Implementation

scenario-cards-iso: GSAP pin/scrub, верхние карты y=-115%, чередующийся поворот ±7°, fade в последние 35% каждого шага.

## Distilled implementation

Sticky-контейнер; native scroll разбит на три этапа. Для каждого слоя вычисляются transform и opacity.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.exit = 115; CONFIG.angle = 7; CONFIG.fadeStart = .65

## Fidelity

approximate

Отличаются изображения, типографика и кривая сглаживания scroll scrub.

## Difficulty

Medium

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 15.632 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
