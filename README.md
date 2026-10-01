# rn-users-demo

Aplicación móvil en React Native y TypeScript con autenticación simulada, sesión persistente y una lista virtualizada de 2000 usuarios obtenidos de una API pública. **El alcance de esta entrega es iOS.**

Más que la funcionalidad, el proyecto busca dejar visibles las decisiones técnicas detrás de una app pequeña: cómo se organiza el código, dónde se aísla cada tecnología y por qué se eligió frente a sus alternativas.

## Funcionalidad

- **Login** con email y contraseña. La autenticación es simulada: no hay backend.
- **Home privada** con una lista de 2000 usuarios, paginada y virtualizada.
- **Logout** que cierra la sesión y limpia los datos en memoria.
- **Sesión persistente:** al reabrir la app se restaura sin volver a iniciar sesión.
- **Estados de carga y de error** en la lista, y modo claro y oscuro según el sistema.
- **Plataforma:** iOS. El código es multiplataforma (Expo), pero esta entrega se desarrolla, prueba y distribuye solo para iOS.

## Stack y alternativas consideradas

| Necesidad | Elegido | Alternativas | Por qué se eligió |
|---|---|---|---|
| Plataforma | **Expo SDK 57** (CNG + dev builds) | React Native CLI | Menos fricción de configuración y distribución (QR, EAS Update, EAS Build), con salida a código nativo mediante `prebuild` |
| Navegación | **Expo Router** | React Navigation directo | Rutas por archivos y rutas protegidas (`Stack.Protected`) para separar login y home sin redirecciones manuales |
| Estado de servidor | **TanStack Query** | SWR, RTK Query, `useEffect` + `fetch` | Caché, paginación infinita, cancelación y estados de carga y error resueltos. RTK Query exige Redux; SWR es más liviana pero da menos control sobre la caché |
| Estado de cliente | **Context + `useReducer`** | Zustand, Redux | La sesión cambia solo en login y logout: no justifica otra dependencia |
| Lista | **FlashList 2** | FlatList, VirtualizedList | Recicla celdas en lugar de destruirlas y crearlas al hacer scroll |
| HTTP | **Axios detrás de un puerto propio** | `fetch` | Timeout, cancelación y errores normalizados. Al ir detrás de una interfaz, cambiarlo no toca los features |
| Formularios | **react-hook-form** | Formik, estado manual | Validación declarativa y menos re-renders |
| Sesión | **expo-secure-store** | AsyncStorage, `react-native-keychain` | Keychain (iOS) y Keystore (Android). AsyncStorage guarda en texto plano; `react-native-keychain` requiere código nativo propio y no corre en Expo Go |
| Interfaz | Atomic Design | Librería de componentes | Debe correr en Expo Go (solo JavaScript) y deja ver la separación entre tokens, componentes base y componentes de dominio |
| Rendimiento de render | **React Compiler** | `useMemo`, `useCallback`, `React.memo` manuales | Memoización automática; el código queda sin memoización escrita a mano |
| Tests | **Jest + React Native Testing Library** | Enzyme, solo E2E | Pruebas de comportamiento desde la perspectiva del usuario |
| Calidad estática | **ESLint + Prettier + TypeScript `strict`** | — | Las reglas de arquitectura se imponen con lint, no solo con convención |

Versiones: React Native 0.86, React 19.2 y TypeScript 6.

## Ejecutar el proyecto

Requisitos: Node 22 o superior y npm.

```bash
npm install
npx expo start
```

Desde la consola de Expo se abre la app en el simulador de iOS (`i`) o en un iPhone escaneando el QR con Expo Go.

```bash
npm run verify         # tipos, lint, formato y tests
npm test               # tests
npm run test:coverage  # tests con cobertura
npm run lint           # ESLint, incluidas las reglas de arquitectura
npm run format         # aplica Prettier
```

## Acceso a la versión ejecutable

La app se prueba **sin levantar el entorno local**, en un iPhone, con Expo Go.

<p align="center">
  <img src="docs/expo-go-qr.png" alt="QR para abrir la app en Expo Go" width="220">
</p>

```
exp://u.expo.dev/4d68cf74-e4af-4c82-9e79-9ad7e1d55f3f/group/0454d15b-f88d-4105-99a2-2b383e843a10
```

**Cómo abrirla:**

1. Instalar **Expo Go** desde la App Store.
2. Escanear el QR con la cámara del iPhone, que ofrece abrirlo en Expo Go. También se puede copiar el link de arriba y pegarlo en Safari.
3. Ingresar con el [usuario demo](#usuario-demo).

Es una versión fija (la actualización publicada el día de la entrega): el link no cambia si después se publica otra.

Requisito: la Expo Go de la App Store debe soportar el **SDK 57** de este proyecto. Hoy lo soporta, pero cuando Expo publique la versión estable del SDK siguiente, la tienda pasará a esa y dejará de abrir proyectos 57. En ese caso hay que volver a publicar la app con el SDK nuevo o probarla en el simulador de iOS.

Para publicar una nueva versión, con una cuenta de Expo:

```bash
npx eas-cli update --branch preview --platform ios --message "Demo"
```

Se eligió Expo Go (link/QR) y no un build instalable: un `.ipa` en un dispositivo requiere una cuenta de Apple Developer y TestFlight, que no hacen falta para evaluar la app.

## Usuario demo

| Campo | Valor |
|---|---|
| Email | `demo@example.com` |
| Contraseña | `Demo2026!` |

Definido en `src/features/auth/demo-user.ts`.

## Arquitectura

El código se organiza **por feature**: todo lo que pertenece a una funcionalidad vive junto y la expone mediante un `index.ts`. Cada feature podría extraerse a su propio paquete, y borrar uno es borrar una carpeta. Frente a organizar por tipo de archivo (`components/`, `hooks/`, `services/`), el cambio de una funcionalidad queda localizado.

```
src/
  app/            Rutas de Expo Router: pantallas finas que delegan en los features
  composition/    Composition root: instancia los adaptadores y arma los Providers
  features/
    auth/         Login, sesión y almacenamiento seguro
    users/        Lista de usuarios, repositorios, mapper y fixture
  shared/
    http/         Puerto HttpClient y adaptador Axios
    ui/           Design system: tokens, átomos, moléculas y plantillas
```

La dependencia fluye en un solo sentido: **`composition` → `features` → `shared`**. Un feature no conoce la composición ni a otro feature.

Dentro de un feature, el flujo es **UI → hook → repositorio (puerto) → cliente HTTP (puerto)**. Los tipos de la API (DTO) se mantienen separados de los del dominio, con un mapper en el medio.

**Esta estructura se impone con ESLint**, no solo con convención. Las reglas impiden:

- que `shared` importe de `features`, o que un feature importe la composición u otro feature;
- importar archivos internos de otra capa en lugar de su `index.ts`;
- usar `Text`, `Pressable` o `TextInput` nativos en un feature en lugar del design system;
- usar Axios, SecureStore o AsyncStorage fuera de su adaptador, y TanStack Query fuera de `*.queries.ts` y `use-*.ts`;
- que el código de producción importe dobles de prueba.

**Convenciones.** PascalCase para componentes (`UserRow.tsx`) y kebab-case con un sufijo que indica el rol para el resto (`users.repository.ts`, `user.mapper.ts`, `use-users.ts`). Los tests viven junto al código que prueban.


## Decisiones técnicas

### Inversión de dependencias: puertos y adaptadores

Los features dependen de interfaces (puertos) y no de librerías. Una única **composition root** (`composition/create-container.ts`) instancia las clases concretas y decide cómo se combinan.

El criterio es invertir en las **fronteras con el exterior**, donde algo puede cambiar o hay que simularlo en tests, y no envolver toda librería. Esas fronteras son lo que en programación se llama *I/O* (*input/output*, entrada y salida): todo lo que la app hace fuera de su propia lógica, como pedir datos por red o leer y escribir en el almacenamiento del dispositivo:

| Dependencia | ¿Se invierte? | Motivo |
|---|---|---|
| Transporte HTTP (`HttpClient`) | Sí | Es comunicación por red, y la librería puede cambiar |
| Fuente de usuarios (`UsersRepository`) | Sí | Tiene varias implementaciones: API, fixture y un decorador con fallback |
| Autenticación (`AuthRepository`) | Sí | Hoy es un mock; mañana un backend |
| Sesión (`SessionStorage`) | Sí | Es acceso al almacenamiento del dispositivo |
| TanStack Query, FlashList, expo-image | No | Son capa de UI y de estado. Cambiarlas implica reescribir semántica |
| React, Expo Router | No | Son el framework |

**Inyección por feature, no un container global.** Cada feature declara lo que necesita y lo recibe por su propio Provider. Un `useContainer()` que devuelva todo sería un *service locator*: cualquier componente podría tomar cualquier dependencia y los features dejarían de estar aislados.

Cambiar Axios por otro cliente es un archivo nuevo que implementa `HttpClient` y una línea en la composición. Se comprobó con una implementación alternativa sobre `fetch`.

### Datos: API pública, paginación y fallback

- **randomuser.me** permite paginar y fijar un `seed`: con el mismo `seed`, cada página devuelve siempre los mismos usuarios. Eso vuelve reproducible el dataset.
- **Paginación de a 100.** El primer contenido aparece rápido y no se descargan 2000 usuarios que quizás nunca se vean. El total (2000) es una constante del dominio, porque la API no informa uno.
- **Archivo local con los 2000 usuarios, usado como respaldo.** Es un servicio gratuito y sin SLA, así que se guarda un único `.json` con los 2000 usuarios (`users.fixture.json`), reducido a los campos que consume la app. La app consulta primero la API y, si falla, lee ese archivo (también por páginas de 100, para que la lista no note la diferencia). Un decorador sobre `UsersRepository` hace el cambio de forma automática. No intercepta las cancelaciones (son intencionales) ni los errores que no son de transporte: un bug propio debe verse y no quedar tapado por datos de ejemplo.
- **Transparencia.** Cada página indica su origen (`live` o `fixture`) y la UI avisa cuando muestra datos de ejemplo.
- **Frontera con la API.** Sin librería de validación de esquemas, el adaptador verifica explícitamente que la respuesta tenga resultados (la API informa sus errores dentro del cuerpo) y, si no, lanza un error tipado.

### Estado de servidor: TanStack Query

La query de usuarios se declara con funciones puras en `users.queries.ts`, y el hook `use-users.ts` las conecta con el repositorio inyectado. Ese hook expone un **modelo de vista propio** (`users`, `isPending`, `loadMore()`, `restart()`...) y no el objeto de TanStack, así la UI no depende de los tipos de la librería.

| Opción | Valor | Motivo |
|---|---|---|
| `staleTime` | `Infinity` | El dataset es inmutable (mismo `seed`): no hay nada que revalidar |
| `retry` | `false` | La resiliencia la da el fallback. Reintentar sumaría esperas antes de llegar al mismo resultado |
| `queryKey` | `["users", "list"]` | Jerárquica: permite invalidar todo lo de usuarios con `["users"]` |

Otras decisiones:

- **`loadMore()` está protegido.** Por defecto, `fetchNextPage()` cancela y reinicia la request en curso. Como el evento de fin de lista puede dispararse varias veces, una guarda deja pasar una sola.
- **"Reintentar" vuelve a la primera página** (`resetQueries`) en lugar de `refetch()`, que repetiría una a una todas las páginas ya cargadas.
- **No se cablean `focusManager` ni `onlineManager`.** Con `networkMode: "online"`, una conexión marcada como caída pausaría las queries y el fallback nunca se usaría sin conexión.
- **Al cerrar sesión se vacía la caché**, mediante un callback inyectado desde la composición: el feature de auth no conoce TanStack y el siguiente usuario no ve datos del anterior.

### Estado de cliente: Context

La sesión es un reducer con tres estados (`loading`, `unauthenticated`, `authenticated`) expuesto con dos contextos separados, uno de estado y otro de acciones: quien solo necesita las acciones (el botón de logout, el formulario) no se re-renderiza cuando el estado cambia.

Context alcanza porque la sesión cambia pocas veces. Con estado que cambie con frecuencia o con muchos consumidores, cada cambio re-renderizaría a todos; en ese escenario se evalúa una librería con suscripción selectiva, como Zustand.

### Virtualización: FlashList 2

Virtualizar es montar solo las filas cercanas a la pantalla en lugar de las 2000. La diferencia entre las opciones está en la técnica:

| | FlatList | FlashList |
|---|---|---|
| Técnica | **Ventana:** desmonta lo que se aleja y crea componentes nuevos para lo que entra | **Reciclaje:** mantiene un pool de celdas y las reutiliza con los datos de la fila que entra |
| Al hacer scroll | Crea y destruye componentes; puede mostrar celdas en blanco | Solo actualiza las props de celdas existentes |
| Ajuste | Manual (`windowSize`, `getItemLayout`...) | La v2 mide los tamaños sola |

FlashList 2 solo funciona con la New Architecture, obligatoria desde Expo SDK 55. El reciclaje impone cuidados, que el código cumple:

- las filas son presentacionales y **sin estado local**, porque una celda reutilizada podría mostrar el estado de otro ítem;
- los avatares usan `expo-image` con `recyclingKey`;
- la clave de cada fila es el `uuid` del usuario, no el índice;
- la lista nunca se anida en un `ScrollView`, porque perdería la virtualización.

### Design system: Atomic Design

Un sistema mínimo y propio en `shared/ui`, ordenado por niveles de complejidad:

| Nivel | Contenido |
|---|---|
| Tokens | Colores claro y oscuro por rol, espaciado, radios y tipografía |
| Átomos | `Text`, `Button`, `TextInput`, `Avatar`, `Spinner` |
| Moléculas | `FormField`, `Banner`, `StateMessage` |
| Plantilla | `Screen` |
| Organismos y páginas | En su feature (`UsersList`, `LoginForm`...), porque conocen el dominio |

Atomic Design ordena por complejidad y el proyecto ordena por dominio, así que se combinan: lo genérico se ordena por niveles y lo que conoce un dominio vive en su feature.

- **Tema sin librería:** `useTheme()` elige la paleta con `useColorScheme()`. Los colores se nombran por **rol** (`text`, `accent`, `danger`...) y no por valor.
- **Accesibilidad:** el contraste de todos los pares texto/fondo, en claro y oscuro, cumple WCAG AA. Los botones respetan un área táctil mínima de 44 dp, y los componentes exponen rol y estado a los lectores de pantalla.

### React Compiler

Viene habilitado en la plantilla de Expo y se mantiene. Memoiza componentes y hooks automáticamente, por eso el código no tiene `useMemo`, `useCallback` ni `React.memo`. Se comprobó en el bundle que transforma los componentes propios.

### Formularios

react-hook-form con las reglas nativas (`required`, `pattern`, `minLength`), suficientes para dos campos. No se usa una librería de esquemas: sería una dependencia sin beneficio proporcional a este alcance.

### Sesión y almacenamiento seguro

El token se guarda con `expo-secure-store`: Keychain en iOS y Keystore en Android. Se eligió `WHEN_UNLOCKED_THIS_DEVICE_ONLY` en iOS:

- el token solo se usa con la app abierta, es decir, con el equipo desbloqueado: no hay motivo para dejarlo legible con el equipo bloqueado;
- no debe migrar por backup, para que una sesión no se clone a otro teléfono. El costo es volver a iniciar sesión al cambiar de equipo, que es el comportamiento correcto;
- si la app necesitara tareas en segundo plano, se pasaría a `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.

**Diferencias entre plataformas que condicionan el diseño** (Android queda fuera del alcance de esta entrega; se documenta porque el adaptador está pensado para ambas):

| | iOS (Keychain) | Android (Keystore) |
|---|---|---|
| Respaldo en hardware | Siempre | Varía por equipo: TEE en la mayoría, StrongBox solo en algunos |
| Al reinstalar la app | Los datos **persisten** | Los datos **se borran** |
| Backup o migración | Las variantes `*_THIS_DEVICE_ONLY` no migran | El plugin de Expo excluye los datos del backup automático (sin verificar) |

No existe una tabla oficial de compatibilidad por modelo: depende de la versión del sistema y del hardware, y validarla por modelo exige dispositivos físicos. De ahí salen estas decisiones:

1. **Leer nunca rompe el arranque.** Ante un dato corrupto o un error de descifrado, el adaptador descarta la entrada y deja la sesión en `unauthenticated`.
2. **Marca de primer arranque.** Como el Keychain de iOS sobrevive a la desinstalación y AsyncStorage no, el adaptador guarda una marca en AsyncStorage: si no existe, es una instalación nueva, se limpia el Keychain y se parte sin sesión. El dominio no conoce este detalle.
3. **No se usa `requireAuthentication`:** evita las invalidaciones de clave por cambios de biometría y la limitación de Expo Go.
4. **Se guarda lo mínimo** (token y datos básicos), muy por debajo de los límites de tamaño.

Referencias: [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) · [Android Keystore](https://developer.android.com/privacy-and-security/keystore)

## Cómo se resolvió cada requisito

### Sesión y autenticación

1. **Login simulado.** `MockAuthRepository` valida contra el usuario demo con 800 ms de latencia y devuelve un token. Con credenciales incorrectas lanza un error tipado que el formulario muestra como error general.
2. **Rutas protegidas.** `Stack.Protected` hace accesible la lista solo con sesión y el login solo sin ella; el router redirige cuando cambia el estado. El splash nativo se mantiene hasta resolver si hay una sesión guardada, así no hay parpadeo de pantallas.
3. **Persistencia.** La sesión se restaura al arrancar desde el almacenamiento seguro. Si no se puede guardar, el login falla: entrar sin persistencia daría una sesión que desaparece sin explicación.
4. **Logout.** Borra la sesión, cierra el estado en memoria y vacía la caché. Aunque el borrado falle, la sesión en memoria se cierra igual.

### Lista de 2000 elementos

La estrategia combina tres decisiones:

1. **Carga por páginas con scroll infinito.** Se pide la página siguiente cuando faltan ~1,5 pantallas para el final.
2. **Virtualización con reciclaje** (FlashList), con filas sin estado y avatares preparados para el reciclaje.
3. **Filas baratas:** un avatar y dos textos de una línea, sin lógica; la memoización la resuelve el compilador.

Con la API caída o lenta, la app cae al fixture local y lo avisa; un error inesperado muestra una pantalla de error con reintento.

## Calidad

109 tests en 19 suites, con 97 % de cobertura de sentencias.

| Capa | Qué se verifica |
|---|---|
| Lógica de sesión | Transiciones del reducer y orden de las acciones (persistir antes de despachar) |
| Adaptadores | Almacenamiento seguro (incluida la reinstalación en iOS) y mapeo de errores HTTP |
| Repositorios y fallback | Cuándo se recurre al fixture y cuándo no; integridad del fixture |
| Hooks y pantallas | Estados de la lista, guarda de `loadMore`, validación del login |
| Composición | Cerrar sesión vacía la caché |

**Criterios:**

- **Dobles de prueba simples.** Se renderiza cada feature con su Provider y un repositorio falso, sin mockear módulos. El cliente HTTP se prueba inyectando un adapter falso de Axios, con el mapeo de errores real.
- **Tests que detectan regresiones.** Los más importantes se validaron rompiendo el código a propósito y comprobando que el test fallara.
- **Sin snapshots:** fijan la estructura y no el comportamiento.
- **Jest 29.7**, la versión que valida Expo SDK 57.

**Lo que los tests no cubren:** las medidas de la lista están simuladas, por lo que no validan virtualización ni rendimiento, que solo se observan en un dispositivo. Tampoco hay pruebas de extremo a extremo.

**Alcance de la verificación manual:** la app se verificó en el simulador de iOS (login, persistencia, logout, lista y fallback).

## Licencia

MIT. Ver [LICENSE](LICENSE).
