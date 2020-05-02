import React from 'react';
import { hot } from 'react-hot-loader/root';
import { MainNavigation } from './MainNavigation';
import { ErrorNotification } from './ErrorNotification';

export const App = hot(({ children }: { children?: React.ReactNode }) => (
  <div>
    <MainNavigation />
    { children }
    <ErrorNotification />
  </div>
));
