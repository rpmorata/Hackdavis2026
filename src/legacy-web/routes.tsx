import { createBrowserRouter } from 'react-router';
import { Welcome } from './pages/Welcome';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Session } from './pages/Session';
import { Medication } from './pages/Medication';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { PaletteShowcase } from './pages/PaletteShowcase';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Welcome,
  },
  {
    path: '/palettes',
    Component: PaletteShowcase,
  },
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  {
    Component: Layout,
    children: [
      { path: '/home', Component: Home },
      { path: '/session', Component: Session },
      { path: '/medication', Component: Medication },
      { path: '/profile', Component: Profile },
    ],
  },
]);