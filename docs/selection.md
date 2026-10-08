# Откуда взяты сайты

Список кандидатов получен из публичных витрин [CSS Design Awards](https://www.cssdesignawards.com/) и [Awwwards](https://www.awwwards.com/). После перехода с карточки проверялся настоящий сайт: доступность, отрисовка, canvas, прокрутка и интеракции. Проверено 15 разных адресов: 12 из CSSDA и ещё 3 из Awwwards. Это ручная исследовательская выборка, не полный обход каталогов.

| Сайт | Источник | Результат отбора |
|---|---|---|
| [Yaas Energy](https://yaas-energy.com/) | [CSSDA nominee](https://www.cssdesignawards.com/sites/yaas-energy/50353/) | Выбран: связанная WebGL-сцена, перспектива, pinned cards. |
| [Patmos](https://patmos.studio/) | CSSDA | Выбран: canvas с изображениями, spring deformation, индекс и режим чтения. |
| [Odyssée](https://www.odysseeclinic.com.au/) | [Awwwards](https://www.awwwards.com/sites/odyssee) | Выбран: переносимые DOM-механики, меню с превью. |
| [Fiddle experiment](https://exp.fiddle.digital/) | CSSDA | SSL timeout из текущего окружения. |
| [Agrumea](https://www.agrumeafarm.it/en) | CSSDA | 10 canvas на раннем экране; тяжёлый загрузчик, оставлен для другого разбора. |
| [Sobha](https://sobha-privy-collection.com/) | CSSDA | HTML доступен; ранняя отрисовка ещё на вступлении. Полная механика не оценивалась. |
| [Seitaro Yamazaki](https://seitaroyamazaki.com/) | CSSDA | SSL timeout. |
| [La Revoltosa](https://larevoltosa.es/) | CSSDA | Живая страница доступна, есть grecaptcha pageerror; один запуск inspect получил ошибку навигации. Не выбрана. |
| [A24 experiment](https://a24.raviklaassens.com/) | CSSDA | SSL handshake error. |
| [Safeer template](https://safeertemplate.webflow.io/) | CSSDA | SSL timeout. |
| [EasySeller](https://www.easyseller.it/) | CSSDA | HTML200, браузерная навигация превысила20s. |
| [Zirka](https://www.zrk.technology/) | CSSDA | 2 canvas, длинная 3D-презентация. В этой выборке не выбрана. |
| [The Ride](https://arunnm.com/) | CSSDA | Проверен старт и вход; полноценная интерактивная поездка требует отдельного разбора. |
| [TWKS](https://twks.ch/en) | [Awwwards](https://www.awwwards.com/sites/twks-1) | Проверена публичная страница; не вошла в три разных типа механик. |
| [Jesper Landberg](https://jesperlandberg.com/) | [Awwwards](https://www.awwwards.com/sites/jesper-landberg-4) | Canvas обнаружен и менялся в sweep, но после10s отдельная сессия ещё показывала loader. Взят Patmos с устойчиво доступной сценой. |

Снимок загрузчика не означает, что сайт сломан. Для выбранных сайтов сделан повторный проход и дождались рабочих состояний. Ошибки сети относятся к этому запуску, а не к доступности сайта для всех посетителей.

Причины исключения эффектов и оценки лежат в `.work/candidates.md` каждого выбранного сайта.
