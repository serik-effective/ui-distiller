# Индекс заменяет сцену

Source: https://patmos.studio/about/

## What is interesting

Контент уходит в темноту, затем на той же сцене появляются ссылки индекса. Закрытие возвращает исходный вид.

## Behavior

Контент уходит в темноту, затем на той же сцене появляются ссылки индекса. Закрытие возвращает исходный вид. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Клик по Index / Escape

## Implementation

Nu() в патмос-бандле: сначала #swup opacity0 за .5s power2.out, затем пункты меню opacity1 за .8s; Lenis останавливается, aria-hidden/expanded обновляются, Escape закрывает. Это смена видимости, не выезд панели.

## Distilled implementation

Асинхронный crossfade Web Animations .5/.8s, очередь обратного действия во время анимации, inert фон, focus trap и возврат фокуса.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.out = 500; CONFIG.in = 800

## Fidelity

approximate

Шрифт и композиция нейтральные; меню источника занимает узкую строку сверху, демо увеличивает межстрочное пространство для чтения.

## Difficulty

Medium

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 4.617 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
