# Дуга превращается в карточку

Source: https://yaas-energy.com/

## What is interesting

Лента с перспективой сначала прокручивается по дуге, затем центральная карточка раскрывается на весь экран.

## Behavior

Лента с перспективой сначала прокручивается по дуге, затем центральная карточка раскрывается на весь экран. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Прокрутка

## Implementation

HomePage.js: pinned screen2-arc, scroll span 3.4 viewport, первая фаза 62%, затем enlargement центральной карты; ±24° rotateY, perspective 2.62 ширины и проектированные боковые границы предотвращают наложение.

## Distilled implementation

CSS 3D transforms + измерение проектированной ширины. Девять нейтральных карточек и две фазы native scroll; выбранная карта раскрывается, соседние размываются.

## Key techniques

navigation, motion; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.perspective = 2.62; CONFIG.angle = 24; CONFIG.depth = .7; CONFIG.drift = 4; CONFIG.gap = .06

## Fidelity

approximate

Сокращена длина ленты и число проходов. Макет исходного фото заменён абстрактной графикой.

## Difficulty

Hard

## Tags

navigation, motion

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 16.317 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. После двух раундов подбора:16.726 →16.534 →16.317; в кадре остались5 карточек. [Протокол проверки](../../../../docs/verification.md).
