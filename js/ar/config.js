export const ICONS = {
  cameraOn: 'assets/ar/icons/camera-ON.svg',
  cameraOff: 'assets/ar/icons/camera-OFF.svg',
  badgeQr: 'assets/ar/icons/qr.svg',
  badgeLoading: 'assets/ar/icons/qr.svg',
};

export const STATUS_MESSAGES = {
  requestingCamera:
    'Solicitando acceso a la cámara... Por favor permite el acceso a la cámara.',
  scanning: 'Busca una carta Pokémon con la cámara.',
  paused: 'Cámara en pausa. Toca el botón para continuar.',
  startError: 'No se pudo iniciar la cámara. Usa localhost o HTTPS y acepta los permisos.',
  targetDetected: (label) => `¡Encontraste a ${label}!`,
  modelLoadError: (label) => `No se pudo cargar el modelo de ${label}.`,
  skeletonLoadError: (label) => `No se pudo cargar el esqueleto de ${label}.`,
};

export const TIMING = {
  particleGravity: 0.002,
  particleDecay: 0.95,
  pulseFadeMs: 400,
  skeletonHoldMs: 2000,
  skeletonFadeMs: 400,
};

export const DEFAULT_MODEL_SCALE = 1;
export const DEFAULT_MODEL_ROTATION = { x: Math.PI / 2, y: 0, z: 0 };
export const DEFAULT_SKELETON_ROTATION = { x: Math.PI / 2, y: 0, z: 0 };
export const IDENTITY_ROTATION = { x: 0, y: 0, z: 0 };

// Rutas de recursos (relativas a scanner.html)
export const PATHS = {
  mind: 'assets/ar/targets/pokemon.mind',
  captureSound: 'assets/ar/audio/captura.mp3',
  foundSound: 'assets/ar/audio/encontrado.mp3',
};
