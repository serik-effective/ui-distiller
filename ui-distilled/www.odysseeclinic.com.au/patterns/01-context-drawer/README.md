# Меню с контекстным превью

Source: https://www.odysseeclinic.com.au/

## What is interesting

Панель падает сверху справа, фон размывается. Наведение на пункт меняет изображение и короткое описание.

## Behavior

Панель падает сверху справа, фон размывается. Наведение на пункт меняет изображение и короткое описание. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Клик Menu + наведение / focus

## Implementation

MainMenuClient: Base UI Drawer, translateY(-100%) на входе/выходе, 1200ms expo-out; backdrop blur+grayscale, opacity500ms. Peer hover меняет блок media и описания; диалог ловит фокус.

## Distilled implementation

Нативный dialog, CSS transform transition, blur backdrop, live preview по pointer/focus. Escape/клик вне панели закрывают; фокус возвращается на кнопку.

## Key techniques

pointer, interaction; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

--panel-duration = 1200ms; --backdrop-blur = 10px; --preview-duration = 220ms

## Fidelity

approximate

Нет свайпа для закрытия; превью содержит собственную графику вместо фотографий. Геометрия адаптирована под демо.

## Difficulty

Medium

## Tags

pointer, interaction

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 4.148 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
