import React from 'react';
import { getInitials, avatarColor } from '../../utils/helpers';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const s = sizes[size] || sizes.md;
  if (user?.avatar) return (
    <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ${className}`} />
  );
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-gray-800 flex-shrink-0 ${className}`}
      style={{ background: avatarColor(user?.name || '') }}>
      {getInitials(user?.name)}
    </div>
  );
};

export default Avatar;
