# Изображения ↔ текстовый индекс

Source: https://patmos.studio/episode/

## What is interesting

Один набор проектов переключается между сеткой изображений и компактным списком. В списке миниатюра следует за курсором.

## Behavior

Один набор проектов переключается между сеткой изображений и компактным списком. В списке миниатюра следует за курсором. Проверяемое состояние и ограничения описаны в VERIFICATION.md коллекции.

## Trigger

Клик Image / Text + наведение

## Implementation

js-toggle-view изменяет data-view, отключает активную кнопку, сохраняет viewMode; ресайз и in-view обработчики пересобираются. В текстовом виде изображения позиционируются возле указателя.

## Distilled implementation

CSS grid/list с FLIP-переходом через getBoundingClientRect и Web Animations. На focus виден статичный предпросмотр, pointermove двигает его.

## Key techniques

pointer, interaction; нативный JS, автономный HTML, reduced motion, управление клавиатурой там, где есть кнопки.

## Parameters worth tuning

CONFIG.duration = 650; CONFIG.offset = 20

## Fidelity

approximate

В демо добавлен плавный FLIP; точный характер перестройки исходной страницы может быть мгновенным. Не сохраняется выбор режима между открытиями.

## Difficulty

Medium

## Tags

pointer, interaction

## Verification

2026-10-08: Chrome, file://, offline, 1440×900 и390×844; реальный trigger, тема и replay проверены; pageerrors0, внешних запросов0. Reduced-motion режим открыт отдельно.

Edges comparison full1440×900: meanAbs 8.225 /255. Это диагностическая разница снимков с разной графикой, не процент точности и не acceptance score. Композиция демо и source могут отличаться; геометрия и материалы обозначены approximate. [Протокол проверки](../../../../docs/verification.md).
