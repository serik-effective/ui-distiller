# Раскрытие с обратным растяжением

Source: https://www.odysseeclinic.com.au/about

## What is interesting

Рамка изображения расширяется, внутреннее изображение компенсирует сжатие; после раскрытия начинается мягкий параллакс.

## Behavior

Рамка изображения расширяется, внутреннее изображение компенсирует сжатие; после раскрытия начинается мягкий параллакс. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Прокрутка

## Implementation

Компонент source scaleX: outer .8→1, inner1.2→1 от top bottom до top center; затем yPercent0→20 от top top до bottom top. Word reveal opacity0/y10, duration1s/stagger.04/expo.out.

## Distilled implementation

Изолированный экран с той же парой transformOrigin. Native progress + IntersectionObserver для слов; изображения и текст нейтральные.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.outerStart = .8; CONFIG.innerStart = 1.2; CONFIG.parallax = 20; --word-stagger = 40ms

## Fidelity

approximate

Источник применяет desktop breakpoint; демо сохраняет мягкий эффект на мобильном. Различаются размер секции и медиа.

## Difficulty

Medium

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 8.503 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
