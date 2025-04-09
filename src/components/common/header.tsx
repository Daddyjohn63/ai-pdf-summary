import { FileText } from 'lucide-react';

import { Button } from '../ui/button';
import { NavLink } from './nav-link';

export const Header = () => {
  const isLoggedIn = false;
  return (
    <nav className="container flex items-center justify-between py-4 lg:px-8 px-2 mx-auto">
      <div className="flex lg:flex-1">
        <NavLink href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
          <FileText className="w-5 h-5 lg:w-8 lg:h-8 text-gray-900 hover:rotate-12 transform transition-all ease-in-out duration-200" />
          <span className="font-extrabold lg:text-xl text-gray-900">
            Sommaire
          </span>
        </NavLink>
      </div>
      <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
        <NavLink href="/#pricing">Pricing</NavLink>
        {isLoggedIn && <NavLink href="/#dashboard">Your summaries</NavLink>}
      </div>
      <div className="flex lg:justify-end lg:flex-1">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <NavLink href="/upload">Upload a pdf</NavLink>
            <div>Pro</div>
            <Button>User</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink href="/sign-up">Sign in</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};
