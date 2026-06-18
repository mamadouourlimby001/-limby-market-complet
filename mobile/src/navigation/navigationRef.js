import { createNavigationContainerRef } from '@react-navigation/native';

// Permet de naviguer depuis l'extérieur de l'arbre React (ex: intercepteur axios sur 401),
// équivalent mobile de `window.location.href = '/login'` côté web.
export const navigationRef = createNavigationContainerRef();

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Compte', state: { routes: [{ name: 'Login' }] } }],
    });
  }
}
